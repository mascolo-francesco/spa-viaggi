# Tech Context

## Stack target
- Backend framework: `FastAPI` (Python 3.12+).
- ASGI server: `uvicorn` (eventuale `gunicorn` in produzione).
- DB target: `MongoDB Atlas` (cloud, replica set managed).
- Driver Mongo: `PyMongo` con `AsyncMongoClient` (API async ufficiale).
- Validazione/config: `pydantic v2` + `pydantic-settings`.
- Password hashing: `bcrypt` nativo.
- PDF: `reportlab` (render server-side).
- Queue/job: DB-backed queue su collection `export_jobs` + worker polling.
- Test: `pytest`, `pytest-asyncio`, `httpx`, `mongomock`/DB test dedicato.

## Best practice MongoDB (retrieval Context7, 2026-03-04)
- Evitare array non bounded che crescono indefinitamente (impatto su write e performance).
- Favorire update atomici single-document come default.
- Usare transazioni multi-document solo quando servono invarianti cross-document.
- Progettare indici coerenti con i filtri API (composti per owner/status/date).
- Per mappe, usare indice geospaziale `2dsphere` su coordinate GeoJSON.
- Gestire lifecycle client DB con istanza unica app-wide e pool configurato.
- Configurare timeouts/pool/retry (`maxPoolSize`, `waitQueueTimeoutMS`, `retryWrites`, `serverSelectionTimeoutMS`).
- Applicare validazione schema collezioni tramite `$jsonSchema`.

## Nota driver async
Scelta primaria: `PyMongo AsyncMongoClient` (driver ufficiale unificato).  
`Motor` resta alternativa legacy/compatibilita ma non prima scelta per nuovo progetto.

## Vincoli operativi
- Nessuna registrazione pubblica utenti.
- Login semplice (no IAM avanzato obbligatorio).
- Dataset seed iniziale: almeno 3 utenti, almeno 10 viaggi.
- Runtime configurato su Atlas via `MONGODB_URI=mongodb+srv://...`.
