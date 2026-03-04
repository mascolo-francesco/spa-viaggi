from pymongo.errors import OperationFailure

from src.infrastructure.db import collections


async def _apply_validator(db, coll_name: str, validator: dict) -> None:
    try:
        await db.command(
            {
                "collMod": coll_name,
                "validator": validator,
                "validationLevel": "moderate",
            }
        )
    except OperationFailure as exc:
        # NamespaceNotFound: la collection non esiste ancora.
        if "NamespaceNotFound" in str(exc):
            await db.create_collection(coll_name, validator=validator)
        else:
            raise


async def apply_validators(db) -> None:
    users_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["username", "password_hash", "is_active", "created_at"],
            "properties": {
                "username": {"bsonType": "string", "minLength": 3},
                "password_hash": {"bsonType": "string"},
                "display_name": {"bsonType": "string"},
                "is_active": {"bsonType": "bool"},
            },
        }
    }

    trips_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["title", "status", "created_at", "created_by"],
            "properties": {
                "title": {"bsonType": "string", "minLength": 3},
                "status": {"enum": ["planned", "completed", "cancelled"]},
                "location": {
                    "bsonType": ["object", "null"],
                    "properties": {
                        "type": {"enum": ["Point"]},
                        "coordinates": {
                            "bsonType": "array",
                            "minItems": 2,
                            "maxItems": 2,
                        },
                    },
                },
                "participants": {"bsonType": "array"},
                "extra": {"bsonType": ["object", "null"]},
            },
        }
    }

    activities_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["trip_id", "title", "created_at"],
            "properties": {
                "trip_id": {"bsonType": "objectId"},
                "title": {"bsonType": "string"},
                "notes": {"bsonType": ["string", "null"]},
            },
        }
    }

    expenses_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["trip_id", "category", "amount", "currency", "created_at"],
            "properties": {
                "trip_id": {"bsonType": "objectId"},
                "category": {"bsonType": "string"},
                "amount": {"bsonType": ["double", "decimal", "int", "long"]},
                "currency": {"bsonType": "string", "minLength": 3, "maxLength": 3},
            },
        }
    }

    export_jobs_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["trip_id", "requested_by", "status", "created_at"],
            "properties": {
                "trip_id": {"bsonType": "objectId"},
                "requested_by": {"bsonType": "objectId"},
                "status": {"enum": ["queued", "running", "succeeded", "failed"]},
                "file_path": {"bsonType": ["string", "null"]},
            },
        }
    }

    await _apply_validator(db, collections.USERS, users_validator)
    await _apply_validator(db, collections.TRIPS, trips_validator)
    await _apply_validator(db, collections.TRIP_ACTIVITIES, activities_validator)
    await _apply_validator(db, collections.TRIP_EXPENSES, expenses_validator)
    await _apply_validator(db, collections.EXPORT_JOBS, export_jobs_validator)
