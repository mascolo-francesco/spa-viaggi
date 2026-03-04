from fastapi import APIRouter, Depends

from src.api.dependencies import get_auth_service
from src.api.schemas.auth import LoginRequest, LoginResponse
from src.application.use_cases.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, service: AuthService = Depends(get_auth_service)) -> dict:
    return await service.login(payload.username, payload.password)
