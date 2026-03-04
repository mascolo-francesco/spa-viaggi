from bson import ObjectId


def serialize_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "username": doc["username"],
        "display_name": doc.get("display_name"),
    }


def serialize_trip_summary(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "title": doc["title"],
        "destination": doc.get("destination"),
        "start_date": doc.get("start_date"),
        "end_date": doc.get("end_date"),
        "status": doc.get("status", "planned"),
        "participants_count": len(doc.get("participants", [])),
        "created_at": doc.get("created_at"),
    }


def serialize_trip_detail(doc: dict) -> dict:
    location = doc.get("location")
    location_out = None
    if isinstance(location, dict) and location.get("type") == "Point":
        coords = location.get("coordinates") or [None, None]
        location_out = {"lat": coords[1], "lon": coords[0]}

    participants = [str(x) for x in doc.get("participants", [])]

    return {
        "id": str(doc["_id"]),
        "title": doc["title"],
        "destination": doc.get("destination"),
        "description": doc.get("description"),
        "start_date": doc.get("start_date"),
        "end_date": doc.get("end_date"),
        "status": doc.get("status", "planned"),
        "location": location_out,
        "participants": participants,
        "extra": doc.get("extra"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


def serialize_activity(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "trip_id": str(doc["trip_id"]),
        "title": doc["title"],
        "type": doc.get("type"),
        "start_at": doc.get("start_at"),
        "end_at": doc.get("end_at"),
        "notes": doc.get("notes"),
        "cost_estimate": doc.get("cost_estimate"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


def serialize_expense(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "trip_id": str(doc["trip_id"]),
        "category": doc["category"],
        "amount": float(doc["amount"]),
        "currency": doc["currency"],
        "paid_by": doc.get("paid_by"),
        "shared_with": [str(x) for x in doc.get("shared_with", [])],
        "occurred_at": doc.get("occurred_at"),
        "notes": doc.get("notes"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


def serialize_export_job(doc: dict) -> dict:
    return {
        "job_id": str(doc["_id"]),
        "trip_id": str(doc["trip_id"]),
        "status": doc["status"],
        "error": doc.get("error"),
        "file_ready": bool(doc.get("file_path")) and doc.get("status") == "succeeded",
        "created_at": doc.get("created_at"),
        "started_at": doc.get("started_at"),
        "finished_at": doc.get("finished_at"),
    }


def parse_user_ids(values: list[str]) -> list[ObjectId]:
    return [ObjectId(value) for value in values]
