from datetime import date

from fastapi import APIRouter, Depends, Query, status

from src.api.dependencies import get_trips_service
from src.api.schemas.common import MessageResponse
from src.api.schemas.trips import (
    TripCreate,
    TripDetail,
    TripListResponse,
    TripMapMarker,
    TripUpdate,
)
from src.application.use_cases.trips_service import TripsService
from src.core.security import get_current_user_id

router = APIRouter()


@router.get("/map/markers", response_model=list[TripMapMarker])
async def map_markers(
    status_filter: str | None = Query(default=None, alias="status"),
    from_date: date | None = None,
    to_date: date | None = None,
    service: TripsService = Depends(get_trips_service),
    _user_id: str = Depends(get_current_user_id),
) -> list[dict]:
    filters: dict = {}
    if status_filter:
        filters["status"] = status_filter
    if from_date or to_date:
        date_filter = {}
        if from_date:
            date_filter["$gte"] = from_date
        if to_date:
            date_filter["$lte"] = to_date
        filters["start_date"] = date_filter
    return await service.map_markers(filters)


@router.get("", response_model=TripListResponse)
async def list_trips(
    status_filter: str | None = Query(default=None, alias="status"),
    destination: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    sort: str = "-start_date",
    service: TripsService = Depends(get_trips_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    filters: dict = {}
    if status_filter:
        filters["status"] = status_filter
    if destination:
        filters["$or"] = [
            {"destination.city": {"$regex": destination, "$options": "i"}},
            {"destination.country": {"$regex": destination, "$options": "i"}},
        ]
    if from_date or to_date:
        date_filter = {}
        if from_date:
            date_filter["$gte"] = from_date
        if to_date:
            date_filter["$lte"] = to_date
        filters["start_date"] = date_filter

    return await service.list_trips(filters, page, limit, sort)


@router.post("", response_model=TripDetail, status_code=status.HTTP_201_CREATED)
async def create_trip(
    payload: TripCreate,
    service: TripsService = Depends(get_trips_service),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.create_trip(payload.model_dump(), user_id)


@router.get("/{trip_id}", response_model=TripDetail)
async def get_trip(
    trip_id: str,
    service: TripsService = Depends(get_trips_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.get_trip(trip_id)


@router.patch("/{trip_id}", response_model=TripDetail)
async def update_trip(
    trip_id: str,
    payload: TripUpdate,
    service: TripsService = Depends(get_trips_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    data = payload.model_dump(exclude_none=True)
    return await service.update_trip(trip_id, data)


@router.delete("/{trip_id}", response_model=MessageResponse)
async def delete_trip(
    trip_id: str,
    service: TripsService = Depends(get_trips_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    await service.delete_trip(trip_id)
    return {"message": "Viaggio eliminato"}
