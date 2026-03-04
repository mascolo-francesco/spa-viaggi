from datetime import UTC, datetime

from fastapi import APIRouter, Depends

from src.core.config import Settings, get_settings
from src.infrastructure.db.client import ping_database

router = APIRouter()


@router.get("/health/live")
async def live() -> dict:
    return {"status": "ok", "timestamp": datetime.now(UTC)}


@router.get("/health/ready")
async def ready(settings: Settings = Depends(get_settings)) -> dict:
    await ping_database(settings)
    return {"status": "ready", "timestamp": datetime.now(UTC)}
