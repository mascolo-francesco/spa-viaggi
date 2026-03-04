from datetime import datetime

from pydantic import BaseModel


class ParticipantItem(BaseModel):
    user_id: str
    username: str
    display_name: str | None = None


class ParticipantsResponse(BaseModel):
    trip_id: str
    participants: list[ParticipantItem]
    updated_at: datetime | None = None


class ReplaceParticipantsRequest(BaseModel):
    user_ids: list[str]


class AddParticipantRequest(BaseModel):
    user_id: str
