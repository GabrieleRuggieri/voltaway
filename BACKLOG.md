# Backlog tecnico — Voltaway

Cose **non ancora implementate** rispetto all'architettura target ([`ARCHITECTURE.md`](./ARCHITECTURE.md)) e alla demo locale attuale.

Per lo **stato di ciò che esiste oggi** vedi [`PROGRESS.md`](./PROGRESS.md) e i diagrammi in [`CODEMAP.md`](./CODEMAP.md).

Per la **roadmap prodotto** (12 mesi, go-to-market, validazione) vedi [`README.md`](./README.md).

---

## Priorità prossima (MVP locale)

| Voce | Stato | Note |
|---|---|---|
| Stripe test mode | ❌ | `PaymentIntent` pre-auth all'avvio, capture su CDR, webhook `POST /webhooks/stripe` |
| Login Keycloak (OIDC) | ❌ | Realm importato in `infra/keycloak/`; web app e guardie NestJS non collegate |
| Tabella `users` + mapping `oidc_sub` | ❌ | Schema previsto in ARCHITECTURE §8, assente in `packages/db` |
| Tabella `payment_methods` | ❌ | Solo riferimenti Stripe, nessun PAN |
| Ricevute PDF in MinIO | ❌ | MinIO in Compose, nessun upload/generazione ricevuta |
| Macchina a stati completa sessione | ⚠️ parziale | Enum DB include `QUOTED`/`AUTHORIZING`/`SETTLING`; il codice usa `STARTING` → `ACTIVE` → `STOPPING` → `COMPLETED` senza pagamento |
| Orchestrazione sessione nel worker | ⚠️ parziale | Start/stop sincroni in `apps/api`; job `session.tick` / `cdr.ingest` non implementati |

---

## Dati e geospaziale

| Voce | Stato | Note |
|---|---|---|
| PostGIS `geography(Point)` su `stations` | ❌ | Oggi `latitude`/`longitude` float; query bbox non ottimizzate |
| Tabella `tariffs` (cache listini CPO) | ❌ | Tariffe lette on-the-fly da OCPI a ogni richiesta |
| Tabella `price_quotes` | ❌ | Quote in `sessions`; nessun tracking scostamento mostrato/addebitato |
| Tabella `cdrs` separata | ❌ | Dati CDR denormalizzati in `sessions.finalKwh` / `finalTotal` |
| Tabella `vehicles` | ❌ | — |
| Seed / sync colonnine oltre Catania | ❌ | Demo: 2 location, 4 EVSE in `ocpi-sim` |

---

## Realtime, worker e operazioni

| Voce | Stato | Note |
|---|---|---|
| `availability.sync` (worker) | ✅ | Job ricorrente ogni 60s |
| `idle.detect` (anti-penale) | ❌ | Avvisi occupazione post-carica |
| `invoice.monthly` (flotte) | ❌ | — |
| Redis snapshot disponibilità mappa | ❌ | Stato EVSE in Postgres; nessuna cache Redis dedicata |
| Fallback SSE / polling WS | ❌ | Solo Socket.IO |
| Rate limiting API | ❌ | Previsto con Redis |

---

## Frontend e monorepo

| Voce | Stato | Note |
|---|---|---|
| `packages/api-client` | ❌ | Client tipizzato condiviso web/mobile |
| `packages/ui` | ❌ | Componenti shadcn condivisi (oggi duplicati in `apps/web`) |
| Landing / SEO mappa pubblica | ❌ | Solo app mappa su `/` |
| Dashboard flotte B2B | ❌ | — |
| App mobile Expo | ❌ | Fuori scope attuale |

---

## Affidabilità community e prodotto

| Voce | Stato | Note |
|---|---|---|
| `reliability_reports` + scoring colonnina | ❌ | Layer community previsto in ARCHITECTURE §7.4 |
| Pianificatore viaggio con costo | ❌ | Rimandato in README MVP |
| Plug & Charge | ❌ | Rimandato |
| Wallet flotte (`fleets`, `fleet_members`, `invoices`) | ❌ | Schema e UI assenti |
| Integrazione hub OCPI reale (Hubject/Gireve) | ❌ | Solo `ocpi-sim`; switch via env `OCPI_MODE=live` non esercitato |

---

## Qualità, sicurezza e osservabilità

| Voce | Stato | Note |
|---|---|---|
| Prettier + `format:check` in CI | ✅ | root `package.json` |
| TypeScript strict + type-check (`tsc`) | ✅ | `lint` per pacchetto; web usa `next lint` |
| Test unitari motore prezzo (`allInPrice`) | ✅ | Vitest in `packages/core` |
| CI GitHub Actions (format · build · test) | ✅ | `.github/workflows/ci.yml` — **senza** `lint` in pipeline |
| Test E2E Playwright (mappa → ricarica) | ❌ | pianificato |
| Test integrazione Testcontainers | ❌ | pianificato |
| Validazione input Zod (API) | ❌ | pianificato |
| OpenTelemetry in `api`/`worker` | ❌ | Grafana OTel LGTM in Compose (profilo `obs`), non instrumentato |
| Sentry | ❌ | pianificato |
| SonarQube in CI | ❌ | pianificato |
| Webhook Stripe firmati e idempotenti | ❌ | endpoint non esiste |

---

## Infrastruttura e email

| Voce | Stato | Note |
|---|---|---|
| Mailpit (email di test) | ⚠️ | Container attivo; nessuna integrazione SMTP dall'app |
| Profilo Compose `obs` | ⚠️ | Opzionale; non usato dal codice applicativo |
| Auth API senza JWT | ⚠️ | Endpoint sessioni/stazioni aperti (demo locale) |

---

## Riferimenti incrociati

- Flusso **implementato oggi**: [`CODEMAP.md`](./CODEMAP.md) §1–10
- Flusso **target con pagamenti**: [`CODEMAP.md`](./CODEMAP.md) §11
- Registro avanzamento: [`PROGRESS.md`](./PROGRESS.md)

*Ultimo aggiornamento: 2026-06-17*
