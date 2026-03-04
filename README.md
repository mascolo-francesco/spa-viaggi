# SPA Viaggi

Repository monorepo per applicazione SPA di organizzazione viaggi di gruppo.

## Struttura

- `apps/backend`: backend FastAPI + MongoDB + worker export PDF
- `apps/frontend`: frontend React (ownership `claude-sonnet-4.6`)
- `data/seed`: dataset iniziale utenti/viaggi
- `data/exports`: output file PDF
- `infra`: docker, compose, init Mongo
- `docs`: documentazione tecnica
- `memory-bank`: contesto progetto e piano architetturale

## Quick start

1. Avvio servizi:
   - `cd infra`
   - `docker compose up --build`
2. Seed dati backend (in locale, con virtualenv backend):
   - `python apps/backend/scripts/create_indexes.py`
   - `python apps/backend/scripts/seed_users.py`
   - `python apps/backend/scripts/seed_trips.py`
3. Swagger:
   - `http://localhost:8000/docs`

## Frontend

Lo sviluppo frontend e demandato a `claude-sonnet-4.6` con React + shadcn/ui.
