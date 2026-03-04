from datetime import UTC, datetime
from typing import Any

from bson import ObjectId

from src.infrastructure.db import collections


class ActivitiesRepository:
    def __init__(self, db: Any) -> None:
        self.db = db
        self.collection = db[collections.TRIP_ACTIVITIES]

    async def list_by_trip(self, trip_id: ObjectId) -> list[dict]:
        cursor = self.collection.find({"trip_id": trip_id}).sort("start_at", 1)
        return await cursor.to_list(length=None)

    async def create(self, trip_id: ObjectId, payload: dict) -> dict:
        now = datetime.now(UTC)
        payload["trip_id"] = trip_id
        payload["created_at"] = now
        payload["updated_at"] = now
        res = await self.collection.insert_one(payload)
        return await self.collection.find_one({"_id": res.inserted_id})

    async def update(self, trip_id: ObjectId, activity_id: ObjectId, payload: dict) -> dict | None:
        payload["updated_at"] = datetime.now(UTC)
        await self.collection.update_one(
            {"_id": activity_id, "trip_id": trip_id},
            {"$set": payload},
        )
        return await self.collection.find_one({"_id": activity_id, "trip_id": trip_id})

    async def delete(self, trip_id: ObjectId, activity_id: ObjectId) -> bool:
        res = await self.collection.delete_one({"_id": activity_id, "trip_id": trip_id})
        return res.deleted_count > 0
