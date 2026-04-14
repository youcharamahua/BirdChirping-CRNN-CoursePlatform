import math
from typing import Dict, List

import torch
import torch.nn as nn
from torchvision.models import resnet18


def build_resnet18_backbone() -> nn.Module:
    backbone = resnet18(weights=None)
    backbone.conv1 = nn.Conv2d(
        1,
        64,
        kernel_size=(7, 7),
        stride=(2, 1),
        padding=(3, 3),
        bias=False,
    )
    backbone.maxpool = nn.MaxPool2d(kernel_size=3, stride=(2, 1), padding=1)
    return backbone


def build_cnn_temporal_frontend(output_channels: int = 256) -> nn.Module:
    return nn.Sequential(
        nn.Conv2d(1, 32, kernel_size=3, padding=1, bias=False),
        nn.BatchNorm2d(32),
        nn.ReLU(inplace=True),
        nn.MaxPool2d(kernel_size=(2, 2)),
        nn.Conv2d(32, 64, kernel_size=3, padding=1, bias=False),
        nn.BatchNorm2d(64),
        nn.ReLU(inplace=True),
        nn.MaxPool2d(kernel_size=(2, 2)),
        nn.Conv2d(64, 128, kernel_size=3, padding=1, bias=False),
        nn.BatchNorm2d(128),
        nn.ReLU(inplace=True),
        nn.MaxPool2d(kernel_size=(2, 1)),
        nn.Conv2d(128, output_channels, kernel_size=3, padding=1, bias=False),
        nn.BatchNorm2d(output_channels),
        nn.ReLU(inplace=True),
    )


class SinusoidalPositionalEncoding(nn.Module):
    def __init__(self, d_model: int, max_len: int = 512):
        super().__init__()
        position = torch.arange(max_len, dtype=torch.float32).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2, dtype=torch.float32) * (-math.log(10000.0) / d_model))
        encoding = torch.zeros(max_len, d_model, dtype=torch.float32)
        encoding[:, 0::2] = torch.sin(position * div_term)
        encoding[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer("encoding", encoding.unsqueeze(0), persistent=False)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        return inputs + self.encoding[:, : inputs.size(1)]


class CNNLSTMClassifier(nn.Module):
    def __init__(self, num_classes: int, hidden_size: int = 192):
        super().__init__()
        self.feature_extractor = build_cnn_temporal_frontend(output_channels=256)
        self.sequence_norm = nn.LayerNorm(256)
        self.temporal_encoder = nn.LSTM(
            input_size=256,
            hidden_size=hidden_size,
            num_layers=2,
            batch_first=True,
            bidirectional=False,
            dropout=0.2,
        )
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size, 192),
            nn.ReLU(inplace=True),
            nn.Dropout(0.25),
            nn.Linear(192, num_classes),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        outputs = self.feature_extractor(inputs)
        outputs = outputs.mean(dim=2)
        outputs = outputs.permute(0, 2, 1)
        outputs = self.sequence_norm(outputs)
        outputs, _ = self.temporal_encoder(outputs)
        outputs = outputs[:, -1, :]
        return self.classifier(outputs)


class ResNet18BiLSTM(nn.Module):
    def __init__(self, num_classes: int, hidden_size: int = 256, num_layers: int = 2):
        super().__init__()
        backbone = build_resnet18_backbone()
        self.feature_extractor = nn.Sequential(
            backbone.conv1,
            backbone.bn1,
            backbone.relu,
            backbone.maxpool,
            backbone.layer1,
            backbone.layer2,
            backbone.layer3,
            backbone.layer4,
        )
        self.sequence_norm = nn.LayerNorm(512)
        self.temporal_encoder = nn.LSTM(
            input_size=512,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=0.2 if num_layers > 1 else 0.0,
        )
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size * 2, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.25),
            nn.Linear(256, num_classes),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        outputs = self.feature_extractor(inputs)
        outputs = outputs.mean(dim=2)
        outputs = outputs.permute(0, 2, 1)
        outputs = self.sequence_norm(outputs)
        outputs, _ = self.temporal_encoder(outputs)
        outputs = outputs.mean(dim=1)
        return self.classifier(outputs)


