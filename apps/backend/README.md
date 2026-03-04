# Backend - SPA Viaggi

Backend FastAPI con MongoDB (PyMongo AsyncMongoClient), job worker per export PDF e API REST v1.

## Avvio locale

1. Copiare `.env.example` in `.env` e aggiornare i valori.
2. Avviare MongoDB (es. `docker compose` root progetto).
3. Installare dipendenze:
   - `cd apps/backend`
   - `pip install -e .[dev]`
4. Avviare API:
   - `uvicorn src.main:app --reload --port 8000`

## Worker export PDF

In un secondo terminale:
- `python -m src.workers.worker_main`

## Script utili

- `python scripts/seed_users.py`
- `python scripts/seed_trips.py`
- `python scripts/create_indexes.py`

## Endpoint principali

- Login: `POST /api/v1/auth/login`
- Trips CRUD: `/api/v1/trips`
- Participants: `/api/v1/trips/{trip_id}/participants`
- Activities: `/api/v1/trips/{trip_id}/activities`
- Expenses: `/api/v1/trips/{trip_id}/expenses`
- Mappa: `GET /api/v1/trips/map/markers`
- Export PDF: `POST /api/v1/trips/{trip_id}/exports/pdf`
