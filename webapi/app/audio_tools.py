import base64
import io
import math
from pathlib import Path
from typing import List, Tuple

import numpy as np
import torch
import torch.nn.functional as F
import torchaudio
from PIL import Image, ImageOps
from torchaudio.transforms import AmplitudeToDB, MelSpectrogram, Resample

from .config import (
    EXPECTED_TIME_STEPS,
    F_MAX,
    F_MIN,
    HOP_LENGTH,
    N_FFT,
    N_MELS,
    OVERLAP_RATIO,
    SAMPLE_RATE,
    SEGMENT_DURATION,
    STANDARD_AUDIO_DURATION,
)


PIL_BILINEAR = Image.Resampling.BILINEAR if hasattr(Image, "Resampling") else Image.BILINEAR


MEL_SPEC = MelSpectrogram(
    sample_rate=SAMPLE_RATE,
    n_fft=N_FFT,
    hop_length=HOP_LENGTH,
    n_mels=N_MELS,
    f_min=F_MIN,
    f_max=F_MAX,
)
AMPLITUDE_TO_DB = AmplitudeToDB()


def load_audio_any(file_path: Path) -> Tuple[torch.Tensor, int]:
    try:
        return torchaudio.load(str(file_path))
    except Exception:
        pass

    try:
        import librosa

        waveform, sample_rate = librosa.load(str(file_path), sr=None, mono=False)
        if isinstance(waveform, np.ndarray) and waveform.ndim == 1:
            waveform = np.expand_dims(waveform, 0)
        return torch.from_numpy(waveform).float(), int(sample_rate)
    except Exception:
        pass

    try:
        import soundfile as soundfile

        data, sample_rate = soundfile.read(str(file_path), always_2d=True)
        return torch.from_numpy(data.T).float(), int(sample_rate)
    except Exception as error:
        raise RuntimeError(f"无法读取音频文件: {file_path}; {error}") from error


def normalize_waveform(waveform: torch.Tensor, sample_rate: int) -> Tuple[torch.Tensor, int]:
    if waveform.dim() == 1:
        waveform = waveform.unsqueeze(0)
    if waveform.size(0) > 1:
        waveform = waveform.mean(dim=0, keepdim=True)
    if sample_rate != SAMPLE_RATE:
        waveform = Resample(sample_rate, SAMPLE_RATE)(waveform)
        sample_rate = SAMPLE_RATE
    peak = float(waveform.abs().max().item()) if waveform.numel() else 0.0
    if peak > 0:
        waveform = waveform / peak
    return waveform.float(), sample_rate