class CNNTransformerClassifier(nn.Module):
    def __init__(self, num_classes: int, hidden_size: int = 256, num_heads: int = 8, num_layers: int = 2):
        super().__init__()
        self.feature_extractor = build_cnn_temporal_frontend(output_channels=hidden_size)
        self.sequence_norm = nn.LayerNorm(hidden_size)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_size,
            nhead=num_heads,
            dim_feedforward=hidden_size * 2,
            dropout=0.15,
            activation="gelu",
            batch_first=True,
            norm_first=False,
        )
        self.position_encoder = SinusoidalPositionalEncoding(hidden_size)
        self.temporal_encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size, 192),
            nn.GELU(),
            nn.Dropout(0.2),
            nn.Linear(192, num_classes),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        outputs = self.feature_extractor(inputs)
        outputs = outputs.mean(dim=2)
        outputs = outputs.permute(0, 2, 1)
        outputs = self.sequence_norm(outputs)
        outputs = self.position_encoder(outputs)
        outputs = self.temporal_encoder(outputs)
        outputs = outputs.mean(dim=1)
        return self.classifier(outputs)


class ResNet18Classifier(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        backbone = build_resnet18_backbone()
        self.feature_extractor = nn.Sequential(
            backbone.conv1,
            backbone.bn1,
            backbone.relu,
            backbone.maxpool,
            backbone.layer1,
            backbone.layer2,
            backbone.layer3,
            backbone.layer4,
        )
        self.classifier = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.25),
            nn.Linear(256, num_classes),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        outputs = self.feature_extractor(inputs)
        outputs = outputs.mean(dim=(2, 3))
        return self.classifier(outputs)


def count_parameters(model: nn.Module) -> int:
    return sum(parameter.numel() for parameter in model.parameters())


def _format_parameter_count(parameter_count: int) -> str:
    return f"{parameter_count / 1_000_000:.2f}M"


def _build_blueprint(
    *,
    title: str,
    nodes: List[Dict[str, object]],
    edges: List[Dict[str, str]],
    flow_notes: List[str],
    summary: List[Dict[str, str]],
) -> Dict[str, object]:
    return {
        "title": title,
        "nodes": nodes,
        "edges": edges,
        "flow_notes": flow_notes,
        "summary": summary,
    }


def get_lstm_model_blueprint(
    num_classes: int,
    active_model_name: str,
    model_ready: bool,
    parameter_count: int,
) -> Dict[str, object]:
    nodes: List[Dict[str, object]] = [
        {
            "id": "input",
            "title": "音频输入",
            "subtitle": "原始录音 / 上传音频",
            "x": 6,
            "y": 50,
            "width": 10,
            "tone": "source",
            "phases": ["input"],
        },
        {
            "id": "window",
            "title": "统一与切片",
            "subtitle": "90 秒标准化 -> 3 秒滑窗",
            "x": 18,
            "y": 50,
            "width": 11,
            "tone": "process",
            "phases": ["window"],
        },
        {
            "id": "mel",
            "title": "Mel 频谱图",
            "subtitle": "128 Mel bins / 时频纹理",
            "x": 30,
            "y": 50,
            "width": 10,
            "tone": "feature",
            "phases": ["mel"],
        },
        {
            "id": "cnn_low",
            "title": "CNN 卷积块 I",
            "subtitle": "局部纹理与短时模式",
            "x": 43,
            "y": 50,
            "width": 12,
            "tone": "model",
            "phases": ["cnn"],
        },
        {
            "id": "cnn_high",
            "title": "CNN 卷积块 II",
            "subtitle": "组合纹理与稳定结构",
            "x": 56,
            "y": 50,
            "width": 12,
            "tone": "model",
            "phases": ["cnn"],
        },
        {
            "id": "sequence",
            "title": "序列整理",
            "subtitle": "沿频率维压缩 -> T x 256",
            "x": 69,
            "y": 50,
            "width": 11,
            "tone": "feature",
            "phases": ["cnn", "sequence", "lstm"],
        },
        {
            "id": "lstm",
            "title": "LSTM",
            "subtitle": "单向记忆链读取时间顺序",
            "x": 82,
            "y": 50,
            "width": 10,
            "tone": "model",
            "phases": ["lstm"],
        },
        {
            "id": "head",
            "title": "分类头",
            "subtitle": f"Dropout + Linear -> {num_classes} 类",
            "x": 94,
            "y": 50,
            "width": 9,
            "tone": "result",
            "phases": ["head"],
        },
    ]
    edges = [
        {"from": "input", "to": "window"},
        {"from": "window", "to": "mel"},
        {"from": "mel", "to": "cnn_low"},
        {"from": "cnn_low", "to": "cnn_high"},
        {"from": "cnn_high", "to": "sequence"},
        {"from": "sequence", "to": "lstm"},
        {"from": "lstm", "to": "head"},
    ]
    return _build_blueprint(
        title="CNN + LSTM 教学结构图",
        nodes=nodes,
        edges=edges,
        flow_notes=[
            "输入先统一为 90 秒单声道，再按 3 秒窗口切片，保证训练与验证都落在一致长度上。",
            "Mel 频谱图进入轻量 CNN 卷积前端，先提取局部纹理，再把高层特征整理成时间序列。",
            "LSTM 负责沿时间方向逐步保留有效记忆，帮助模型理解一段鸟鸣内部的先后顺序。",
            "最后由分类头输出结果，下方同步显示训练曲线、日志与上传推理反馈。",
        ],
        summary=[
            {"label": "活跃模型", "value": active_model_name},
            {"label": "模型类型", "value": "CNN + LSTM"},
            {"label": "卷积前端", "value": "4 层轻量 CNN"},
            {"label": "时序编码", "value": "2 层单向 LSTM"},
            {"label": "参数规模", "value": _format_parameter_count(parameter_count)},
            {"label": "模型状态", "value": "已就绪" if model_ready else "等待训练"},
        ],
    )


