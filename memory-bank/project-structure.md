# Project Structure Plan

## Root layout (target)

```text
SPA-viaggi/
├─ apps/
│  ├─ backend/
│  │  ├─ pyproject.toml
│  │  ├─ README.md
│  │  ├─ .env.example
│  │  ├─ src/
│  │  │  ├─ main.py
│  │  │  ├─ core/
│  │  │  │  ├─ config.py
│  │  │  │  ├─ logging.py
│  │  │  │  ├─ security.py
│  │  │  │  ├─ errors.py
│  │  │  │  └─ dependencies.py
│  │  │  ├─ api/
│  │  │  │  ├─ router.py
│  │  │  │  ├─ middleware.py
│  │  │  │  ├─ schemas/
│  │  │  │  └─ v1/
│  │  │  │     ├─ auth.py
│  │  │  │     ├─ trips.py
│  │  │  │     ├─ participants.py
│  │  │  │     ├─ activities.py
│  │  │  │     ├─ expenses.py
│  │  │  │     ├─ map.py
│  │  │  │     ├─ exports.py
│  │  │  │     └─ health.py
│  │  │  ├─ domain/
│  │  │  │  ├─ models/
│  │  │  │  ├─ services/
│  │  │  │  └─ exceptions.py
│  │  │  ├─ application/
│  │  │  │  ├─ use_cases/
│  │  │  │  └─ dto/
│  │  │  ├─ infrastructure/
│  │  │  │  ├─ db/
│  │  │  │  │  ├─ client.py
│  │  │  │  │  ├─ collections.py
│  │  │  │  │  ├─ indexes.py
│  │  │  │  │  └─ validators.py
│  │  │  │  ├─ repositories/
│  │  │  │  ├─ queue/
│  │  │  │  ├─ pdf/
│  │  │  │  └─ observability/
│  │  │  ├─ workers/
│  │  │  │  ├─ worker_main.py
│  │  │  │  └─ jobs/
│  │  │  │     ├─ export_pdf_job.py
│  │  │  │     └─ recalc_summaries_job.py
│  │  │  └─ tests/
│  │  │     ├─ unit/
│  │  │     ├─ integration/
│  │  │     └─ contract/
│  │  └─ scripts/
│  │     ├─ seed_users.py
│  │     ├─ seed_trips.py
│  │     └─ create_indexes.py
│  └─ frontend/
│     ├─ package.json
│     ├─ src/
│     └─ ... (ownership Claude)
├─ data/
│  ├─ seed/
│  │  ├─ users.json
│  │  └─ trips.json
│  └─ exports/
├─ infra/
│  ├─ docker/
│  │  ├─ Dockerfile.backend
│  │  └─ Dockerfile.worker
│  ├─ docker-compose.yml
│  └─ mongo/
│     └─ init.js
├─ docs/
│  ├─ api/
│  │  └─ openapi.yaml
│  ├─ architecture/
│  │  └─ backend-overview.md
│  └─ runbooks/
│     ├─ local-dev.md
│     └─ worker-ops.md
├─ memory-bank/
│  ├─ projectbrief.md
│  ├─ productContext.md
│  ├─ systemPatterns.md
│  ├─ techContext.md
│  ├─ activeContext.md
│  ├─ progress.md
│  ├─ backend-plan.md
│  ├─ project-structure.md
│  └─ frontend-responsibilities.md
└─ README.md
```

## Ruolo file principali
- `apps/backend/src/main.py`: bootstrap FastAPI, startup/shutdown, router root.
- `core/config.py`: settings centralizzate (env, URI DB, pool, queue).
- `infrastructure/db/client.py`: istanza singleton `AsyncMongoClient`.
- `infrastructure/db/indexes.py`: creazione indici idempotente.
- `application/use_cases/*`: logica applicativa orchestrata e testabile.
- `api/v1/*.py`: mapping HTTP -> use case.
- `workers/jobs/export_pdf_job.py`: pipeline export asincrona.
- `scripts/seed_*.py`: popolamento DB iniziale richiesto dalla prova.
- `docs/api/openapi.yaml`: contratto condiviso backend/frontend.

## Convenzioni naming
- Endpoint versionati `/api/v1/...`
- Collezioni Mongo al plurale snake_case (`trip_expenses`).
- Moduli Python snake_case, classi PascalCase, costanti UPPER_SNAKE_CASE.
