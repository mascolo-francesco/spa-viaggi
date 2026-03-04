import inspect
from typing import Any

from pymongo import AsyncMongoClient

from src.core.config import Settings

_client: AsyncMongoClient | None = None


def build_client(settings: Settings) -> AsyncMongoClient:
    return AsyncMongoClient(
        settings.mongodb_uri,
        maxPoolSize=settings.mongodb_max_pool_size,
        minPoolSize=settings.mongodb_min_pool_size,
        waitQueueTimeoutMS=settings.mongodb_wait_queue_timeout_ms,
        serverSelectionTimeoutMS=settings.mongodb_server_selection_timeout_ms,
        retryWrites=settings.mongodb_retry_writes,
        retryReads=settings.mongodb_retry_reads,
        appName=settings.app_name,
    )


def get_client(settings: Settings) -> AsyncMongoClient:
    global _client
    if _client is None:
        _client = build_client(settings)
    return _client


def get_database(settings: Settings) -> Any:
    client = get_client(settings)
    return client[settings.mongodb_db_name]


async def ping_database(settings: Settings) -> None:
    client = get_client(settings)
    await client.admin.command("ping")


async def close_client() -> None:
    global _client
    if _client is not None:
        result = _client.close()
        if inspect.isawaitable(result):
            await result
        _client = None
