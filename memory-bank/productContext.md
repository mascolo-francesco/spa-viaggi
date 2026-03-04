# Product Context

## Problema
Le informazioni sui viaggi di gruppo sono disperse (chat, fogli, note), con bassa affidabilita e scarsa tracciabilita delle decisioni.

## Valore prodotto
- Unico punto di accesso per dati viaggio.
- Aggiornamento collaborativo di partecipanti, tappe e spese.
- Riepilogo economico veloce.
- Vista geospaziale dei viaggi.
- Export condivisibile in PDF.

## Utenti
- Gruppo ristretto di utenti gia censiti nel DB.
- Nessuna self-registration.

## Aspettative operative
- Risposte API rapide su elenco/dettaglio.
- Coerenza dati su update concorrenti.
- Struttura estendibile per campi non uniformi tra viaggi.

## Principi UX funzionali (non visual)
- Flussi semplici: login -> elenco -> dettaglio -> modifica.
- Errori comprensibili da backend (codici e messaggi chiari).
- Contratti API stabili per agevolare frontend e test.
