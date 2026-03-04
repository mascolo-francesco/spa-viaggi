from fastapi import APIRouter, Depends, status

from src.api.dependencies import get_activities_service
from src.api.schemas.activities import ActivityCreate, ActivityItem, ActivityUpdate
from src.api.schemas.common import MessageResponse
from src.application.use_cases.activities_service import ActivitiesService
from src.core.security import get_current_user_id

router = APIRouter()


@router.get("/{trip_id}/activities", response_model=list[ActivityItem])
async def list_activities(
    trip_id: str,
    service: ActivitiesService = Depends(get_activities_service),
    _user_id: str = Depends(get_current_user_id),
) -> list[dict]:
    return await service.list(trip_id)


@router.post("/{trip_id}/activities", response_model=ActivityItem, status_code=status.HTTP_201_CREATED)
async def create_activity(
    trip_id: str,
    payload: ActivityCreate,
    service: ActivitiesService = Depends(get_activities_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.create(trip_id, payload.model_dump(exclude_none=True))


@router.patch("/{trip_id}/activities/{activity_id}", response_model=ActivityItem)
async def update_activity(
    trip_id: str,
    activity_id: str,
    payload: ActivityUpdate,
    service: ActivitiesService = Depends(get_activities_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.update(trip_id, activity_id, payload.model_dump(exclude_none=True))


@router.delete("/{trip_id}/activities/{activity_id}", response_model=MessageResponse)
async def delete_activity(
    trip_id: str,
    activity_id: str,
    service: ActivitiesService = Depends(get_activities_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    await service.delete(trip_id, activity_id)
    return {"message": "Attivita eliminata"}
