from typing import Optional

from pydantic import BaseModel, Field


class TrainConfig(BaseModel):
    epochs: int = Field(default=12, ge=1, le=80)
    batch_size: int = Field(default=6, ge=1, le=64)
    learning_rate: float = Field(default=3e-4, gt=0)
    val_split: float = Field(default=0.2, gt=0.05, lt=0.5)
    seed: int = Field(default=42, ge=0)
    segments_per_file: int = Field(default=12, ge=1, le=64)
    max_samples: Optional[int] = Field(default=None, ge=1)