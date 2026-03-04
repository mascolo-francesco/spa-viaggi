# Progress

## Completato
- Analisi `SPEC.md`.
- Raccolta best practice MongoDB e driver Python tramite Context7.
- Definizione piano architetturale backend.
- Definizione struttura progetto e ownership frontend/backend.
- Inizializzazione file core Memory Bank.
- Implementazione backend completo in `apps/backend`:
  - FastAPI app + router v1 (`auth`, `trips`, `participants`, `activities`, `expenses`, `exports`, `health`)
  - Use case layer e repository MongoDB
  - Config/security (JWT + password hashing `bcrypt`)
  - Validator `$jsonSchema` e indici (incl. `2dsphere`)
  - Worker asincrono per export PDF con tracking stato job (`export_jobs`)
  - Script seed/setup DB e dataset iniziale (`3 users`, `10 trips`)
  - Configurazione MongoDB Atlas (`mongodb+srv://`) operativa
  - Documentazione tecnica (`docs/architecture`, `docs/runbooks`)
  - Test end-to-end API completato con esito positivo su tutti i flussi principali

## Da implementare
- Implementazione frontend (a carico di Claude).
- Test E2E backend completi con Mongo reale e worker in CI.
- Hardening produzione (rate limit, audit avanzato, rotazione secret JWT).
- Export OpenAPI completo statico per contract testing.

## Rischi aperti
- Tradeoff consistenza immediata vs eventual consistency per riepiloghi spese.
- Complessita transazioni Mongo in ambiente non replica set.
- Definizione finale strategia auth (semplice vs JWT minimale).
