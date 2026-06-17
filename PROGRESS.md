# Voltaway — Registro di avanzamento

**Ultimo aggiornamento:** 2026-06-17

---

## Branching e workflow Git

| Branch | Scopo | Stato |
|---|---|---|
| `main` | Stabile / rilasciabile | attuale @ architettura Docker |
| `develop` | Integrazione | **branch base per nuovo lavoro** |
| `feature/scaffold-monorepo` | Monorepo + demo E2E | ✅ mergiato in `develop` |
| `feature/mobile-map-ui` | UI mobile-first stile EasyPark | in corso |

```text
feature/*  →  develop  →  main
```

**Regola:** non continuare su feature già mergiate. Dopo il merge, nuovo lavoro = nuovo `feature/*` da `develop`.

---

## Stato attuale del progetto

| Area | Stato | Note |
|---|---|---|
| Monorepo pnpm + Turbo | ✅ | build + test + format |
| Docker Compose (tutto insieme) | ✅ | `docker compose up -d --build` |
| `packages/core` | ✅ | motore prezzo all-in + test |
| `packages/ocpi` + `ocpi-sim` | ✅ | OCPI 2.2.1 simulato Milano |
| `packages/db` | ✅ | schema + migrazioni |
| `apps/api` | ✅ | stations, sessions, WebSocket, BullMQ scheduler |
| `apps/worker` | ✅ | sync disponibilità via BullMQ |
| `apps/web` | ✅ | mappa, UI premium, ricarica live |
| CI GitHub Actions | ✅ | `.github/workflows/ci.yml` |
| Sessioni ricarica OCPI | ✅ | start/stop + CDR + quote |
| WebSocket sessioni | ✅ | namespace `/sessions` |
| Stripe test mode | ⏳ | prossima milestone |
| Keycloak login nell'app | ⏳ | realm pronto, UI non collegata |
| Mobile | ⏳ | fuori scope |

---

## Avvio locale (verificato)

```bash
cp .env.example .env
docker compose up -d --build
```

**URL principali:**
- Web: http://localhost:3000
- API: http://localhost:3001/health
- OCPI sim: http://localhost:4000/health
- Keycloak: http://auth.voltaway.localhost (via Traefik, se attivo)
- Mailpit: http://localhost:8025

> Traefik (`*.voltaway.localhost`) può richiedere Docker Desktop funzionante; le porte dirette `3000`/`3001` funzionano sempre.

---

## Cronologia

### 2026-06-17 — Production-ready local demo

- Docker build fix (tsconfig, package exports, healthcheck ocpi-sim)
- `docker compose up` avvia **tutto** senza profili
- WebSocket sessioni live (`SessionsGateway`)
- BullMQ: API schedula `availability.sync`, worker consuma
- UI rifatta (DM Sans, badge stato, pannello sessione)
- CI: build + test + format check
- Porte esposte 3000/3001/4000 per accesso diretto

### 2026-06-16 — Sessioni ricarica

- `POST /sessions`, `POST /sessions/:id/stop`, quote persistita
- Web: avvio/stop ricarica

### 2026-06-16 — Scaffold monorepo

- Monorepo completo, app base, Prettier

---

## Prossimi passi

- [ ] Stripe test mode (PaymentIntent + webhook)
- [ ] Keycloak OIDC nella web app
- [ ] Merge `feature/scaffold-monorepo` → `develop`
- [ ] Test E2E Playwright
- [ ] PostGIS `geography` per query bbox

---

## Riferimenti

- [`README.md`](./README.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Dev senza Docker app: `pnpm install && pnpm --filter @voltaway/ocpi-sim dev` (+ api, web)
