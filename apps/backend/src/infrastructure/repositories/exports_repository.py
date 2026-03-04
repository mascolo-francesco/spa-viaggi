from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from pymongo import ReturnDocument

from src.infrastructure.db import collections


class ExportsRepository:
    def __init__(self, db: Any) -> None:
        self.db = db
        self.collection = db[collections.EXPORT_JOBS]

    async def create(self, trip_id: ObjectId, requested_by: ObjectId) -> dict:
        now = datetime.now(UTC)
        payload = {
            "trip_id": trip_id,
            "requested_by": requested_by,
            "status": "queued",
            "error": None,
            "file_path": None,
            "attempts": 0,
            "created_at": now,
            "started_at": None,
            "finished_at": None,
        }
        res = await self.collection.insert_one(payload)
        return await self.collection.find_one({"_id": res.inserted_id})

    async def get(self, job_id: ObjectId) -> dict | None:
        return await self.collection.find_one({"_id": job_id})

    async def claim_next_queued(self) -> dict | None:
        now = datetime.now(UTC)
        doc = await self.collection.find_one_and_update(
            {"status": "queued"},
            {
                "$set": {"status": "running", "started_at": now},
                "$inc": {"attempts": 1},
            },
            sort=[("created_at", 1)],
            return_document=ReturnDocument.AFTER,
        )
        return doc

    async def mark_succeeded(self, job_id: ObjectId, file_path: str) -> dict | None:
        return await self.collection.find_one_and_update(
            {"_id": job_id},
            {
                "$set": {
                    "status": "succeeded",
                    "file_path": file_path,
                    "finished_at": datetime.now(UTC),
                }
            },
            return_document=ReturnDocument.AFTER,
        )

    async def mark_failed(self, job_id: ObjectId, error: str) -> dict | None:
        return await self.collection.find_one_and_update(
            {"_id": job_id},
            {
                "$set": {
                    "status": "failed",
                    "error": error,
                    "finished_at": datetime.now(UTC),
                }
            },
            return_document=ReturnDocument.AFTER,
        )
