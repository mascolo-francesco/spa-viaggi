from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ApiModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ErrorDetail(ApiModel):
    code: str
    message: str


class HealthResponse(ApiModel):
    status: str
    timestamp: datetime


class MessageResponse(ApiModel):
    message: str


class PaginatedResponse(ApiModel):
    items: list[Any]
    total: int
    page: int
    limit: int
