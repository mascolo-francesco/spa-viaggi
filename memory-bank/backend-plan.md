# Backend Plan (Comprehensive)

## 1) Architettura backend

### 1.1 Stile
Modular monolith con moduli dominio indipendenti e contratti stabili interni.

### 1.2 Moduli
- `auth`: login utenti esistenti.
- `trips`: anagrafica viaggio e stato (`planned`, `completed`, `cancelled`).
- `participants`: membership viaggio.
- `activities`: tappe/eventi del viaggio.
- `expenses`: spese e riepilogo costi.
- `map`: marker geolocalizzati.
- `exports`: generazione PDF, download e tracking job.

### 1.3 Layering interno
- `api/routers`: endpoint REST.
- `application/use_cases`: logica applicativa orchestrata.
- `domain/models`: regole business pure.
- `infrastructure/repositories`: accesso MongoDB.
- `infrastructure/queue`: enqueue job.
- `workers`: processi asincroni fuori request-response.

## 2) API design (v1)

### Auth
- `POST /api/v1/auth/login`
  - Input: `username`, `password`
  - Output: `access_token`, `token_type`, `user`

### Trips
- `GET /api/v1/trips`
  - Query: `status`, `from_date`, `to_date`, `destination`, `page`, `limit`, `sort`
- `POST /api/v1/trips`
- `GET /api/v1/trips/{trip_id}`
- `PATCH /api/v1/trips/{trip_id}`
- `DELETE /api/v1/trips/{trip_id}` (soft delete consigliato)

### Participants
- `GET /api/v1/trips/{trip_id}/participants`
- `PUT /api/v1/trips/{trip_id}/participants` (replace list)
- `POST /api/v1/trips/{trip_id}/participants` (add one)
- `DELETE /api/v1/trips/{trip_id}/participants/{user_id}`

### Activities
- `GET /api/v1/trips/{trip_id}/activities`
- `POST /api/v1/trips/{trip_id}/activities`
- `PATCH /api/v1/trips/{trip_id}/activities/{activity_id}`
- `DELETE /api/v1/trips/{trip_id}/activities/{activity_id}`

### Expenses
- `GET /api/v1/trips/{trip_id}/expenses`
- `POST /api/v1/trips/{trip_id}/expenses`
- `PATCH /api/v1/trips/{trip_id}/expenses/{expense_id}`
- `DELETE /api/v1/trips/{trip_id}/expenses/{expense_id}`
- `GET /api/v1/trips/{trip_id}/expenses/summary`
  - Output: totale, per categoria, per partecipante (se valorizzato)

### Map
- `GET /api/v1/trips/map/markers`
  - Query opzionali: `status`, `bbox`, `from_date`, `to_date`
  - Output: marker con `coordinates`, `status`, `title`, `trip_id`

### Export PDF
- `POST /api/v1/trips/{trip_id}/exports/pdf`
  - Crea job asincrono
- `GET /api/v1/exports/{job_id}`
  - Stato job: `queued | running | succeeded | failed`
- `GET /api/v1/exports/{job_id}/download`
  - Download file finale

### Ops
- `GET /health/live`
- `GET /health/ready`

## 3) Modello dati MongoDB

### 3.1 Collezioni principali
- `users`
- `trips`
- `trip_activities`
- `trip_expenses`
- `export_jobs`
- `audit_logs` (opzionale ma raccomandata)

### 3.2 Schema logico sintetico

`users`
- `_id`, `username` (unique), `password_hash`, `display_name`, `created_at`, `is_active`

`trips`
- `_id`, `title`, `destination` `{city,country,address}`
- `location` (GeoJSON Point), `start_date`, `end_date`
- `status` (`planned|completed|cancelled`)
- `description`, `participants` (array limitato), `extra` (dict libero)
- `created_by`, `created_at`, `updated_at`, `deleted_at`

`trip_activities`
- `_id`, `trip_id`, `title`, `type`, `start_at`, `end_at`, `notes`, `cost_estimate`, `created_at`, `updated_at`

`trip_expenses`
- `_id`, `trip_id`, `category`, `amount`, `currency`, `paid_by`, `shared_with[]`, `occurred_at`, `notes`, `created_at`, `updated_at`

`export_jobs`
- `_id`, `trip_id`, `requested_by`, `status`, `error`, `file_path`, `created_at`, `started_at`, `finished_at`, `attempts`

### 3.3 Indici consigliati
- `users`: `{username: 1}` unique
- `trips`: `{status: 1, start_date: -1}`
- `trips`: `{created_by: 1, start_date: -1}`
- `trips`: `{location: "2dsphere"}`
- `trip_activities`: `{trip_id: 1, start_at: 1}`
- `trip_expenses`: `{trip_id: 1, occurred_at: -1}`
- `trip_expenses`: `{trip_id: 1, category: 1}`
- `export_jobs`: `{status: 1, created_at: -1}`

### 3.4 Validazione
Usare `collMod` + `$jsonSchema` per campi obbligatori e tipi base, lasciando `extra` aperto per dati non uniformi.

## 4) Logica applicativa e consistenza

## 4.1 Regole principali
- Solo utenti attivi possono fare login.
- Un viaggio non puo avere `end_date < start_date`.
- Stato `completed` richiede date valorizzate e location valida per marker.
- Expense `amount > 0`.

## 4.2 Strategia consistenza
- Operazioni su singolo documento: update atomico.
- Operazioni cross-collezione:
  - Base: eventual consistency (riepilogo su aggregazione runtime).
  - Opzionale: transazione Mongo (solo quando necessario e replica set disponibile).

## 5) Job, code, worker

### 5.1 Casi d'uso asincroni
- Generazione PDF.
- Ricalcolo cache riepiloghi (se attivata).

### 5.2 Pipeline export PDF
1. API crea record `export_jobs` (`queued`).
2. Job gestito in coda DB (`export_jobs`) tramite stato `queued`.
3. Worker processa job, genera PDF, salva file, aggiorna stato.
4. API espone polling stato e download.

### 5.3 Robustezza
- Retry con backoff e limite tentativi.
- Idempotency key per evitare duplicati di export ravvicinati.
- Dead-letter list logica (stati `failed` + reason).

## 6) Connessione MongoDB (runtime)

### 6.1 Lifecycle
- Creare un solo `AsyncMongoClient` all'avvio app.
- Condividere client via dependency injection.
- Chiudere client nello shutdown hook.

### 6.2 Parametri raccomandati
- `maxPoolSize`, `minPoolSize`
- `waitQueueTimeoutMS`
- `serverSelectionTimeoutMS`
- `retryWrites=true`, `retryReads=true`
- `appName` valorizzato

### 6.3 Bootstrap
- Startup task: ping DB, create indexes idempotente, check collezioni.
- Fallback: se indice assente/errore critico -> readiness `false`.

### 6.4 Deployment DB
- Target attuale: MongoDB Atlas (cloud) con URI `mongodb+srv://`.
- MongoDB locale mantenuto solo come fallback di sviluppo.
