import json
import threading
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Tuple
from urllib.parse import quote

from .audio_tools import save_standardized_assets
from .config import DEMO_CLIP_DIR, IMAGE_DIR, MAPPING_PATH, SUPPORTED_AUDIO_SUFFIXES, VOICE_DIR, VOICE_SPECTROGRAM_DIR


_PREPARE_LOCK = threading.Lock()


def _sort_mapping_items(mapping: Dict[str, str]) -> List[Tuple[str, str]]:
    return sorted(mapping.items(), key=lambda item: int(item[0]) if str(item[0]).isdigit() else item[0])


@lru_cache(maxsize=1)
def load_species_mapping() -> Dict[str, str]:
    if not MAPPING_PATH.exists():
        raise FileNotFoundError(f"未找到鸟类映射文件: {MAPPING_PATH}")
    return json.loads(MAPPING_PATH.read_text(encoding="utf-8"))


def species_items() -> List[Tuple[str, str]]:
    return _sort_mapping_items(load_species_mapping())


def _homework_url(*parts: str) -> str:
    return "/homework/" + "/".join(quote(part) for part in parts)


def find_source_audio(species_name: str) -> List[Path]:
    source_dir = VOICE_DIR / species_name
    if not source_dir.is_dir():
        return []
    return sorted(
        path for path in source_dir.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED_AUDIO_SUFFIXES
    )


def prepare_display_assets() -> Dict[str, int]:
    with _PREPARE_LOCK:
        raw_files = 0
        standardized_files = 0
        generated_specs = 0

        for species_id, species_name in species_items():
            sources = find_source_audio(species_name)
            raw_files += len(sources)
            if not sources:
                continue

            source_path = sources[0]
            audio_output = VOICE_DIR / f"{species_id}.wav"
            spectrogram_output = VOICE_SPECTROGRAM_DIR / f"{species_id}.png"

            needs_refresh = (
                not audio_output.exists()
                or not spectrogram_output.exists()
                or audio_output.stat().st_mtime < source_path.stat().st_mtime
                or spectrogram_output.stat().st_mtime < source_path.stat().st_mtime
            )

            if needs_refresh:
                save_standardized_assets(source_path, audio_output, spectrogram_output)

            if audio_output.exists():
                standardized_files += 1
            if spectrogram_output.exists():
                generated_specs += 1

    return {
        "raw_files": raw_files,
        "standardized_files": standardized_files,
        "spectrogram_files": generated_specs,
    }


def build_species_catalog() -> List[Dict[str, object]]:
    prepare_display_assets()
    catalog: List[Dict[str, object]] = []
    for label, (species_id, species_name) in enumerate(species_items()):
        sources = find_source_audio(species_name)
        image_path = IMAGE_DIR / f"{species_id}.png"
        audio_path = VOICE_DIR / f"{species_id}.wav"
        spectrogram_path = VOICE_SPECTROGRAM_DIR / f"{species_id}.png"

        catalog.append(
            {
                "id": species_id,
                "label_index": label,
                "name": species_name,
                "image_url": _homework_url("bird_images", f"{species_id}.png") if image_path.exists() else None,
                "audio_url": _homework_url("voice", f"{species_id}.wav") if audio_path.exists() else None,
                "spectrogram_url": _homework_url("voice", "spectrograms", f"{species_id}.png") if spectrogram_path.exists() else None,
                "raw_sample_count": len(sources),
                "raw_sources": [path.name for path in sources],
            }
        )
    return catalog


def list_playground_clips(limit: int = 8) -> List[Dict[str, str]]:
    clips: List[Dict[str, str]] = []

    if DEMO_CLIP_DIR.is_dir():
        for index, path in enumerate(sorted(DEMO_CLIP_DIR.iterdir()), start=1):
            if index > limit:
                break
            if not path.is_file() or path.suffix.lower() not in SUPPORTED_AUDIO_SUFFIXES:
                continue
            clips.append(
                {
                    "id": f"demo-{index}",
                    "title": path.stem,
                    "file_name": path.name,
                    "audio_url": _homework_url("demo_clips", path.name),
                    "source": "音频片段",
                    "note": "供首页音频列表调用。",
                }
            )

    if clips:
        return clips

    prepare_display_assets()
    for species_id, species_name in species_items()[: min(limit, 5)]:
        audio_path = VOICE_DIR / f"{species_id}.wav"
        if not audio_path.exists():
            continue
        clips.append(
            {
                "id": species_id,
                "title": species_name,
                "file_name": audio_path.name,
                "audio_url": _homework_url("voice", audio_path.name),
                "source": "课程样本",
                "note": "由课程音频资源生成。",
            }
        )
    return clips


def get_dataset_overview() -> Dict[str, object]:
    prepared = prepare_display_assets()
    species = build_species_catalog()
    return {
        "summary": {
            "class_count": len(species),
            "raw_audio_files": prepared["raw_files"],
            "standardized_audio_files": prepared["standardized_files"],
            "spectrogram_files": prepared["spectrogram_files"],
        },
        "species": species,
    }


def list_training_entries() -> List[Tuple[Path, int, str]]:
    entries: List[Tuple[Path, int, str]] = []
    prepare_display_assets()
    for label, (species_id, species_name) in enumerate(species_items()):
        audio_path = VOICE_DIR / f"{species_id}.wav"
        if audio_path.exists():
            entries.append((audio_path, label, species_name))
    return entries


def species_names() -> List[str]:
    return [species_name for _, species_name in species_items()]