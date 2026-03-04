from fastapi import APIRouter, Depends

from src.api.dependencies import get_participants_service
from src.api.schemas.participants import (
    AddParticipantRequest,
    ParticipantsResponse,
    ReplaceParticipantsRequest,
)
from src.application.use_cases.participants_service import ParticipantsService
from src.core.security import get_current_user_id

router = APIRouter()


@router.get("/{trip_id}/participants", response_model=ParticipantsResponse)
async def get_participants(
    trip_id: str,
    service: ParticipantsService = Depends(get_participants_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.get_participants(trip_id)


@router.put("/{trip_id}/participants", response_model=ParticipantsResponse)
async def replace_participants(
    trip_id: str,
    payload: ReplaceParticipantsRequest,
    service: ParticipantsService = Depends(get_participants_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.replace_participants(trip_id, payload.user_ids)


@router.post("/{trip_id}/participants", response_model=ParticipantsResponse)
async def add_participant(
    trip_id: str,
    payload: AddParticipantRequest,
    service: ParticipantsService = Depends(get_participants_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.add_participant(trip_id, payload.user_id)


@router.delete("/{trip_id}/participants/{user_id}", response_model=ParticipantsResponse)
async def remove_participant(
    trip_id: str,
    user_id: str,
    service: ParticipantsService = Depends(get_participants_service),
    _current_user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.remove_participant(trip_id, user_id)
