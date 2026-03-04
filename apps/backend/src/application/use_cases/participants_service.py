from src.core.bson import to_object_id
from src.core.errors import NotFoundError
from src.infrastructure.repositories.trips_repository import TripsRepository
from src.infrastructure.repositories.users_repository import UsersRepository


class ParticipantsService:
    def __init__(self, trips_repo: TripsRepository, users_repo: UsersRepository) -> None:
        self.trips_repo = trips_repo
        self.users_repo = users_repo

    async def _resolve_participants(self, user_ids):
        users = await self.users_repo.list_by_ids(user_ids)
        users_by_id = {user["_id"]: user for user in users}
        items = []
        for uid in user_ids:
            user = users_by_id.get(uid)
            if user:
                items.append(
                    {
                        "user_id": str(uid),
                        "username": user["username"],
                        "display_name": user.get("display_name"),
                    }
                )
        return items

    async def get_participants(self, trip_id: str) -> dict:
        trip = await self.trips_repo.get_by_id(to_object_id(trip_id, "trip_id"))
        if not trip:
            raise NotFoundError("Viaggio non trovato")

        participant_ids = trip.get("participants", [])
        items = await self._resolve_participants(participant_ids)
        return {
            "trip_id": trip_id,
            "participants": items,
            "updated_at": trip.get("updated_at"),
        }

    async def replace_participants(self, trip_id: str, user_ids: list[str]) -> dict:
        parsed = [to_object_id(user_id, "user_id") for user_id in user_ids]
        trip = await self.trips_repo.replace_participants(to_object_id(trip_id, "trip_id"), parsed)
        if not trip:
            raise NotFoundError("Viaggio non trovato")
        items = await self._resolve_participants(parsed)
        return {
            "trip_id": trip_id,
            "participants": items,
            "updated_at": trip.get("updated_at"),
        }

    async def add_participant(self, trip_id: str, user_id: str) -> dict:
        trip = await self.trips_repo.add_participant(
            to_object_id(trip_id, "trip_id"), to_object_id(user_id, "user_id")
        )
        if not trip:
            raise NotFoundError("Viaggio non trovato")
        participant_ids = trip.get("participants", [])
        items = await self._resolve_participants(participant_ids)
        return {
            "trip_id": trip_id,
            "participants": items,
            "updated_at": trip.get("updated_at"),
        }

    async def remove_participant(self, trip_id: str, user_id: str) -> dict:
        trip = await self.trips_repo.remove_participant(
            to_object_id(trip_id, "trip_id"), to_object_id(user_id, "user_id")
        )
        if not trip:
            raise NotFoundError("Viaggio non trovato")
        participant_ids = trip.get("participants", [])
        items = await self._resolve_participants(participant_ids)
        return {
            "trip_id": trip_id,
            "participants": items,
            "updated_at": trip.get("updated_at"),
        }
