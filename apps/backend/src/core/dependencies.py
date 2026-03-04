from fastapi import Depends
from pymongo.asynchronous.database import AsyncDatabase

from src.core.config import Settings, get_settings
from src.infrastructure.db.client import get_database


def get_app_settings() -> Settings:
    return get_settings()


async def get_db(settings: Settings = Depends(get_app_settings)) -> AsyncDatabase:
    return get_database(settings)
