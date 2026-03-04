# Active Context

## Focus corrente
Implementazione completa backend in `apps/backend` secondo piano architetturale:
- API v1 complete per requisiti B->J
- logica applicativa per viaggi/partecipanti/attivita/spese/export
- integrazione MongoDB con validatori e indici
- worker asincrono per export PDF
- script seed e setup operativo
- configurazione cloud MongoDB Atlas validata

## Decisioni attive
- Backend in FastAPI con layer API/Application/Infrastructure.
- Driver Mongo: PyMongo `AsyncMongoClient` singleton app-wide.
- Pattern dati: `trips` + collezioni separate `trip_activities` / `trip_expenses`.
- Job export persistiti in `export_jobs` e processati da worker polling su MongoDB.
- Database deployment attivo su MongoDB Atlas (`mongodb+srv`), non su Mongo locale.
- Frontend delegato a `claude-sonnet-4.6` con React + shadcn/ui.

## Prossimi passi
1. Handoff frontend a Claude con sviluppo React/shadcn su API v1.
2. Aggiungere test integrazione in CI (backend + worker).
3. Stabilizzare contratto OpenAPI completo in `docs/api/openapi.yaml`.
