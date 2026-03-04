from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class Destination(BaseModel):
    city: str | None = None
    country: str | None = None
    address: str | None = None


class LocationInput(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)


class TripBase(BaseModel):
    title: str = Field(min_length=3)
    destination: Destination | None = None
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str = "planned"
    location: LocationInput | None = None
    extra: dict[str, Any] | None = None


class TripCreate(TripBase):
    participants: list[str] = Field(default_factory=list)


class TripUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3)
    destination: Destination | None = None
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None
    location: LocationInput | None = None
    participants: list[str] | None = None
    extra: dict[str, Any] | None = None


class TripSummary(BaseModel):
    id: str
    title: str
    destination: Destination | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str
    participants_count: int
    created_at: datetime


class TripDetail(BaseModel):
    id: str
    title: str
    destination: Destination | None = None
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str
    location: LocationInput | None = None
    participants: list[str]
    extra: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime | None = None


class TripListResponse(BaseModel):
    items: list[TripSummary]
    total: int
    page: int
    limit: int


class TripMapMarker(BaseModel):
    trip_id: str
    title: str
    status: str
    marker_color: str
    lat: float
    lon: float
    destination: Destination | None = None
