from datetime import UTC, datetime
from typing import Any

from bson import ObjectId

from src.infrastructure.db import collections


class ExpensesRepository:
    def __init__(self, db: Any) -> None:
        self.db = db
        self.collection = db[collections.TRIP_EXPENSES]

    async def list_by_trip(self, trip_id: ObjectId) -> list[dict]:
        cursor = self.collection.find({"trip_id": trip_id}).sort("occurred_at", -1)
        return await cursor.to_list(length=None)

    async def create(self, trip_id: ObjectId, payload: dict) -> dict:
        now = datetime.now(UTC)
        payload["trip_id"] = trip_id
        payload["created_at"] = now
        payload["updated_at"] = now
        res = await self.collection.insert_one(payload)
        return await self.collection.find_one({"_id": res.inserted_id})

    async def update(self, trip_id: ObjectId, expense_id: ObjectId, payload: dict) -> dict | None:
        payload["updated_at"] = datetime.now(UTC)
        await self.collection.update_one(
            {"_id": expense_id, "trip_id": trip_id},
            {"$set": payload},
        )
        return await self.collection.find_one({"_id": expense_id, "trip_id": trip_id})

    async def delete(self, trip_id: ObjectId, expense_id: ObjectId) -> bool:
        res = await self.collection.delete_one({"_id": expense_id, "trip_id": trip_id})
        return res.deleted_count > 0

    async def summary_by_trip(self, trip_id: ObjectId) -> dict:
        pipeline = [
            {"$match": {"trip_id": trip_id}},
            {
                "$group": {
                    "_id": "$currency",
                    "total_amount": {"$sum": "$amount"},
                    "by_category": {
                        "$push": {
                            "category": "$category",
                            "amount": "$amount",
                        }
                    },
                }
            },
        ]
        docs = await self.collection.aggregate(pipeline).to_list(length=None)
        if not docs:
            return {
                "trip_id": str(trip_id),
                "currency": "EUR",
                "total_amount": 0.0,
                "by_category": [],
            }

        first = docs[0]
        category_map: dict[str, float] = {}
        for item in first["by_category"]:
            category_map[item["category"]] = category_map.get(item["category"], 0.0) + float(
                item["amount"]
            )

        by_category = [
            {"category": category, "total": round(total, 2)}
            for category, total in sorted(category_map.items())
        ]
        return {
            "trip_id": str(trip_id),
            "currency": first["_id"],
            "total_amount": round(float(first["total_amount"]), 2),
            "by_category": by_category,
        }
