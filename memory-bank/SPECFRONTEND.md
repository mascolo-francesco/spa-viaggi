Auth flow:
Endpoint login:
POST /api/v1/auth/login
Request JSON:
{
  "username": "franco",
  "password": "franco123"
}
Response JSON:
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "string",
    "username": "string",
    "display_name": "string|null"
  }
}
Salva access_token in modo persistente (localStorage o equivalente) e gestisci logout.

Base API:
Base URL: http://127.0.0.1:8000
Prefix API: /api/v1

Endpoint health/public:
GET /
GET /api/v1/health/live
GET /api/v1/health/ready

Trips:
GET /api/v1/trips
Query supportate:
status (string)
destination (string)
from_date (YYYY-MM-DD)
to_date (YYYY-MM-DD)
page (int, default 1)
limit (int, default 20, max 100)
sort (string, default -start_date)
Response:
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "destination": {"city":"string|null","country":"string|null","address":"string|null"}|null,
      "start_date": "YYYY-MM-DD|null",
      "end_date": "YYYY-MM-DD|null",
      "status": "planned|completed|cancelled",
      "participants_count": 0,
      "created_at": "datetime"
    }
  ],
  "total": 0,
  "page": 1,
  "limit": 20
}

POST /api/v1/trips
Request JSON:
{
  "title": "string (min 3)",
  "destination": {"city":"string|null","country":"string|null","address":"string|null"}|null,
  "description": "string|null",
  "start_date": "YYYY-MM-DD|null",
  "end_date": "YYYY-MM-DD|null",
  "status": "planned|completed|cancelled",
  "location": {"lat": 0, "lon": 0}|null,
  "participants": ["user_id_string", "..."],
  "extra": {}
}
Response: TripDetail

GET /api/v1/trips/{trip_id}
Response TripDetail:
{
  "id": "string",
  "title": "string",
  "destination": {"city":"string|null","country":"string|null","address":"string|null"}|null,
  "description": "string|null",
  "start_date": "YYYY-MM-DD|null",
  "end_date": "YYYY-MM-DD|null",
  "status": "planned|completed|cancelled",
  "location": {"lat": 0, "lon": 0}|null,
  "participants": ["user_id_string", "..."],
  "extra": {}|null,
  "created_at": "datetime",
  "updated_at": "datetime|null"
}

PATCH /api/v1/trips/{trip_id}
Request JSON parziale (solo campi da aggiornare)
Stessi campi di TripCreate senza obbligatorietà.

DELETE /api/v1/trips/{trip_id}
Response:
{"message":"Viaggio eliminato"}

Participants:
GET /api/v1/trips/{trip_id}/participants
Response:
{
  "trip_id":"string",
  "participants":[
    {"user_id":"string","username":"string","display_name":"string|null"}
  ],
  "updated_at":"datetime|null"
}

PUT /api/v1/trips/{trip_id}/participants
Request:
{"user_ids":["id1","id2"]}

POST /api/v1/trips/{trip_id}/participants
Request:
{"user_id":"string"}

DELETE /api/v1/trips/{trip_id}/participants/{user_id}

Activities:
GET /api/v1/trips/{trip_id}/activities
Response list ActivityItem:
{
  "id":"string",
  "trip_id":"string",
  "title":"string",
  "type":"string|null",
  "start_at":"datetime|null",
  "end_at":"datetime|null",
  "notes":"string|null",
  "cost_estimate":0|null,
  "created_at":"datetime",
  "updated_at":"datetime|null"
}

POST /api/v1/trips/{trip_id}/activities
Request:
{
  "title":"string (min 2)",
  "type":"string|null",
  "start_at":"datetime|null",
  "end_at":"datetime|null",
  "notes":"string|null",
  "cost_estimate":0|null
}

PATCH /api/v1/trips/{trip_id}/activities/{activity_id}
Request parziale con gli stessi campi.

DELETE /api/v1/trips/{trip_id}/activities/{activity_id}

Expenses:
GET /api/v1/trips/{trip_id}/expenses
Response list ExpenseItem:
{
  "id":"string",
  "trip_id":"string",
  "category":"string",
  "amount":0,
  "currency":"EUR",
  "paid_by":"string|null",
  "shared_with":["string"],
  "occurred_at":"datetime|null",
  "notes":"string|null",
  "created_at":"datetime",
  "updated_at":"datetime|null"
}

POST /api/v1/trips/{trip_id}/expenses
Request:
{
  "category":"string (min 2)",
  "amount": >0,
  "currency":"string len 3",
  "paid_by":"string|null",
  "shared_with":["string"],
  "occurred_at":"datetime|null",
  "notes":"string|null"
}

PATCH /api/v1/trips/{trip_id}/expenses/{expense_id}
Request parziale con stessi campi.

DELETE /api/v1/trips/{trip_id}/expenses/{expense_id}

GET /api/v1/trips/{trip_id}/expenses/summary
Response:
{
  "trip_id":"string",
  "currency":"EUR",
  "total_amount":0,
  "by_category":[
    {"category":"food","total":0}
  ]
}

Map:
GET /api/v1/trips/map/markers
Query supportate:
status
from_date (YYYY-MM-DD)
to_date (YYYY-MM-DD)
Response list:
{
  "trip_id":"string",
  "title":"string",
  "status":"planned|completed|cancelled",
  "marker_color":"red|green",
  "lat":0,
  "lon":0,
  "destination":{"city":"string|null","country":"string|null","address":"string|null"}|null
}

Export PDF:
POST /api/v1/trips/{trip_id}/exports/pdf
Response:
{
  "job_id":"string",
  "trip_id":"string",
  "status":"queued|running|succeeded|failed",
  "error":"string|null",
  "file_ready":false,
  "created_at":"datetime",
  "started_at":"datetime|null",
  "finished_at":"datetime|null"
}

GET /api/v1/exports/{job_id}
Stessa response di sopra.

GET /api/v1/exports/{job_id}/download
Response: file PDF (application/pdf)
Nota: se non pronto, backend risponde 409 con code EXPORT_NOT_READY.

Importantissimo per export:
Il worker backend deve essere attivo separatamente:
python -m src.workers.worker_main
Se worker non attivo, i job restano queued.

Credenziali seed utili per test:

- franco / franco123
- luca / luca123
- marta / marta123

Requisiti implementativi frontend:

1. Struttura pulita con API client centralizzato.
2. Interceptor/request wrapper per Bearer token.
3. Error handling coerente con backend (detail.code/detail.message quando presente).
4. Form validation client-side allineata ai vincoli backend.
5. Loading states e empty states in ogni vista.
6. Polling export job (es. ogni 1-2 secondi) fino a succeeded/failed.
7. Download PDF automatico quando job succeeded.
8. Routing protetto per pagine private.
9. UI professionale usando shadcn/ui.

Deliverable richiesto:

- Codice frontend completo e funzionante.
- README frontend con:
  - come avviare
  - env vars usate
  - mapping pagine -> endpoint backend
- Nessuna modifica al backend.
