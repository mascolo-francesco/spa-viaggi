from pathlib import Path

from fastapi import HTTPException, status

from src.application.use_cases.serializers import serialize_export_job
from src.core.bson import to_object_id
from src.core.config import Settings
from src.core.errors import NotFoundError
from src.infrastructure.queue.job_queue import JobQueue
from src.infrastructure.repositories.exports_repository import ExportsRepository
from src.infrastructure.repositories.trips_repository import TripsRepository


class ExportsService:
    def __init__(
        self,
        trips_repo: TripsRepository,
        exports_repo: ExportsRepository,
        queue: JobQueue,
        settings: Settings,
    ) -> None:
        self.trips_repo = trips_repo
        self.exports_repo = exports_repo
        self.queue = queue
        self.settings = settings

    async def create_pdf_export(self, trip_id: str, user_id: str) -> dict:
        trip_oid = to_object_id(trip_id, "trip_id")
        trip = await self.trips_repo.get_by_id(trip_oid)
        if not trip:
            raise NotFoundError("Viaggio non trovato")

        job = await self.exports_repo.create(trip_oid, to_object_id(user_id, "user_id"))
        await self.queue.enqueue_export_job(str(job["_id"]))
        return serialize_export_job(job)

    async def get_job(self, job_id: str) -> dict:
        doc = await self.exports_repo.get(to_object_id(job_id, "job_id"))
        if not doc:
            raise NotFoundError("Job export non trovato")
        return serialize_export_job(doc)

    async def get_download_path(self, job_id: str) -> Path:
        doc = await self.exports_repo.get(to_object_id(job_id, "job_id"))
        if not doc:
            raise NotFoundError("Job export non trovato")
        if doc.get("status") != "succeeded" or not doc.get("file_path"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": "EXPORT_NOT_READY", "message": "Il file non e ancora pronto"},
            )
        path = Path(doc["file_path"]).resolve()
        if not path.exists():
            raise NotFoundError("File export non trovato")
        return path