def get_bilstm_model_blueprint(
    num_classes: int,
    active_model_name: str,
    model_ready: bool,
    parameter_count: int,
) -> Dict[str, object]:
    nodes: List[Dict[str, object]] = [
        {
            "id": "input",
            "title": "音频输入",
            "subtitle": "原始录音 / 上传音频",
            "x": 6,
            "y": 50,
            "width": 9,
            "tone": "source",
            "phases": ["input"],
        },
        {
            "id": "window",
            "title": "统一与切片",
            "subtitle": "90 秒标准化 -> 3 秒滑窗",
            "x": 16,
            "y": 50,
            "width": 10,
            "tone": "process",
            "phases": ["window"],
        },
        {
            "id": "mel",
            "title": "Mel 频谱图",
            "subtitle": "128 Mel bins / 时频纹理",
            "x": 27,
            "y": 50,
            "width": 10,
            "tone": "feature",
            "phases": ["mel"],
        },
        {
            "id": "stem",
            "title": "ResNet18 Stem",
            "subtitle": "Conv1 + BN + ReLU + MaxPool",
            "x": 39,
            "y": 50,
            "width": 11,
            "tone": "model",
            "phases": ["resnet"],
        },
        {
            "id": "residual_low",
            "title": "残差阶段 I",
            "subtitle": "Layer1-2 保留局部纹理",
            "x": 51,
            "y": 50,
            "width": 11,
            "tone": "model",
            "phases": ["resnet"],
        },
        {
            "id": "residual_high",
            "title": "残差阶段 II",
            "subtitle": "Layer3-4 提取高阶模式",
            "x": 63,
            "y": 50,
            "width": 11,
            "tone": "model",
            "phases": ["resnet"],
        },
        {
            "id": "sequence",
            "title": "序列展开",
            "subtitle": "沿频率维均值 -> T x 512",
            "x": 75,
            "y": 50,
            "width": 10,
            "tone": "feature",
            "phases": ["resnet", "sequence", "bilstm"],
        },
        {
            "id": "bilstm",
            "title": "BiLSTM",
            "subtitle": "双向读取前后文",
            "x": 86,
            "y": 50,
            "width": 11,
            "tone": "model",
            "phases": ["bilstm"],
        },
        {
            "id": "head",
            "title": "分类头",
            "subtitle": f"Dropout + Linear -> {num_classes} 类",
            "x": 95,
            "y": 50,
            "width": 9,
            "tone": "result",
            "phases": ["head"],
        },
    ]
    edges = [
        {"from": "input", "to": "window"},
        {"from": "window", "to": "mel"},
        {"from": "mel", "to": "stem"},
        {"from": "stem", "to": "residual_low"},
        {"from": "residual_low", "to": "residual_high"},
        {"from": "residual_high", "to": "sequence"},
        {"from": "sequence", "to": "bilstm"},
        {"from": "bilstm", "to": "head"},
    ]
    return _build_blueprint(
        title="ResNet18 + BiLSTM 教学结构图",
        nodes=nodes,
        edges=edges,
        flow_notes=[
            "输入先统一为 90 秒单声道，再按 3 秒窗口切片，保证训练与验证都落在一致长度上。",
            "每个窗口都会转成 128 维 Mel 频谱图，再交给 ResNet18 的 Stem 与残差阶段提取层级时频纹理。",
            "卷积特征沿频率维做均值后展开为时间序列，再送入 2 层双向 LSTM 聚合前后上下文。",
            "Dropout + Linear 分类头输出候选类别结果，下方同步显示训练曲线、日志与上传推理反馈。",
        ],
        summary=[
            {"label": "活跃模型", "value": active_model_name},
            {"label": "模型类型", "value": "ResNet18 + BiLSTM"},
            {"label": "卷积主干", "value": "ResNet18（Stem + Layer1-4）"},
            {"label": "时序编码", "value": "2 层双向 BiLSTM"},
            {"label": "参数规模", "value": _format_parameter_count(parameter_count)},
            {"label": "模型状态", "value": "已就绪" if model_ready else "等待训练"},
        ],
    )


