from datetime import datetime

from pydantic import BaseModel, Field


class ActivityCreate(BaseModel):
    title: str = Field(min_length=2)
    type: str | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    notes: str | None = None
    cost_estimate: float | None = Field(default=None, ge=0)


class ActivityUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2)
    type: str | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    notes: str | None = None
    cost_estimate: float | None = Field(default=None, ge=0)


class ActivityItem(BaseModel):
    id: str
    trip_id: str
    title: str
    type: str | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    notes: str | None = None
    cost_estimate: float | None = None
    created_at: datetime
    updated_at: datetime | None = None
