# Worker Operations

## Scopo

Il worker processa job `queued` nella collection `export_jobs` e genera PDF in `data/exports`.

## Stato job

- `queued`: in attesa
- `running`: in lavorazione
- `succeeded`: file disponibile
- `failed`: errore terminale

## Diagnostica base

- Verificare con API: `GET /api/v1/exports/{job_id}`
- Verificare file fisico su `data/exports`
- Verificare log worker e connessione Mongo
