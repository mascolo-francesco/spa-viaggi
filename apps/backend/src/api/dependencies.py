from fastapi import Depends

from src.application.use_cases import (
    ActivitiesService,
    AuthService,
    ExpensesService,
    ExportsService,
    ParticipantsService,
    TripsService,
)
from src.core.config import Settings, get_settings
from src.core.dependencies import get_db
from src.infrastructure.queue.job_queue import JobQueue
from src.infrastructure.repositories import (
    ActivitiesRepository,
    ExpensesRepository,
    ExportsRepository,
    TripsRepository,
    UsersRepository,
)


def get_users_repo(db=Depends(get_db)) -> UsersRepository:
    return UsersRepository(db)


def get_trips_repo(db=Depends(get_db)) -> TripsRepository:
    return TripsRepository(db)


def get_activities_repo(db=Depends(get_db)) -> ActivitiesRepository:
    return ActivitiesRepository(db)


def get_expenses_repo(db=Depends(get_db)) -> ExpensesRepository:
    return ExpensesRepository(db)


def get_exports_repo(db=Depends(get_db)) -> ExportsRepository:
    return ExportsRepository(db)


def get_queue() -> JobQueue:
    return JobQueue()


def get_auth_service(
    users_repo: UsersRepository = Depends(get_users_repo),
    settings: Settings = Depends(get_settings),
) -> AuthService:
    return AuthService(users_repo=users_repo, settings=settings)


def get_trips_service(
    trips_repo: TripsRepository = Depends(get_trips_repo),
) -> TripsService:
    return TripsService(trips_repo=trips_repo)


def get_participants_service(
    trips_repo: TripsRepository = Depends(get_trips_repo),
    users_repo: UsersRepository = Depends(get_users_repo),
) -> ParticipantsService:
    return ParticipantsService(trips_repo=trips_repo, users_repo=users_repo)


def get_activities_service(
    trips_repo: TripsRepository = Depends(get_trips_repo),
    activities_repo: ActivitiesRepository = Depends(get_activities_repo),
) -> ActivitiesService:
    return ActivitiesService(trips_repo=trips_repo, activities_repo=activities_repo)


def get_expenses_service(
    trips_repo: TripsRepository = Depends(get_trips_repo),
    expenses_repo: ExpensesRepository = Depends(get_expenses_repo),
) -> ExpensesService:
    return ExpensesService(trips_repo=trips_repo, expenses_repo=expenses_repo)


def get_exports_service(
    trips_repo: TripsRepository = Depends(get_trips_repo),
    exports_repo: ExportsRepository = Depends(get_exports_repo),
    queue: JobQueue = Depends(get_queue),
    settings: Settings = Depends(get_settings),
) -> ExportsService:
    return ExportsService(
        trips_repo=trips_repo,
        exports_repo=exports_repo,
        queue=queue,
        settings=settings,
    )
