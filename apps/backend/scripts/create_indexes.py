import asyncio
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))

from src.core.config import get_settings
from src.infrastructure.db.client import close_client, get_database, ping_database
from src.infrastructure.db.indexes import create_indexes
from src.infrastructure.db.validators import apply_validators


async def main() -> None:
    settings = get_settings()
    db = get_database(settings)
    await ping_database(settings)
    await apply_validators(db)
    await create_indexes(db)
    print("Validator e indici creati/aggiornati")
    await close_client()


if __name__ == "__main__":
    asyncio.run(main())