def get_transformer_model_blueprint(
    num_classes: int,
    active_model_name: str,
    model_ready: bool,
    parameter_count: int,
) -> Dict[str, object]:
    nodes: List[Dict[str, object]] = [
        {
            "id": "input",
            "title": "音频输入",
            "subtitle": "原始录音 / 上传音频",
            "x": 8,
            "y": 50,
            "width": 10,
            "tone": "source",
            "phases": ["input"],
        },
        {
            "id": "window",
            "title": "统一与切片",
            "subtitle": "90 秒标准化 -> 3 秒滑窗",
            "x": 23,
            "y": 50,
            "width": 11,
            "tone": "process",
            "phases": ["window"],
        },
        {
            "id": "mel",
            "title": "Mel 频谱图",
            "subtitle": "128 Mel bins / 时频纹理",
            "x": 38,
            "y": 50,
            "width": 10,
            "tone": "feature",
            "phases": ["mel"],
        },
        {
            "id": "cnn_low",
            "title": "CNN 卷积前端",
            "subtitle": "局部纹理与短时模式",
            "x": 54,
            "y": 50,
            "width": 12,
            "tone": "model",
            "phases": ["cnn"],
        },
        {
            "id": "sequence",
            "title": "序列整理",
            "subtitle": "频率压缩 + 位置编码",
            "x": 71,
            "y": 50,
            "width": 12,
            "tone": "feature",
            "phases": ["cnn", "sequence", "transformer"],
        },
        {
            "id": "transformer",
            "title": "Transformer Encoder",
            "subtitle": "多头注意力比较全局依赖",
            "x": 87,
            "y": 50,
            "width": 13,
            "tone": "model",
            "phases": ["transformer"],
        },
        {
            "id": "head",
            "title": "分类头",
            "subtitle": f"池化 + Linear -> {num_classes} 类",
            "x": 96,
            "y": 50,
            "width": 9,
            "tone": "result",
            "phases": ["head"],
        },
    ]
    edges = [
        {"from": "input", "to": "window"},
        {"from": "window", "to": "mel"},
        {"from": "mel", "to": "cnn_low"},
        {"from": "cnn_low", "to": "sequence"},
        {"from": "sequence", "to": "transformer"},
        {"from": "transformer", "to": "head"},
    ]
    return _build_blueprint(
        title="CNN + Transformer 教学结构图",
        nodes=nodes,
        edges=edges,
        flow_notes=[
            "输入仍然先统一为 90 秒单声道，并按 3 秒窗口切片，保证不同模型使用同一数据底座。",
            "轻量 CNN 先提取局部时频纹理，再把卷积特征压缩成时间序列并补上位置编码。",
            "Transformer Encoder 用多头注意力同时比较远近片段之间的关系，适合做探索版的全局依赖分析。",
            "最后把整段序列聚合成一个向量，再交给分类头输出结果。",
        ],
        summary=[
            {"label": "活跃模型", "value": active_model_name},
            {"label": "模型类型", "value": "CNN + Transformer"},
            {"label": "卷积前端", "value": "4 层轻量 CNN"},
            {"label": "时序编码", "value": "2 层 Transformer Encoder"},
            {"label": "参数规模", "value": _format_parameter_count(parameter_count)},
            {"label": "模型状态", "value": "已就绪" if model_ready else "等待训练"},
        ],
    )


def get_model_blueprint(num_classes: int, active_model_name: str, model_ready: bool, parameter_count: int) -> Dict[str, object]:
    return get_lstm_model_blueprint(num_classes, active_model_name, model_ready, parameter_count)
