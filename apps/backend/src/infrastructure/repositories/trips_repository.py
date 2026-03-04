from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from pymongo import DESCENDING

from src.infrastructure.db import collections


class TripsRepository:
    def __init__(self, db: Any) -> None:
        self.db = db
        self.collection = db[collections.TRIPS]

    async def list_trips(self, filters: dict, page: int, limit: int, sort: str = "-start_date"):
        query: dict[str, Any] = {"deleted_at": None}
        query.update(filters)

        sort_key = "start_date"
        sort_dir = DESCENDING
        if sort and not sort.startswith("-"):
            sort_key = sort
            sort_dir = 1
        elif sort and sort.startswith("-"):
            sort_key = sort[1:]

        skip = (page - 1) * limit
        cursor = self.collection.find(query).sort(sort_key, sort_dir).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)
        total = await self.collection.count_documents(query)
        return items, total

    async def get_by_id(self, trip_id: ObjectId) -> dict | None:
        return await self.collection.find_one({"_id": trip_id, "deleted_at": None})

    async def create(self, payload: dict) -> dict:
        now = datetime.now(UTC)
        payload["created_at"] = now
        payload["updated_at"] = now
        payload["deleted_at"] = None
        res = await self.collection.insert_one(payload)
        created = await self.get_by_id(res.inserted_id)
        return created

    async def update(self, trip_id: ObjectId, payload: dict) -> dict | None:
        payload["updated_at"] = datetime.now(UTC)
        await self.collection.update_one({"_id": trip_id, "deleted_at": None}, {"$set": payload})
        return await self.get_by_id(trip_id)

    async def soft_delete(self, trip_id: ObjectId) -> bool:
        res = await self.collection.update_one(
            {"_id": trip_id, "deleted_at": None},
            {"$set": {"deleted_at": datetime.now(UTC), "updated_at": datetime.now(UTC)}},
        )
        return res.modified_count > 0

    async def replace_participants(self, trip_id: ObjectId, participant_ids: list[ObjectId]) -> dict | None:
        await self.collection.update_one(
            {"_id": trip_id, "deleted_at": None},
            {
                "$set": {
                    "participants": participant_ids,
                    "updated_at": datetime.now(UTC),
                }
            },
        )
        return await self.get_by_id(trip_id)

    async def add_participant(self, trip_id: ObjectId, participant_id: ObjectId) -> dict | None:
        await self.collection.update_one(
            {"_id": trip_id, "deleted_at": None},
            {
                "$addToSet": {"participants": participant_id},
                "$set": {"updated_at": datetime.now(UTC)},
            },
        )
        return await self.get_by_id(trip_id)

    async def remove_participant(self, trip_id: ObjectId, participant_id: ObjectId) -> dict | None:
        await self.collection.update_one(
            {"_id": trip_id, "deleted_at": None},
            {
                "$pull": {"participants": participant_id},
                "$set": {"updated_at": datetime.now(UTC)},
            },
        )
        return await self.get_by_id(trip_id)

    async def map_markers(self, filters: dict) -> list[dict]:
        query = {
            "deleted_at": None,
            "location": {"$ne": None},
        }
        query.update(filters)
        cursor = self.collection.find(query)
        return await cursor.to_list(length=None)

    async def seed_if_empty(self, docs: list[dict]) -> int:
        current = await self.collection.count_documents({})
        if current > 0:
            return 0
        if not docs:
            return 0
        await self.collection.insert_many(docs)
        return len(docs)
