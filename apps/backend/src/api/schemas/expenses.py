from datetime import datetime

from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):
    category: str = Field(min_length=2)
    amount: float = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    paid_by: str | None = None
    shared_with: list[str] = Field(default_factory=list)
    occurred_at: datetime | None = None
    notes: str | None = None


class ExpenseUpdate(BaseModel):
    category: str | None = Field(default=None, min_length=2)
    amount: float | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    paid_by: str | None = None
    shared_with: list[str] | None = None
    occurred_at: datetime | None = None
    notes: str | None = None


class ExpenseItem(BaseModel):
    id: str
    trip_id: str
    category: str
    amount: float
    currency: str
    paid_by: str | None = None
    shared_with: list[str]
    occurred_at: datetime | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class ExpenseSummary(BaseModel):
    trip_id: str
    currency: str
    total_amount: float
    by_category: list[dict]
