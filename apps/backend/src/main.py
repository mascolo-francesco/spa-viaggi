import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse

from src.api.middleware import request_context_middleware
from src.api.router import api_router
from src.core.config import get_settings
from src.core.errors import AppError, app_error_to_http
from src.core.logging import setup_logging
from src.infrastructure.db.client import close_client, get_database, ping_database
from src.infrastructure.db.indexes import create_indexes
from src.infrastructure.db.validators import apply_validators

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    setup_logging()
    settings.exports_path.mkdir(parents=True, exist_ok=True)

    db = get_database(settings)
    await ping_database(settings)
    await apply_validators(db)
    await create_indexes(db)

    logger.info("Application startup completed")
    yield

    await close_client()
    logger.info("Application shutdown completed")


settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

app.middleware("http")(request_context_middleware)
app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/")
async def root() -> dict:
    return {"message": settings.app_name, "docs": "/docs"}


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError):
    http_error = app_error_to_http(exc)
    return ORJSONResponse(status_code=http_error.status_code, content=http_error.detail)
