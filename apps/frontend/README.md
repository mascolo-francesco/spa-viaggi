# Wandr — Frontend

UI professionale per il pianificatore di viaggi, costruita con Next.js 16, shadcn/ui e Tailwind CSS.

## Come avviare

```bash
# Da /apps/frontend
npm run dev
```

L'app sarà disponibile su **http://localhost:3000** (o la porta successiva libera).

> **Prerequisito**: Il backend deve essere attivo su `http://127.0.0.1:8000`

## Variabili ambiente

Configurare `apps/frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Note:
- se non impostata, il frontend usa automaticamente `http://127.0.0.1:8000`
- non aggiungere `/api/v1` nella variabile (il client lo gestisce già)

## Mapping pagine → endpoint backend

| Pagina | Route front | Endpoint backend |
|--------|-------------|-----------------|
| Login | `/login` | `POST /api/v1/auth/login` |
| Lista viaggi | `/trips` | `GET /api/v1/trips` |
| Crea viaggio | `/trips/new` | `POST /api/v1/trips` |
| Dettaglio viaggio | `/trips/:id` | `GET /api/v1/trips/:id` |
| Modifica viaggio | `/trips/:id/edit` | `PATCH /api/v1/trips/:id` |
| Partecipanti | `/trips/:id` (tab) | `GET/POST/PUT/DELETE /api/v1/trips/:id/participants` |
| Attività | `/trips/:id` (tab) | `GET/POST/PATCH/DELETE /api/v1/trips/:id/activities` |
| Spese | `/trips/:id` (tab) | `GET/POST/PATCH/DELETE /api/v1/trips/:id/expenses` + summary |
| Export PDF | `/trips/:id` (tab) | `POST /api/v1/trips/:id/exports/pdf` + polling |
| Mappa | `/map` | `GET /api/v1/trips/map/markers` |

## Credenziali di test

| Username | Password |
|----------|----------|
| franco | franco123 |
| luca | luca123 |
| marta | marta123 |

## Note sull'Export PDF

Il worker backend deve essere attivo separatamente:

```bash
# Da /apps/backend
python -m src.workers.worker_main
```

Se il worker non è attivo, i job rimarranno in stato `queued` indefinitamente.

## Stack tecnico

- **Next.js 16** (App Router)
- **React 19**
- **shadcn/ui** (componenti UI accessibili)
- **Tailwind CSS v4**
- **React Hook Form + Zod** (validazione form)
- **Leaflet** (mappa interattiva)
- **Sonner** (notifiche toast)
- **Lucide React** (icone)
