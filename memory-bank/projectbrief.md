# Project Brief

## Obiettivo
Realizzare una SPA per organizzazione viaggi di gruppo con backend robusto/scalabile e frontend separato, seguendo i requisiti della prova in `SPEC.md`.

## Scope Funzionale (backend)
- Login utenti pre-caricati a database (senza registrazione pubblica).
- CRUD viaggi (elenco, dettaglio, creazione, aggiornamento).
- Gestione partecipanti per viaggio.
- Gestione attivita/tappe per viaggio.
- Gestione spese e riepilogo costi.
- Endpoint dati mappa (marker viaggi fatti/da fare).
- Export PDF informazioni viaggio.

## Vincoli
- Database: MongoDB Atlas (cloud) come ambiente target.
- Architettura backend progettata per crescita (modulare, testabile, osservabile).
- Frontend fuori scope in questa sessione.

## Decisioni di ownership
- Frontend owner: `claude-sonnet-4.6`.
- Frontend stack: `React`.
- UI kit: `shadcn/ui` con skill dedicata.
- Skill primaria frontend: `frontend-design`.
- Se utile, Claude puo usare shadcn MCP per recupero componenti.
- Obiettivo frontend: livello professionale (non prototipo scolastico).

## Deliverable di pianificazione
- Architettura backend completa.
- Modello dati MongoDB, indici e policy consistenza.
- API contract di alto livello.
- Struttura cartelle/file dell'intero progetto.
- Documentazione Memory Bank per handoff multi-agente.
