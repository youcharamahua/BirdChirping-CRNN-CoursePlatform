from pathlib import Path


WEBAPI_DIR = Path(__file__).resolve().parents[1]
SITE_DIR = WEBAPI_DIR.parent
HOMEWORK_DIR = SITE_DIR / "homework"
ASSETS_DIR = SITE_DIR / "assets"
PAGES_DIR = SITE_DIR / "pages"
DEMO_CLIP_DIR = HOMEWORK_DIR / "demo_clips"

MODEL_DIR = WEBAPI_DIR / "models"
VOICE_DIR = HOMEWORK_DIR / "voice"
VOICE_SPECTROGRAM_DIR = VOICE_DIR / "spectrograms"
IMAGE_DIR = HOMEWORK_DIR / "bird_images"
MAPPING_PATH = HOMEWORK_DIR / "bird_species_mapping.json"

STANDARD_AUDIO_DURATION = 90
SAMPLE_RATE = 48_000
SEGMENT_DURATION = 3
OVERLAP_RATIO = 0.5

N_FFT = 2_048
HOP_LENGTH = 480
N_MELS = 128
F_MIN = 50
F_MAX = 16_000
EXPECTED_TIME_STEPS = int(SEGMENT_DURATION * SAMPLE_RATE / HOP_LENGTH)

SUPPORTED_AUDIO_SUFFIXES = {".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg"}

CNN_LSTM_MODEL_PATH = MODEL_DIR / "cnn_lstm_best.pth"
RESNET_BILSTM_MODEL_PATH = MODEL_DIR / "resnet18_bilstm_best.pth"
CNN_TRANSFORMER_MODEL_PATH = MODEL_DIR / "cnn_transformer_best.pth"

REMOTE_INFERENCE_URL = "https://flexusnc.jiomlan.online/predict"