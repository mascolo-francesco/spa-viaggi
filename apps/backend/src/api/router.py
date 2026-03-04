from fastapi import APIRouter

from src.api.v1 import (
    activities,
    auth,
    expenses,
    exports,
    health,
    participants,
    trips,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(trips.router, prefix="/trips", tags=["trips"])
api_router.include_router(participants.router, prefix="/trips", tags=["participants"])
api_router.include_router(activities.router, prefix="/trips", tags=["activities"])
api_router.include_router(expenses.router, prefix="/trips", tags=["expenses"])
api_router.include_router(exports.router, tags=["exports"])
