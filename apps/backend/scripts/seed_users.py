import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))

from src.core.config import get_settings
from src.infrastructure.db.client import close_client, get_database, ping_database
from src.infrastructure.repositories.users_repository import UsersRepository


async def main() -> None:
    seed_file = ROOT / "data" / "seed" / "users.json"
    data = json.loads(seed_file.read_text(encoding="utf-8"))

    settings = get_settings()
    db = get_database(settings)
    await ping_database(settings)

    repo = UsersRepository(db)
    inserted = await repo.seed_if_empty(data)
    print(f"Utenti inseriti: {inserted}")

    close_client()


if __name__ == "__main__":
    asyncio.run(main())
