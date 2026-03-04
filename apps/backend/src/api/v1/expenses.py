from fastapi import APIRouter, Depends, status

from src.api.dependencies import get_expenses_service
from src.api.schemas.common import MessageResponse
from src.api.schemas.expenses import ExpenseCreate, ExpenseItem, ExpenseSummary, ExpenseUpdate
from src.application.use_cases.expenses_service import ExpensesService
from src.core.security import get_current_user_id

router = APIRouter()


@router.get("/{trip_id}/expenses", response_model=list[ExpenseItem])
async def list_expenses(
    trip_id: str,
    service: ExpensesService = Depends(get_expenses_service),
    _user_id: str = Depends(get_current_user_id),
) -> list[dict]:
    return await service.list(trip_id)


@router.post("/{trip_id}/expenses", response_model=ExpenseItem, status_code=status.HTTP_201_CREATED)
async def create_expense(
    trip_id: str,
    payload: ExpenseCreate,
    service: ExpensesService = Depends(get_expenses_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.create(trip_id, payload.model_dump(exclude_none=True))


@router.patch("/{trip_id}/expenses/{expense_id}", response_model=ExpenseItem)
async def update_expense(
    trip_id: str,
    expense_id: str,
    payload: ExpenseUpdate,
    service: ExpensesService = Depends(get_expenses_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.update(trip_id, expense_id, payload.model_dump(exclude_none=True))


@router.delete("/{trip_id}/expenses/{expense_id}", response_model=MessageResponse)
async def delete_expense(
    trip_id: str,
    expense_id: str,
    service: ExpensesService = Depends(get_expenses_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    await service.delete(trip_id, expense_id)
    return {"message": "Spesa eliminata"}


@router.get("/{trip_id}/expenses/summary", response_model=ExpenseSummary)
async def get_expenses_summary(
    trip_id: str,
    service: ExpensesService = Depends(get_expenses_service),
    _user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.summary(trip_id)