def fit_waveform_duration(waveform: torch.Tensor, target_seconds: int = STANDARD_AUDIO_DURATION) -> torch.Tensor:
    target_samples = int(target_seconds * SAMPLE_RATE)
    total_samples = waveform.shape[-1]
    if total_samples == 0:
        return torch.zeros((1, target_samples), dtype=torch.float32)
    if total_samples >= target_samples:
        start = max(0, (total_samples - target_samples) // 2)
        return waveform[:, start:start + target_samples]

    repeat_count = math.ceil(target_samples / total_samples)
    repeated = waveform.repeat(1, repeat_count)
    return repeated[:, :target_samples]


def crop_or_pad_segment(waveform: torch.Tensor, random_crop: bool = False, seed_offset: int = 0) -> torch.Tensor:
    segment_samples = int(SEGMENT_DURATION * SAMPLE_RATE)
    total_samples = waveform.shape[-1]
    if total_samples == segment_samples:
        return waveform
    if total_samples < segment_samples:
        return F.pad(waveform, (0, segment_samples - total_samples))

    if random_crop:
        max_start = total_samples - segment_samples
        start = int(torch.randint(0, max_start + 1, (1,)).item())
    else:
        steps = max(1, total_samples - segment_samples)
        stride = max(1, steps // max(seed_offset + 1, 1))
        start = min(steps, seed_offset * stride)
    return waveform[:, start:start + segment_samples]


def waveform_to_mel_tensor(waveform: torch.Tensor) -> torch.Tensor:
    mel = MEL_SPEC(waveform)
    log_mel = AMPLITUDE_TO_DB(mel).squeeze(0)
    if log_mel.shape[-1] > EXPECTED_TIME_STEPS:
        log_mel = log_mel[:, :EXPECTED_TIME_STEPS]
    elif log_mel.shape[-1] < EXPECTED_TIME_STEPS:
        pad = EXPECTED_TIME_STEPS - log_mel.shape[-1]
        pad_value = float(log_mel.min().item()) if log_mel.numel() else 0.0
        log_mel = F.pad(log_mel, (0, pad), value=pad_value)
    return log_mel.unsqueeze(0).float()


def waveform_to_full_mel_tensor(waveform: torch.Tensor) -> torch.Tensor:
    mel = MEL_SPEC(waveform)
    return AMPLITUDE_TO_DB(mel).squeeze(0).float()


def mel_tensor_to_image(mel_tensor: torch.Tensor) -> Image.Image:
    mel = mel_tensor.squeeze().detach().cpu().numpy()
    mel = np.flipud(mel)
    mel -= mel.min()
    max_value = float(mel.max()) if mel.size else 0.0
    if max_value > 0:
        mel = mel / max_value
    pixels = np.uint8(np.clip(mel * 255.0, 0, 255))
    image = Image.fromarray(pixels, mode="L")
    return ImageOps.colorize(image, black="#08130f", white="#f0d3a2", mid="#2f7a61")


def image_to_data_uri(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")


def build_spectrogram_data_uri(waveform: torch.Tensor) -> str:
    mel = waveform_to_mel_tensor(crop_or_pad_segment(waveform, random_crop=False))
    image = mel_tensor_to_image(mel)
    return image_to_data_uri(image)


def build_full_spectrogram_preview(waveform: torch.Tensor, min_height: int = 256) -> dict:
    if waveform.dim() == 1:
        waveform = waveform.unsqueeze(0)
    if waveform.shape[-1] <= 0:
        waveform = torch.zeros((1, SAMPLE_RATE), dtype=torch.float32)

    mel = waveform_to_full_mel_tensor(waveform)
    image = mel_tensor_to_image(mel)
    width, source_height = image.size
    target_height = max(min_height, source_height)
    if target_height != source_height:
        image = image.resize((width, target_height), resample=PIL_BILINEAR)

    duration_seconds = round(float(waveform.shape[-1]) / SAMPLE_RATE, 2)
    return {
        "spectrogram": image_to_data_uri(image),
        "duration_seconds": duration_seconds,
        "width": image.size[0],
        "height": image.size[1],
        "frame_count": width,
    }


def save_standardized_assets(source_path: Path, audio_output_path: Path, spectrogram_output_path: Path) -> None:
    waveform, sample_rate = load_audio_any(source_path)
    waveform, _ = normalize_waveform(waveform, sample_rate)
    waveform = fit_waveform_duration(waveform, STANDARD_AUDIO_DURATION)

    audio_output_path.parent.mkdir(parents=True, exist_ok=True)
    spectrogram_output_path.parent.mkdir(parents=True, exist_ok=True)

    torchaudio.save(str(audio_output_path), waveform.cpu(), SAMPLE_RATE, encoding="PCM_S", bits_per_sample=16)
    mel = waveform_to_mel_tensor(crop_or_pad_segment(waveform, random_crop=False))
    mel_tensor_to_image(mel).save(spectrogram_output_path)


def extract_inference_segments(waveform: torch.Tensor) -> List[torch.Tensor]:
    standardized = fit_waveform_duration(waveform, STANDARD_AUDIO_DURATION)
    segment_samples = int(SEGMENT_DURATION * SAMPLE_RATE)
    step = max(1, int(segment_samples * (1 - OVERLAP_RATIO)))
    total_samples = standardized.shape[-1]
    if total_samples <= segment_samples:
        return [crop_or_pad_segment(standardized, random_crop=False)]

    segments: List[torch.Tensor] = []
    for start in range(0, max(total_samples - segment_samples + 1, 1), step):
        end = start + segment_samples
        if end > total_samples:
            break
        segments.append(standardized[:, start:end])

    if not segments:
        segments.append(crop_or_pad_segment(standardized, random_crop=False))
    return segments