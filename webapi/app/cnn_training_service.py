import random

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from .config import CNN_LSTM_MODEL_PATH
from .dataset_service import list_training_entries
from .modeling import CNNLSTMClassifier
from .schemas import TrainConfig
from .training_service import (
    BirdAudioDataset,
    DEVICE,
    TrainingService,
    evaluate_model,
    now_str,
    split_entries_by_segments,
    try_load_checkpoint,
)


class CNNLSTMTrainingService(TrainingService):
    def bootstrap_model(self) -> None:
        lstm_model = CNNLSTMClassifier(num_classes=len(self.species)).to(DEVICE)
        try:
            if try_load_checkpoint(lstm_model, CNN_LSTM_MODEL_PATH):
                self.set_active_model(lstm_model, "CNN + LSTM", True)
                self.append_log("已加载 CNN + LSTM 权重")
                return
        except Exception as error:
            self.append_log(f"检测到旧权重但加载失败，将以未训练模型启动: {error}")

        self.set_active_model(lstm_model, "CNN + LSTM", False)
        self.append_log("未发现可用权重，请先执行训练")

    def run_training_job(self, config: TrainConfig) -> None:
        try:
            entries = list_training_entries()
            if not entries:
                raise RuntimeError("未找到可训练的标准化音频，请先准备数据集")

            if config.max_samples:
                random.Random(config.seed).shuffle(entries)
                entries = entries[: config.max_samples]

            train_entries, val_entries = split_entries_by_segments(
                entries,
                val_split=config.val_split,
                segments_per_file=config.segments_per_file,
                seed=config.seed,
            )
            train_dataset = BirdAudioDataset(train_entries, augment=True)
            val_dataset = BirdAudioDataset(val_entries, augment=False)
            train_loader = DataLoader(train_dataset, batch_size=config.batch_size, shuffle=True, num_workers=0)
            val_loader = DataLoader(val_dataset, batch_size=config.batch_size, shuffle=False, num_workers=0)

            model_ref = CNNLSTMClassifier(num_classes=len(self.species)).to(DEVICE)
            optimizer = torch.optim.AdamW(model_ref.parameters(), lr=config.learning_rate, weight_decay=1e-4)
            scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.6, patience=2)
            criterion = nn.CrossEntropyLoss(label_smoothing=0.05)

            self.state["running"] = True
            self.state["stage"] = "training"
            self.state["current_phase"] = "input"
            self.state["current_epoch"] = 0
            self.state["total_epochs"] = config.epochs
            self.state["current_batch"] = 0
            self.state["total_batches"] = len(train_loader)
            self.state["dataset_size"] = len(train_dataset)
            self.state["validation_size"] = len(val_dataset)
            self.state["split_strategy"] = "class_stratified_segments"
            self.state["history"] = {"train_loss": [], "val_loss": [], "val_accuracy": []}
            self.state["last_train_loss"] = None
            self.state["last_val_loss"] = None
            self.state["best_val_accuracy"] = None

            best_accuracy = -1.0
            best_state_dict = None
            phase_cycle = ["input", "window", "mel", "cnn", "sequence", "lstm", "head"]
            self.append_log(
                f"训练开始，按类内分层片段切分得到 {len(train_entries)} 个训练片段、{len(val_entries)} 个验证片段"
            )

            for epoch in range(1, config.epochs + 1):
                if self.stop_event.is_set():
                    self.append_log("收到停止训练指令，准备结束训练")
                    break

                model_ref.train()
                total_loss = 0.0
                total_correct = 0
                total_samples = 0

                for batch_index, (features, labels) in enumerate(train_loader, start=1):
                    if self.stop_event.is_set():
                        break

                    self.state["current_phase"] = phase_cycle[(batch_index - 1) % len(phase_cycle)]
                    self.state["current_batch"] = batch_index

                    features = features.to(DEVICE)
                    labels = labels.to(DEVICE)
                    optimizer.zero_grad()
                    logits = model_ref(features)
                    loss = criterion(logits, labels)
                    loss.backward()
                    torch.nn.utils.clip_grad_norm_(model_ref.parameters(), max_norm=1.0)
                    optimizer.step()

                    total_loss += loss.item() * labels.size(0)
                    predictions = logits.argmax(dim=1)
                    total_correct += int((predictions == labels).sum().item())
                    total_samples += int(labels.size(0))

                train_loss = total_loss / max(total_samples, 1)
                val_loss, val_accuracy = evaluate_model(model_ref, val_loader, criterion)
                scheduler.step(val_loss)

                self.state["current_epoch"] = epoch
                self.state["last_train_loss"] = train_loss
                self.state["last_val_loss"] = val_loss
                self.state["history"]["train_loss"].append(train_loss)
                self.state["history"]["val_loss"].append(val_loss)
                self.state["history"]["val_accuracy"].append(val_accuracy)

                if best_accuracy < val_accuracy:
                    best_accuracy = val_accuracy
                    best_state_dict = {key: value.detach().cpu() for key, value in model_ref.state_dict().items()}
                    self.state["best_val_accuracy"] = val_accuracy
                    torch.save(
                        {
                            "state_dict": best_state_dict,
                            "species": self.species,
                            "history": self.state["history"],
                            "timestamp": now_str(),
                        },
                        CNN_LSTM_MODEL_PATH,
                    )
                    self.append_log(
                        f"Epoch {epoch}: 已更新最佳模型，val_loss={val_loss:.4f}, val_acc={val_accuracy:.4f}"
                    )
                else:
                    self.state["best_val_accuracy"] = best_accuracy if best_accuracy >= 0 else None
                    self.append_log(
                        f"Epoch {epoch}: train_loss={train_loss:.4f}, val_loss={val_loss:.4f}, val_acc={val_accuracy:.4f}, lr={optimizer.param_groups[0]['lr']:.6f}"
                    )

            if best_state_dict is not None:
                model_ref.load_state_dict(best_state_dict)
                self.set_active_model(model_ref, "CNN + LSTM", True)
                self.append_log("训练结束，已切换到最新的 CNN + LSTM 权重")

            self.state["running"] = False
            self.state["stage"] = "stopped" if self.stop_event.is_set() else "completed"
            self.state["current_phase"] = "head"
        except Exception as error:
            self.state["running"] = False
            self.state["stage"] = "failed"
            self.append_log(f"训练失败: {error}")
        finally:
            self.stop_event.clear()
            self.thread = None


lstm_training_service = CNNLSTMTrainingService()
cnn_training_service = lstm_training_service
