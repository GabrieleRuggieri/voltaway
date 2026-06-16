# Voltaway — Registro di avanzamento

File di **controllo del lavoro svolto** e dello **stato del progetto**. Aggiornarlo a ogni sessione significativa.

**Ultimo aggiornamento:** 2026-06-16

---

## Branching e workflow Git

### Branch permanenti

| Branch | Scopo | Regola |
|---|---|---|
| `main` | **Stabile / rilasciabile** | Solo merge da `develop` quando tutto funziona |
| `develop` | **Integrazione** | Branch predefinito; merge delle feature qui |

### Branch di lavoro

| Branch | Stato | Note |
|---|---|---|
| `feature/scaffold-monorepo` | **in corso** | monorepo + app base + Docker |

### Flusso

```text
feature/*  →  develop  →  main
```

---

## Stato attuale del progetto

| Area | Stato | Note |
|---|---|---|
| Documentazione prodotto | ✅ | `README.md` |
| Architettura tecnica | ✅ | `ARCHITECTURE.md` |
| Infrastruttura Docker | ✅ | `docker-compose.yml` profili default + app |
| Config Keycloak | ✅ | `infra/keycloak/realm/` |
| Monorepo pnpm + Turbo | ✅ | `package.json`, `pnpm-workspace.yaml`, `turbo.json` |
| `packages/core` | ✅ | motore prezzo all-in + test Vitest |
| `packages/ocpi` | ✅ | tipi + `OcpiClient` |
| `packages/db` | ✅ | schema Drizzle + migrazione `0000_init.sql` |
| `apps/ocpi-sim` | ✅ | simulatore OCPI 2.2.1 (Milano seed) |
| `apps/api` | ✅ | NestJS: `/health`, `/stations`, seed+migrate all'avvio |
| `apps/worker` | ✅ | sync disponibilità periodico → API |
| `apps/web` | ✅ | Next.js mappa MapLibre + lista prezzi all-in |
| Build locale (`pnpm build`) | ✅ | tutti i package/app compilano |
| Docker `profile app` | ⏳ | da verificare con Docker Desktop avviato |
| CI GitHub Actions | ⏳ | |
| Sessioni ricarica + Stripe | ⏳ | prossima milestone |
| Mobile | ⏳ | fuori scope |

---

## Cronologia lavoro

### 2026-06-16 — Setup repository e architettura

**`d255663`** — initial repo (README, architettura Netlify)  
**`c5c8ec7`** — refactor Docker Compose production stack  
**`f784825`** / **`41a76a3`** — branch `develop` + `PROGRESS.md`

### 2026-06-16 — Scaffold monorepo e app base (`feature/scaffold-monorepo`)

- Monorepo **pnpm workspaces + Turborepo**
- **`packages/core`**: `computeAllInPrice`, test Vitest (2 test)
- **`packages/ocpi`**: interfaccia + client HTTP OCPI 2.2.1
- **`packages/db`**: Postgres schema (`cpos`, `stations`, `evses`, `sessions`), migrazione SQL
- **`apps/ocpi-sim`**: Express, endpoint OCPI, 2 location Milano, tariffe simulate
- **`apps/api`**: NestJS, migrazioni+seed all'avvio, `GET /stations` con prezzo all-in, `GET /stations/sync`
- **`apps/worker`**: polling sync ogni 60s
- **`apps/web`**: landing + mappa MapLibre + card stazioni
- Dockerfile per ogni app (build da root monorepo)
- `docker-compose.yml`: dipendenze `api`/`worker`/`web` → `ocpi-sim`

**Verifica locale eseguita:**
```bash
pnpm install
pnpm --filter @voltaway/core test   # 2 passed
pnpm build                          # tutti i package OK
```

**Verifica Docker (da fare con Docker avviato):**
```bash
cp .env.example .env
docker compose up -d
docker compose --profile app up -d --build
# app.voltaway.localhost  → web
# api.voltaway.localhost/health  → api
# ocpi.voltaway.localhost/health → ocpi-sim
```

---

## Prossimi passi

- [ ] Verificare `docker compose --profile app up -d --build` con Docker Desktop
- [ ] Merge `feature/scaffold-monorepo` → `develop`
- [ ] `POST /sessions` — avvio/stop ricarica via OCPI + quote persistita
- [ ] Integrazione Stripe test mode (SetupIntent / PaymentIntent)
- [ ] WebSocket stato sessione live
- [ ] CI GitHub Actions (build + test)
- [ ] Merge `develop` → `main` quando E2E locale OK

---

## Riferimenti rapidi

- [`README.md`](./README.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`docker-compose.yml`](./docker-compose.yml)
- Dev locale senza Docker app: `pnpm install && pnpm --filter @voltaway/ocpi-sim dev` (+ api, web in parallelo)
- Repo: https://github.com/GabrieleRuggieri/voltaway
