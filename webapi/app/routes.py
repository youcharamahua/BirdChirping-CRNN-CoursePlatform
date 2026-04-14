import tempfile
import json
import mimetypes
import uuid
from pathlib import Path
from typing import Callable
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, File, HTTPException, UploadFile

from .audio_tools import build_full_spectrogram_preview, load_audio_any, normalize_waveform
from .cnn_training_service import lstm_training_service
from .config import REMOTE_INFERENCE_URL
from .dataset_service import get_dataset_overview, list_playground_clips, prepare_display_assets
from .modeling import get_bilstm_model_blueprint, get_lstm_model_blueprint, get_transformer_model_blueprint
from .schemas import TrainConfig
from .training_service import DEVICE, bilstm_training_service
from .transformer_training_service import transformer_training_service


api_router = APIRouter(prefix="/api")


def _path(prefix: str, suffix: str) -> str:
    return f"{prefix}{suffix}" if prefix else suffix


def _service_health(service) -> dict:
    overview = get_dataset_overview()
    return {
        "status": "ok",
        "device": str(DEVICE),
        "active_model": service.active_model_name,
        "model_ready": service.model_ready,
        "dataset": overview["summary"],
    }


def _service_blueprint(service, builder: Callable[[int, str, bool, int], dict]) -> dict:
    return builder(
        num_classes=len(service.species),
        active_model_name=service.active_model_name,
        model_ready=service.model_ready,
        parameter_count=service.parameter_count,
    )


def _resolve_upload_suffix(filename: str) -> str:
    suffix = (filename or "").lower().rsplit(".", 1)
    return f".{suffix[-1]}" if len(suffix) == 2 else ".wav"


def _load_upload_waveform(binary: bytes, filename: str) -> tuple:
    if not binary:
        raise HTTPException(status_code=400, detail="空文件")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=_resolve_upload_suffix(filename)) as temp:
            temp.write(binary)
            tmp_path = Path(temp.name)
        waveform, sample_rate = load_audio_any(tmp_path)
    except RuntimeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    finally:
        if tmp_path and tmp_path.exists():
            try:
                tmp_path.unlink()
            except OSError:
                pass

    waveform, _ = normalize_waveform(waveform, sample_rate)
    return waveform, sample_rate


def _analyze_with_service(service, binary: bytes, filename: str, threshold: float, top_k: int) -> dict:
    suffix = (filename or "").lower().rsplit(".", 1)
    resolved_suffix = f".{suffix[-1]}" if len(suffix) == 2 else ".wav"
    try:
        return service.analyze_upload_bytes(binary, resolved_suffix, threshold=threshold, top_k=top_k)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


def _register_training_routes(prefix: str, service, builder: Callable[[int, str, bool, int], dict]) -> None:
    @api_router.get(_path(prefix, "/health"))
    def health() -> dict:
        return _service_health(service)

    @api_router.get(_path(prefix, "/dataset/overview"))
    def dataset_overview() -> dict:
        return get_dataset_overview()

    @api_router.get(_path(prefix, "/model/blueprint"))
    def model_blueprint() -> dict:
        return _service_blueprint(service, builder)

    @api_router.get(_path(prefix, "/train/status"))
    def train_status() -> dict:
        return service.state_snapshot()

    @api_router.post(_path(prefix, "/train/start"))
    def train_start(config: TrainConfig) -> dict:
        try:
            return service.start(config)
        except RuntimeError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error

    @api_router.post(_path(prefix, "/train/stop"))
    def train_stop() -> dict:
        return service.stop()

    @api_router.post(_path(prefix, "/analyze"))
    async def analyze(file: UploadFile = File(...), threshold: float = 0.35, top_k: int = 5) -> dict:
        try:
            binary = await file.read()
        finally:
            await file.close()
        return _analyze_with_service(service, binary, file.filename or "audio.wav", threshold, top_k)

    @api_router.post(_path(prefix, "/predict"))
    async def predict_alias(file: UploadFile = File(...), threshold: float = 0.35, top_k: int = 5) -> dict:
        return await analyze(file=file, threshold=threshold, top_k=top_k)

    @api_router.post(_path(prefix, "/dataset/prepare"))
    def dataset_prepare() -> dict:
        return prepare_display_assets()


_register_training_routes("", lstm_training_service, get_lstm_model_blueprint)
_register_training_routes("/bilstm", bilstm_training_service, get_bilstm_model_blueprint)
_register_training_routes("/transformer", transformer_training_service, get_transformer_model_blueprint)


def _build_multipart_payload(file_name: str, binary: bytes) -> tuple[bytes, str]:
    boundary = f"----CopilotBoundary{uuid.uuid4().hex}"
    mime_type = mimetypes.guess_type(file_name)[0] or "application/octet-stream"
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(
        f'Content-Disposition: form-data; name="file"; filename="{file_name}"\r\n'.encode("utf-8")
    )
    body.extend(f"Content-Type: {mime_type}\r\n\r\n".encode("utf-8"))
    body.extend(binary)
    body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))
    return bytes(body), boundary


def _proxy_remote_predict(binary: bytes, file_name: str, threshold: float, top_k: int) -> dict:
    payload, boundary = _build_multipart_payload(file_name, binary)
    request = Request(
        f"{REMOTE_INFERENCE_URL}?{urlencode({'threshold': threshold, 'top_k': top_k})}",
        data=payload,
        method="POST",
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Accept": "application/json",
        },
    )

    try:
        with urlopen(request, timeout=45) as response:
            raw = response.read().decode("utf-8", errors="replace").lstrip("\ufeff").strip()
            return json.loads(raw or "{}")
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace").strip()
        try:
            payload = json.loads(detail or "{}")
            detail = payload.get("detail") or payload
        except json.JSONDecodeError:
            pass
        raise HTTPException(status_code=error.code, detail=detail) from error
    except URLError as error:
        raise HTTPException(status_code=502, detail=f"识别服务暂不可用: {error.reason}") from error


@api_router.get("/playground/clips")
def playground_clips() -> dict:
    return {"items": list_playground_clips()}


@api_router.post("/playground/spectrogram")
async def playground_spectrogram(file: UploadFile = File(...)) -> dict:
    try:
        binary = await file.read()
    finally:
        await file.close()

    waveform, _ = _load_upload_waveform(binary, file.filename or "audio.wav")
    return build_full_spectrogram_preview(waveform)


@api_router.post("/playground/predict")
async def playground_predict(file: UploadFile = File(...), threshold: float = 0.1, top_k: int = 7) -> dict:
    try:
        binary = await file.read()
    finally:
        await file.close()

    if not binary:
        raise HTTPException(status_code=400, detail="空文件")

    return _proxy_remote_predict(binary, file.filename or "audio.wav", threshold, top_k)
