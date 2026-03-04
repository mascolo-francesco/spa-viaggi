# Active Context

## Focus corrente
Implementazione completa backend in `apps/backend` secondo piano architetturale:
- API v1 complete per requisiti B->J
- logica applicativa per viaggi/partecipanti/attivita/spese/export
- integrazione MongoDB con validatori e indici
- worker asincrono per export PDF
- script seed e setup operativo

## Decisioni attive
- Backend in FastAPI con layer API/Application/Infrastructure.
- Driver Mongo: PyMongo `AsyncMongoClient` singleton app-wide.
- Pattern dati: `trips` + collezioni separate `trip_activities` / `trip_expenses`.
- Job export persistiti in `export_jobs` e processati da worker polling.
- Frontend delegato a `claude-sonnet-4.6` con React + shadcn/ui.

## Prossimi passi
1. Eseguire bootstrap locale (`create_indexes`, `seed_users`, `seed_trips`).
2. Aggiungere test integrazione con Mongo reale (container dedicato).
3. Stabilizzare contratto OpenAPI completo in `docs/api/openapi.yaml`.
4. Handoff frontend a Claude con sviluppo React/shadcn su API v1.
