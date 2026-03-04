from src.application.use_cases.serializers import serialize_expense
from src.core.bson import to_object_id
from src.core.errors import NotFoundError
from src.infrastructure.repositories.expenses_repository import ExpensesRepository
from src.infrastructure.repositories.trips_repository import TripsRepository
from fastapi import HTTPException, status


class ExpensesService:
    def __init__(self, trips_repo: TripsRepository, expenses_repo: ExpensesRepository) -> None:
        self.trips_repo = trips_repo
        self.expenses_repo = expenses_repo

    async def list(self, trip_id: str) -> list[dict]:
        trip_oid = to_object_id(trip_id, "trip_id")
        trip = await self.trips_repo.get_by_id(trip_oid)
        if not trip:
            raise NotFoundError("Viaggio non trovato")
        docs = await self.expenses_repo.list_by_trip(trip_oid)
        return [serialize_expense(doc) for doc in docs]

    async def create(self, trip_id: str, data: dict) -> dict:
        trip_oid = to_object_id(trip_id, "trip_id")
        trip = await self.trips_repo.get_by_id(trip_oid)
        if not trip:
            raise NotFoundError("Viaggio non trovato")

        if data.get("amount", 0) <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"code": "INVALID_AMOUNT", "message": "L'importo deve essere > 0"},
            )

        created = await self.expenses_repo.create(trip_oid, data)
        return serialize_expense(created)

    async def update(self, trip_id: str, expense_id: str, data: dict) -> dict:
        updated = await self.expenses_repo.update(
            to_object_id(trip_id, "trip_id"),
            to_object_id(expense_id, "expense_id"),
            data,
        )
        if not updated:
            raise NotFoundError("Spesa non trovata")
        return serialize_expense(updated)

    async def delete(self, trip_id: str, expense_id: str) -> None:
        deleted = await self.expenses_repo.delete(
            to_object_id(trip_id, "trip_id"),
            to_object_id(expense_id, "expense_id"),
        )
        if not deleted:
            raise NotFoundError("Spesa non trovata")

    async def summary(self, trip_id: str) -> dict:
        trip_oid = to_object_id(trip_id, "trip_id")
        trip = await self.trips_repo.get_by_id(trip_oid)
        if not trip:
            raise NotFoundError("Viaggio non trovato")
        return await self.expenses_repo.summary_by_trip(trip_oid)
