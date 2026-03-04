from datetime import datetime

from pydantic import BaseModel


class ExportJobResponse(BaseModel):
    job_id: str
    trip_id: str
    status: str
    error: str | None = None
    file_ready: bool = False
    created_at: datetime
    started_at: datetime | None = None
    finished_at: datetime | None = None
