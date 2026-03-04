from src.application.use_cases.serializers import serialize_activity
from src.core.bson import to_object_id
from src.core.errors import NotFoundError
from src.infrastructure.repositories.activities_repository import ActivitiesRepository
from src.infrastructure.repositories.trips_repository import TripsRepository


class ActivitiesService:
    def __init__(self, trips_repo: TripsRepository, activities_repo: ActivitiesRepository) -> None:
        self.trips_repo = trips_repo
        self.activities_repo = activities_repo

    async def list(self, trip_id: str) -> list[dict]:
        trip_oid = to_object_id(trip_id, "trip_id")
        trip = await self.trips_repo.get_by_id(trip_oid)
        if not trip:
            raise NotFoundError("Viaggio non trovato")

        docs = await self.activities_repo.list_by_trip(trip_oid)
        return [serialize_activity(doc) for doc in docs]

    async def create(self, trip_id: str, data: dict) -> dict:
        trip_oid = to_object_id(trip_id, "trip_id")
        trip = await self.trips_repo.get_by_id(trip_oid)
        if not trip:
            raise NotFoundError("Viaggio non trovato")

        created = await self.activities_repo.create(trip_oid, data)
        return serialize_activity(created)

    async def update(self, trip_id: str, activity_id: str, data: dict) -> dict:
        updated = await self.activities_repo.update(
            to_object_id(trip_id, "trip_id"),
            to_object_id(activity_id, "activity_id"),
            data,
        )
        if not updated:
            raise NotFoundError("Attivita non trovata")
        return serialize_activity(updated)

    async def delete(self, trip_id: str, activity_id: str) -> None:
        deleted = await self.activities_repo.delete(
            to_object_id(trip_id, "trip_id"),
            to_object_id(activity_id, "activity_id"),
        )
        if not deleted:
            raise NotFoundError("Attivita non trovata")
