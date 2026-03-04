from bson import ObjectId
from fastapi import HTTPException, status

from src.application.use_cases.serializers import serialize_trip_detail, serialize_trip_summary
from src.core.bson import to_object_id
from src.core.errors import NotFoundError
from src.infrastructure.repositories.trips_repository import TripsRepository


class TripsService:
    def __init__(self, trips_repo: TripsRepository) -> None:
        self.trips_repo = trips_repo

    @staticmethod
    def _build_location(location: dict | None) -> dict | None:
        if not location:
            return None
        return {"type": "Point", "coordinates": [location["lon"], location["lat"]]}

    def _validate_dates(self, start_date, end_date) -> None:
        if start_date and end_date and end_date < start_date:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"code": "INVALID_DATE_RANGE", "message": "end_date deve essere >= start_date"},
            )

    async def list_trips(self, filters: dict, page: int, limit: int, sort: str) -> dict:
        docs, total = await self.trips_repo.list_trips(filters, page, limit, sort)
        return {
            "items": [serialize_trip_summary(doc) for doc in docs],
            "total": total,
            "page": page,
            "limit": limit,
        }

    async def get_trip(self, trip_id: str) -> dict:
        oid = to_object_id(trip_id, "trip_id")
        doc = await self.trips_repo.get_by_id(oid)
        if not doc:
            raise NotFoundError("Viaggio non trovato")
        return serialize_trip_detail(doc)

    async def create_trip(self, data: dict, created_by: str) -> dict:
        self._validate_dates(data.get("start_date"), data.get("end_date"))
        participants = [to_object_id(x, "participant_id") for x in data.pop("participants", [])]
        location = self._build_location(data.pop("location", None))

        payload = {
            **data,
            "created_by": to_object_id(created_by, "user_id"),
            "participants": participants,
            "location": location,
        }
        created = await self.trips_repo.create(payload)
        return serialize_trip_detail(created)

    async def update_trip(self, trip_id: str, data: dict) -> dict:
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        if start_date is not None or end_date is not None:
            current = await self.trips_repo.get_by_id(to_object_id(trip_id, "trip_id"))
            if not current:
                raise NotFoundError("Viaggio non trovato")
            self._validate_dates(start_date or current.get("start_date"), end_date or current.get("end_date"))

        payload = data.copy()
        if "location" in payload:
            payload["location"] = self._build_location(payload.pop("location"))

        updated = await self.trips_repo.update(to_object_id(trip_id, "trip_id"), payload)
        if not updated:
            raise NotFoundError("Viaggio non trovato")
        return serialize_trip_detail(updated)

    async def delete_trip(self, trip_id: str) -> None:
        deleted = await self.trips_repo.soft_delete(to_object_id(trip_id, "trip_id"))
        if not deleted:
            raise NotFoundError("Viaggio non trovato")

    async def map_markers(self, filters: dict) -> list[dict]:
        docs = await self.trips_repo.map_markers(filters)
        markers = []
        for doc in docs:
            coords = (doc.get("location") or {}).get("coordinates") or [None, None]
            markers.append(
                {
                    "trip_id": str(doc["_id"]),
                    "title": doc["title"],
                    "status": doc.get("status", "planned"),
                    "marker_color": "red" if doc.get("status") == "completed" else "green",
                    "lat": coords[1],
                    "lon": coords[0],
                    "destination": doc.get("destination"),
                }
            )
        return markers
