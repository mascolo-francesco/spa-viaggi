from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="SPA Viaggi API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    api_prefix: str = Field(default="/api/v1", alias="API_PREFIX")

    jwt_secret_key: str = Field(default="change_me", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=120, alias="JWT_EXPIRE_MINUTES")

    mongodb_uri: str = Field(default="mongodb://localhost:27017", alias="MONGODB_URI")
    mongodb_db_name: str = Field(default="spa_viaggi", alias="MONGODB_DB_NAME")
    mongodb_max_pool_size: int = Field(default=100, alias="MONGODB_MAX_POOL_SIZE")
    mongodb_min_pool_size: int = Field(default=5, alias="MONGODB_MIN_POOL_SIZE")
    mongodb_wait_queue_timeout_ms: int = Field(default=5000, alias="MONGODB_WAIT_QUEUE_TIMEOUT_MS")
    mongodb_server_selection_timeout_ms: int = Field(
        default=5000, alias="MONGODB_SERVER_SELECTION_TIMEOUT_MS"
    )
    mongodb_retry_writes: bool = Field(default=True, alias="MONGODB_RETRY_WRITES")
    mongodb_retry_reads: bool = Field(default=True, alias="MONGODB_RETRY_READS")

    exports_dir: str = Field(default="./data/exports", alias="EXPORTS_DIR")
    export_inline_on_request: bool = Field(default=False, alias="EXPORT_INLINE_ON_REQUEST")
    worker_poll_seconds: int = Field(default=2, alias="WORKER_POLL_SECONDS")

    @property
    def exports_path(self) -> Path:
        return Path(self.exports_dir).resolve()


@lru_cache
def get_settings() -> Settings:
    return Settings()
