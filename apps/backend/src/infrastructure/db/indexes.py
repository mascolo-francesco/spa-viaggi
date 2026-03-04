from pymongo import ASCENDING, DESCENDING

from src.infrastructure.db import collections


async def create_indexes(db) -> None:
    await db[collections.USERS].create_index(
        [("username", ASCENDING)],
        unique=True,
        name="uq_users_username",
    )

    await db[collections.TRIPS].create_index(
        [("status", ASCENDING), ("start_date", DESCENDING)],
        name="ix_trips_status_start_date",
    )
    await db[collections.TRIPS].create_index(
        [("created_by", ASCENDING), ("start_date", DESCENDING)],
        name="ix_trips_owner_start_date",
    )
    await db[collections.TRIPS].create_index(
        [("location", "2dsphere")],
        name="ix_trips_location_2dsphere",
    )

    await db[collections.TRIP_ACTIVITIES].create_index(
        [("trip_id", ASCENDING), ("start_at", ASCENDING)],
        name="ix_activities_trip_start",
    )

    await db[collections.TRIP_EXPENSES].create_index(
        [("trip_id", ASCENDING), ("occurred_at", DESCENDING)],
        name="ix_expenses_trip_occurred",
    )
    await db[collections.TRIP_EXPENSES].create_index(
        [("trip_id", ASCENDING), ("category", ASCENDING)],
        name="ix_expenses_trip_category",
    )

    await db[collections.EXPORT_JOBS].create_index(
        [("status", ASCENDING), ("created_at", DESCENDING)],
        name="ix_export_jobs_status_created",
    )
