import random
import tempfile
import threading
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset

from .audio_tools import (
    build_spectrogram_data_uri,
    crop_or_pad_segment,
    extract_inference_segments,
    fit_waveform_duration,
    load_audio_any,
    normalize_waveform,
    waveform_to_mel_tensor,
)
from .config import RESNET_BILSTM_MODEL_PATH, SAMPLE_RATE, SEGMENT_DURATION
from .dataset_service import list_training_entries, species_names
from .modeling import ResNet18BiLSTM, count_parameters
from .schemas import TrainConfig


DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def now_str() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


class BirdAudioDataset(Dataset):
    def __init__(self, entries: List[Tuple[Path, int, str, int]], augment: bool = False):
        self.entries = entries
        self.augment = augment

    def __len__(self) -> int:
        return len(self.entries)

    def __getitem__(self, index: int):
        file_path, label, _species_name, start_sample = self.entries[index]
        waveform = load_prepared_waveform(file_path)
        segment_samples = int(SEGMENT_DURATION * SAMPLE_RATE)
        max_start = max(0, waveform.shape[-1] - segment_samples)
        resolved_start = min(max(0, start_sample), max_start)

        if self.augment and max_start > 0:
            jitter = min(segment_samples // 4, max_start)
            lower = max(0, resolved_start - jitter)
            upper = min(max_start, resolved_start + jitter)
            resolved_start = random.randint(lower, upper) if upper > lower else lower

        segment = waveform[:, resolved_start:resolved_start + segment_samples]
        mel = waveform_to_mel_tensor(crop_or_pad_segment(segment, random_crop=False))
        return mel, label


def evaluate_model(model_ref: nn.Module, data_loader: DataLoader, criterion: nn.Module) -> Tuple[float, float]:
    model_ref.eval()
    total_loss = 0.0
    total_correct = 0
    total_samples = 0
    with torch.no_grad():
        for features, labels in data_loader:
            features = features.to(DEVICE)
            labels = labels.to(DEVICE)
            logits = model_ref(features)
            loss = criterion(logits, labels)
            total_loss += loss.item() * labels.size(0)
            predictions = logits.argmax(dim=1)
            total_correct += int((predictions == labels).sum().item())
            total_samples += int(labels.size(0))
    if total_samples == 0:
        return 0.0, 0.0
    return total_loss / total_samples, total_correct / total_samples


def try_load_checkpoint(model_ref: nn.Module, checkpoint_path: Path) -> bool:
    if not checkpoint_path.exists():
        return False
    checkpoint = torch.load(checkpoint_path, map_location=DEVICE)
    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        checkpoint = checkpoint["state_dict"]
    model_ref.load_state_dict(checkpoint, strict=True)
    model_ref.eval()
    return True


@lru_cache(maxsize=64)
def load_prepared_waveform(file_path: Path) -> torch.Tensor:
    waveform, sample_rate = load_audio_any(file_path)
    waveform, _ = normalize_waveform(waveform, sample_rate)
    return fit_waveform_duration(waveform)


def build_segment_starts(total_samples: int, segment_samples: int, clip_count: int, seed: int) -> List[int]:
    if clip_count <= 1 or total_samples <= segment_samples:
        return [0]

    max_start = max(0, total_samples - segment_samples)
    rng = random.Random(seed)
    starts: List[int] = []
    for index in range(clip_count):
        anchor = int(max_start * index / max(clip_count - 1, 1))
        jitter = min(segment_samples // 3, max_start)
        lower = max(0, anchor - jitter)
        upper = min(max_start, anchor + jitter)
        starts.append(rng.randint(lower, upper) if upper > lower else lower)
    return starts


def split_entries_by_segments(
    entries: List[Tuple[Path, int, str]],
    val_split: float,
    segments_per_file: int,
    seed: int,
) -> Tuple[List[Tuple[Path, int, str, int]], List[Tuple[Path, int, str, int]]]:
    segment_samples = int(SEGMENT_DURATION * SAMPLE_RATE)
    clip_count = max(6, segments_per_file)
    train_samples: List[Tuple[Path, int, str, int]] = []
    val_samples: List[Tuple[Path, int, str, int]] = []

    for species_index, (file_path, label, species_name) in enumerate(entries):
        waveform = load_prepared_waveform(file_path)
        starts = build_segment_starts(waveform.shape[-1], segment_samples, clip_count, seed + species_index)
        sample_indexes = list(range(len(starts)))
        random.Random(seed + species_index * 17).shuffle(sample_indexes)
        val_count = max(1, min(len(starts) - 1, int(round(len(starts) * val_split))))
        val_indexes = set(sample_indexes[:val_count])

        for index, start_sample in enumerate(starts):
            sample = (file_path, label, species_name, start_sample)
            if index in val_indexes:
                val_samples.append(sample)
            else:
                train_samples.append(sample)

    return train_samples, val_samples


class TrainingService:
    def __init__(self):
        self.lock = threading.Lock()
        self.stop_event = threading.Event()
        self.thread: Optional[threading.Thread] = None
        self.species = species_names()
        self.active_model: Optional[nn.Module] = None
        self.active_model_name = "unavailable"
        self.model_ready = False
        self.state: Dict[str, object] = {
            "running": False,
            "stage": "idle",
            "current_phase": "input",
            "current_epoch": 0,
            "total_epochs": 0,
            "current_batch": 0,
            "total_batches": 0,
            "last_train_loss": None,
            "last_val_loss": None,
            "best_val_accuracy": None,
            "history": {"train_loss": [], "val_loss": [], "val_accuracy": []},
            "logs": [],
            "model_ready": False,
            "active_model": "unavailable",
            "dataset_size": 0,
            "validation_size": 0,
            "split_strategy": "class_stratified_segments",
        }
        self.bootstrap_model()

    @property
    def parameter_count(self) -> int:
        if self.active_model is None:
            return 0
        return count_parameters(self.active_model)

    def append_log(self, message: str) -> None:
        line = f"{now_str()} | {message}"
        logs = self.state.setdefault("logs", [])
        if isinstance(logs, list):
            logs.insert(0, line)
            del logs[40:]

    def set_active_model(self, model_ref: nn.Module, name: str, ready: bool) -> None:
        self.active_model = model_ref.eval().to(DEVICE)
        self.active_model_name = name
        self.model_ready = ready
        self.state["active_model"] = name
        self.state["model_ready"] = ready

    def bootstrap_model(self) -> None:
        resnet_model = ResNet18BiLSTM(num_classes=len(self.species)).to(DEVICE)
        try:
            if try_load_checkpoint(resnet_model, RESNET_BILSTM_MODEL_PATH):
                self.set_active_model(resnet_model, "ResNet18 + BiLSTM", True)
                self.append_log("已加载 ResNet18 + BiLSTM 权重")
                return
        except Exception as error:
            self.append_log(f"检测到旧权重但加载失败，将以未训练模型启动: {error}")

        self.set_active_model(resnet_model, "ResNet18 + BiLSTM", False)
        self.append_log("未发现可用权重，请先执行训练")

    def state_snapshot(self) -> Dict[str, object]:
        payload = deepcopy(self.state)
        payload["device"] = str(DEVICE)
        payload["active_model"] = self.active_model_name
        payload["model_ready"] = self.model_ready
        payload["parameter_count"] = self.parameter_count
        return payload

    def start(self, config: TrainConfig) -> Dict[str, object]:
        with self.lock:
            if self.thread is not None and self.thread.is_alive():
                raise RuntimeError("已有训练任务正在运行")
            self.stop_event.clear()
            self.thread = threading.Thread(target=self.run_training_job, args=(config,), daemon=True)
            self.thread.start()
        return {"message": "训练任务已启动", "config": config.model_dump()}

    def stop(self) -> Dict[str, str]:
        if self.thread is None or not self.thread.is_alive():
            return {"message": "当前没有运行中的训练任务"}
        self.stop_event.set()
        return {"message": "已发送停止训练请求"}

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

            model_ref = ResNet18BiLSTM(num_classes=len(self.species)).to(DEVICE)
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
            phase_cycle = ["input", "window", "mel", "resnet", "sequence", "bilstm", "head"]
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
                        RESNET_BILSTM_MODEL_PATH,
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
                self.set_active_model(model_ref, "ResNet18 + BiLSTM", True)
                self.append_log("训练结束，已切换到最新的 ResNet18 + BiLSTM 权重")

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

    def analyze_upload_bytes(self, binary: bytes, suffix: str, threshold: float, top_k: int) -> Dict[str, object]:
        if not binary:
            raise ValueError("空文件")
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix or ".wav") as temp:
                temp.write(binary)
                tmp_path = Path(temp.name)
            waveform, sample_rate = load_audio_any(tmp_path)
        finally:
            if tmp_path and tmp_path.exists():
                try:
                    tmp_path.unlink()
                except OSError:
                    pass

        waveform, _ = normalize_waveform(waveform, sample_rate)
        return self.analyze_waveform(waveform, threshold=threshold, top_k=top_k)

    def analyze_waveform(self, waveform: torch.Tensor, threshold: float = 0.35, top_k: int = 5) -> Dict[str, object]:
        if self.active_model is None or not self.model_ready:
            raise RuntimeError("当前没有可用模型，请先训练或加载权重")

        segments = extract_inference_segments(waveform)
        probs_all = []

        self.active_model.eval()
        with torch.no_grad():
            for segment in segments:
                mel = waveform_to_mel_tensor(segment).unsqueeze(0).to(DEVICE)
                logits = self.active_model(mel)
                probs = torch.softmax(logits, dim=-1).squeeze(0).cpu().numpy()
                probs_all.append(probs)

        avg_probs = np.mean(np.stack(probs_all, axis=0), axis=0) if probs_all else np.zeros(len(self.species), dtype=np.float32)
        ranking = np.argsort(-avg_probs)
        top_indices = ranking[: max(1, top_k)]
        top_k_result = [
            {"species": self.species[index], "probability": float(avg_probs[index])}
            for index in top_indices
        ]
        max_probability = float(avg_probs[ranking[0]]) if avg_probs.size else 0.0

        result = {
            "detected": bool(max_probability >= threshold),
            "top_k": top_k_result,
            "max_probability": max_probability,
            "timestamp": now_str(),
            "active_model": self.active_model_name,
            "spectrogram": build_spectrogram_data_uri(waveform),
        }
        self.append_log(f"已完成一次推理，活跃模型: {self.active_model_name}")
        return result

bilstm_training_service = TrainingService()
training_service = bilstm_training_service