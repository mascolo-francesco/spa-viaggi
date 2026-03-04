# System Patterns

## Pattern architetturale
Modular Monolith backend con separazione a layer:
- `API Layer`: router FastAPI + DTO request/response.
- `Application Layer`: use-case (comandi/query) e orchestrazione regole.
- `Domain Layer`: entita, value object, regole business pure.
- `Infrastructure Layer`: repository MongoDB, queue, PDF adapter.

## Boundaries di dominio
- `auth`: verifica credenziali utenti pre-esistenti.
- `trips`: dati generali viaggio + metadata dinamico.
- `participants`: gestione partecipanti.
- `activities`: tappe/attivita.
- `expenses`: spese, categorizzazione, riepiloghi.
- `map`: query geospaziali marker.
- `exports`: generazione PDF e stato job.

## Pattern dati MongoDB
- Documento `trip` con campi core + `extra` (metadata libero).
- Collezioni separate per entita ad alta frequenza update (`activities`, `expenses`) per evitare array non bounded nei documenti principali.
- Embedded controllato solo dove cardinalita resta bassa (es. breve lista partecipanti) o per snapshot.
- Validazione schema con `$jsonSchema`.
- Indici composti guidati da query reali.

## Coerenza e transazioni
- Default: sfruttare atomicita single-document.
- Transazioni multi-document solo per invarianti forti cross-collection (se replica set disponibile).
- In alternativa: modello eventual consistency con job di riconciliazione riepiloghi.

## Pattern asincroni
- Coda job per export PDF basata su collection Mongo `export_jobs` + worker dedicato.
- Collezione `export_jobs` per stato, retry, error details.
- Idempotenza su richieste export ripetute.

## Osservabilita
- Logging strutturato JSON con `request_id`.
- Health/readiness endpoint.
- Metriche base su latenza API e tempi job.
