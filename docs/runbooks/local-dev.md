# Local Development

## Backend

1. `cd apps/backend`
2. `pip install -e .[dev]`
3. `cp .env.example .env`
4. Avvio Mongo locale (`cd infra && docker compose up mongo -d`)
5. `python scripts/create_indexes.py`
6. `python scripts/seed_users.py`
7. `python scripts/seed_trips.py`
8. `uvicorn src.main:app --reload --port 8000`

## Worker

- `python -m src.workers.worker_main`
