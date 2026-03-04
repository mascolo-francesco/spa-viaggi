from datetime import UTC, datetime
from typing import Any

from bson import ObjectId

from src.core.security import hash_password
from src.infrastructure.db import collections


class UsersRepository:
    def __init__(self, db: Any) -> None:
        self.db = db
        self.collection = db[collections.USERS]

    async def find_by_username(self, username: str) -> dict | None:
        return await self.collection.find_one({"username": username})

    async def find_by_id(self, user_id: ObjectId) -> dict | None:
        return await self.collection.find_one({"_id": user_id})

    async def list_by_ids(self, user_ids: list[ObjectId]) -> list[dict]:
        if not user_ids:
            return []
        cursor = self.collection.find({"_id": {"$in": user_ids}})
        return await cursor.to_list(length=None)

    async def seed_if_empty(self, users: list[dict]) -> int:
        current = await self.collection.count_documents({})
        if current > 0:
            return 0

        payload = []
        now = datetime.now(UTC)
        for user in users:
            payload.append(
                {
                    "username": user["username"],
                    "display_name": user.get("display_name"),
                    "password_hash": hash_password(user["password"]),
                    "is_active": True,
                    "created_at": now,
                }
            )
        if payload:
            await self.collection.insert_many(payload)
        return len(payload)
