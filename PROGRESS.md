# Voltaway — Registro di avanzamento

File di **controllo del lavoro svolto** e dello **stato del progetto**. Aggiornarlo a ogni sessione significativa, così — anche resettando chat o contesto — resta chiaro cosa è stato fatto e cosa manca.

**Ultimo aggiornamento:** 2026-06-16

---

## Branching e workflow Git

### Branch permanenti

| Branch | Scopo | Regola |
|---|---|---|
| `main` | **Stabile / rilasciabile** | Solo merge da `develop` (o hotfix) quando tutto funziona e i criteri di merge sono soddisfatti |
| `develop` | **Integrazione** | Branch di lavoro predefinito; qui si mergiano feature/fix prima del rilascio su `main` |

### Branch di lavoro (da creare quando serve)

Aprire da `develop`, non da `main`:

| Prefisso | Uso | Esempio |
|---|---|---|
| `feature/` | nuova funzionalità o modulo | `feature/scaffold-monorepo`, `feature/api-nestjs` |
| `fix/` | correzione bug | `fix/ocpi-sim-session-timeout` |
| `chore/` | tooling, CI, refactor senza feature | `chore/github-actions` |
| `docs/` | solo documentazione | `docs/api-openapi` |

### Flusso

```text
feature/fix/chore/docs/*  →  develop  →  main
         (PR/merge)           (quando OK)    (release)
```

1. Partire sempre da `develop` aggiornato: `git checkout develop && git pull`
2. Creare branch di lavoro: `git checkout -b feature/nome`
3. Commit + push del branch di lavoro
4. Merge in `develop` (PR o merge locale) quando la feature è completa e testata
5. Merge `develop` → `main` solo quando l’intero stack locale funziona end-to-end (o per milestone concordata)

### Stato branch (aggiornare manualmente)

| Branch | Esiste su remote | Ultimo commit noto | Note |
|---|---|---|---|
| `main` | sì | `c5c8ec7` | Architettura Docker + docs (stabile) |
| `develop` | sì | `f784825` | branch di lavoro predefinito; aprire `feature/*` da qui |

---

## Stato attuale del progetto

| Area | Stato | Note |
|---|---|---|
| Documentazione prodotto | ✅ fatto | `README.md` |
| Architettura tecnica | ✅ fatto | `ARCHITECTURE.md` (stack production, Docker) |
| Infrastruttura Docker | ✅ fatto | `docker-compose.yml` — profilo default avviabile |
| Config Keycloak | ✅ fatto | `infra/keycloak/realm/voltaway-realm.json` |
| Variabili ambiente | ✅ fatto | `.env.example` |
| Codice applicativo (`apps/*`) | ⏳ non iniziato | profilo `app` in compose, Dockerfile da creare |
| Monorepo (pnpm/turbo) | ⏳ non iniziato | |
| CI (GitHub Actions) | ⏳ non iniziato | |

**Comando infra locale oggi:** `cp .env.example .env && docker compose up -d`

---

## Cronologia lavoro

### 2026-06-16 — Setup repository e architettura

**Commit `d255663`** — `chore: initial repo — README, architettura demo, config Netlify`
- Trasformato documento prodotto in `README.md`
- Creato `ARCHITECTURE.md` (prima versione orientata Netlify)
- Aggiunti `.gitignore`, `.env.example`, `netlify.toml`

**Commit `c5c8ec7`** — `refactor: architettura production Docker Compose e politica locale`
- **Rimosso** stack Netlify (`netlify.toml`)
- **Riscritto** `ARCHITECTURE.md` per stack production:
  - NestJS `api` + `worker`, BullMQ, Postgres+PostGIS, Redis, Keycloak, MinIO, Traefik
  - `ocpi-sim` (OCPI simulato in Compose, nessun accordo CPO)
  - Stripe **test mode** (account/chiavi gratis) + tile OSM (gratis) come unici esterni ammessi
- **Aggiunti** `docker-compose.yml`, `.dockerignore`, `infra/keycloak/realm/`
- **Aggiornati** `README.md`, `.env.example`, `.gitignore`
- **Politica locale** documentata: Docker per i servizi nostri, costo zero, nessun accordo commerciale, mobile e codice app rimandati

**Commit `f784825`** — `chore: branch develop e registro avanzamento PROGRESS.md`
- Creato branch `develop` (tracking `origin/develop`)
- Creato `PROGRESS.md` — cronologia, stato progetto, workflow Git, prossimi passi
- Aggiornato `README.md` (riferimento a `PROGRESS.md`)

---

## Prossimi passi (ordine suggerito)

Aggiornare questa lista man mano che si completa il lavoro.

- [ ] **Scaffold monorepo** — `pnpm-workspace.yaml`, Turborepo, `packages/config`
- [ ] **`packages/core`** — tipi dominio, motore tariffario all-in (con test Vitest)
- [ ] **`packages/ocpi`** — interfaccia + client OCPI
- [ ] **`apps/ocpi-sim`** — simulatore CPO OCPI 2.2.1 + Dockerfile
- [ ] **`packages/db`** — schema Drizzle, migrazioni, seed beachhead
- [ ] **`apps/api`** — NestJS REST + WebSocket + Dockerfile
- [ ] **`apps/worker`** — consumer BullMQ + Dockerfile
- [ ] **`apps/web`** — Next.js mappa/prezzo/sessione + Dockerfile
- [ ] Verifica end-to-end: `docker compose --profile app up -d --build`
- [ ] Merge `develop` → `main` quando lo stack app funziona in locale

### Branch previsti (da aprire al momento giusto)

| Branch | Quando |
|---|---|
| `feature/scaffold-monorepo` | primo passo sviluppo |
| `feature/ocpi-sim` | dopo core + ocpi package |
| `feature/api-nestjs` | dopo db + ocpi-sim |
| `feature/worker-bullmq` | dopo api base |
| `feature/web-nextjs` | dopo api con endpoint stazioni/sessioni |
| `chore/ci-github-actions` | quando esiste codice da testare |

---

## Come aggiornare questo file

A fine sessione (o a milestone completata):

1. Aggiornare **Ultimo aggiornamento** in cima
2. Aggiungere voce in **Cronologia lavoro** (data, commit, cosa è stato fatto)
3. Aggiornare **Stato attuale del progetto** (✅ / ⏳ / ❌)
4. Spuntare o aggiungere voci in **Prossimi passi**
5. Aggiornare tabella **Stato branch** se cambiano branch o commit di riferimento

---

## Riferimenti rapidi

- Prodotto e avvio: [`README.md`](./README.md)
- Architettura e Docker: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Compose: [`docker-compose.yml`](./docker-compose.yml)
- Env: [`.env.example`](./.env.example)
- Repo: https://github.com/GabrieleRuggieri/voltaway
