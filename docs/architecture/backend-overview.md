# Backend Overview

## Architettura

- Modular monolith FastAPI.
- Layer: API -> Application -> Infrastructure.
- MongoDB come primary datastore.
- Worker dedicato per job asincroni di export PDF.

## Principi dati

- Atomicita single-document come default.
- Collezioni separate per entita ad alto tasso di update (`trip_activities`, `trip_expenses`) per evitare unbounded arrays.
- `2dsphere` index su `trips.location` per query geospaziali.
- `$jsonSchema` validator su collezioni principali.

## Sicurezza

- Login utenti pre-caricati.
- Password hash bcrypt.
- JWT bearer token per chiamate API protette.
