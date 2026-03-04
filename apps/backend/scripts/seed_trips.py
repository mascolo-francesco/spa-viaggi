import asyncio
import json
import sys
from datetime import UTC, date, datetime, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))

from src.core.config import get_settings
from src.infrastructure.db.client import close_client, get_database, ping_database
from src.infrastructure.repositories.trips_repository import TripsRepository


async def main() -> None:
    seed_file = ROOT / "data" / "seed" / "trips.json"
    data = json.loads(seed_file.read_text(encoding="utf-8"))

    settings = get_settings()
    db = get_database(settings)
    await ping_database(settings)

    trips_repo = TripsRepository(db)

    cursor = db["users"].find({})
    users = await cursor.to_list(length=None)
    if not users:
        raise RuntimeError(
            "Nessun utente trovato in DB. Esegui prima: python scripts/seed_users.py"
        )
    user_by_username = {u["username"]: u["_id"] for u in users}

    docs = []
    now = datetime.now(UTC)
    for item in data:
        participant_ids = [user_by_username[name] for name in item.get("participants_usernames", []) if name in user_by_username]
        loc = item.get("location")
        location = None
        if loc:
            location = {"type": "Point", "coordinates": [loc["lon"], loc["lat"]]}

        docs.append(
            {
                "title": item["title"],
                "destination": item.get("destination"),
                "description": item.get("description"),
                "start_date": (
                    datetime.combine(date.fromisoformat(item["start_date"]), time.min, tzinfo=UTC)
                    if item.get("start_date")
                    else None
                ),
                "end_date": (
                    datetime.combine(date.fromisoformat(item["end_date"]), time.min, tzinfo=UTC)
                    if item.get("end_date")
                    else None
                ),
                "status": item.get("status", "planned"),
                "location": location,
                "participants": participant_ids,
                "extra": item.get("extra"),
                "created_by": participant_ids[0] if participant_ids else next(iter(user_by_username.values())),
                "created_at": now,
                "updated_at": now,
                "deleted_at": None,
            }
        )

    inserted = await trips_repo.seed_if_empty(docs)
    print(f"Viaggi inseriti: {inserted}")
    await close_client()


if __name__ == "__main__":
    asyncio.run(main())
