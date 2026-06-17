# CODEMAP — Diagrammi di flusso Voltaway

Guida visiva al funzionamento del monorepo. Per dettagli architetturali vedi [`ARCHITECTURE.md`](./ARCHITECTURE.md).

**Legenda**

| Simbolo | Significato |
|---|---|
| ✅ | Implementato oggi |
| 🔜 | Pianificato (docs / roadmap) |

---

## 1. Vista sistema (Docker Compose) ✅

```mermaid
flowchart TB
    subgraph Browser["Browser utente"]
        WEB["web — Next.js :3000\nmappa · bottom sheet · sessione"]
    end

    subgraph App["Applicazione"]
        API["api — NestJS :3001\nREST + WebSocket"]
        WORKER["worker — BullMQ consumer"]
        OCPISIM["ocpi-sim :4000\nCPO simulato Catania"]
    end

    subgraph Infra["Infrastruttura locale"]
        PG[("PostgreSQL + PostGIS")]
        REDIS[("Redis — BullMQ")]
        KC["Keycloak 🔜 auth UI"]
        MINIO[("MinIO 🔜 ricevute")]
        MAIL["Mailpit 🔜 email test"]
        TRAEFIK["Traefik :80\n*.voltaway.localhost"]
    end

    subgraph External["Esterni gratuiti"]
        OSM["OpenStreetMap tiles\nmappa MapLibre"]
        STRIPE["Stripe test 🔜\npagamenti"]
    end

    WEB -->|"HTTP :3001 / WS"| API
    WEB -->|"tiles"| OSM
    TRAEFIK -.-> WEB
    TRAEFIK -.-> API

    API --> PG
    API --> REDIS
    API <-->|"OCPI 2.2.1"| OCPISIM

    WORKER --> REDIS
    WORKER -->|"GET /stations/sync"| API
    WORKER --> OCPISIM

    API -.-> KC
    API -.-> STRIPE
    API -.-> MINIO
```

**Porte dirette (senza Traefik):** web `3000`, api `3001`, ocpi-sim `4000`.

---

## 2. Monorepo — chi chiama chi ✅

```mermaid
flowchart LR
    subgraph apps
        WEB["apps/web"]
        API["apps/api"]
        WRK["apps/worker"]
        SIM["apps/ocpi-sim"]
    end

    subgraph packages
        CORE["packages/core\nprezzo all-in"]
        OCPI["packages/ocpi\nclient HTTP"]
        DB["packages/db\nschema Drizzle"]
        CFG["packages/config\ntsconfig"]
    end

    WEB -->|"fetch /stations, /sessions\nsocket.io"| API
    API --> CORE
    API --> OCPI
    API --> DB
    WRK --> OCPI
    WRK --> API
    SIM -.->|"nessun import"| packages

    OCPI -->|"tipi"| CORE
```

| Percorso | Ruolo |
|---|---|
| `apps/web/src/components/map/MapScreen.tsx` | Schermata principale — orchestrazione UI |
| `apps/web/src/lib/api.ts` | Client HTTP verso API |
| `apps/web/src/hooks/useSessionSocket.ts` | WebSocket aggiornamenti sessione |
| `apps/api/src/stations.controller.ts` | Lista colonnine + sync |
| `apps/api/src/sessions.service.ts` | Ciclo vita sessione |
| `apps/api/src/sessions.gateway.ts` | Emit Socket.IO |
| `apps/api/src/queue.service.ts` | Job ricorrente `availability.sync` |
| `apps/ocpi-sim/src/store.ts` | Dati fittizi Catania + sessioni |
| `packages/core/src/pricing/allInPrice.ts` | Motore €/kWh all-in |

---

## 3. Percorso utente (web) ✅

```mermaid
flowchart TD
    START([Apre app /]) --> MAP["MapScreen: mappa full-screen Catania"]
    MAP --> FETCH["GET /stations"]
    FETCH --> PINS["Pin €/kWh sulla mappa + peek sheet"]

    PINS --> TAP{Azione utente}
    TAP -->|Tocca pin / elenco| DETAIL["Sheet half/full: dettaglio colonnina"]
    TAP -->|Scorre sheet| LIST["Elenco colonnine vicine"]
    TAP -->|↻ refresh| FETCH

    DETAIL --> START_BTN{Colonnina AVAILABLE\nnessuna sessione attiva?}
    START_BTN -->|Sì| POST_START["POST /sessions"]
    START_BTN -->|No| HINT["Messaggio: occupata / non disponibile"]

    POST_START --> BANNER["SessionBanner in carica"]
    BANNER --> WS["WebSocket: aggiornamenti live"]
    BANNER --> STOP_BTN["Tap Ferma"]
    STOP_BTN --> POST_STOP["POST /sessions/:id/stop"]
    POST_STOP --> DONE["Stato COMPLETED + totale €/kWh"]
    DONE --> FETCH
```

---

## 4. Flusso caricamento colonnine ✅

```mermaid
sequenceDiagram
    actor U as Utente
    participant W as web MapScreen
    participant A as api StationsController
    participant O as ocpi-sim
    participant DB as Postgres
    participant P as pricing.ts + core

    U->>W: apre app
    W->>A: GET /stations
    A->>O: GET /locations (OCPI)
    A->>DB: SELECT stations (match id)
    loop per ogni EVSE
        A->>O: GET /tariffs/:id
        A->>P: quoteFromOcpiTariff()
        P->>P: computeAllInPrice (core)
    end
    A-->>W: { data: [ name, lat, lng, status, allInPerKwh, ... ] }
    W->>W: StationsMap: pin + flyTo
    W->>W: GlassBottomSheet: peek summary
```

**File coinvolti:** `StationsMap.tsx`, `stations.controller.ts`, `pricing.ts`, `packages/ocpi/src/client.ts`.

---

## 5. Flusso avvio ricarica ✅

```mermaid
sequenceDiagram
    actor U as Utente
    participant W as web
    participant A as SessionsService
    participant O as ocpi-sim
    participant DB as Postgres
    participant G as SessionsGateway (WS)

    U->>W: Avvia ricarica
    W->>A: POST /sessions { ocpiLocationId, ocpiEvseUid }
    A->>DB: JOIN evses + stations (verifica esistenza)
    A->>O: GET status EVSE (live)
    alt non AVAILABLE
        A-->>W: 400 EVSE not available
    end
    A->>O: GET tariff
    A->>A: quote → quotedAllInPerKwh, quotedTotal
    A->>DB: INSERT session status=STARTING
    A->>G: emit STARTING
    G-->>W: session:update
    A->>O: commands START_SESSION
    O->>O: evse.status = CHARGING
    A->>DB: UPDATE session ACTIVE + ocpiSessionId
    A->>DB: UPDATE evse CHARGING
    A->>G: emit ACTIVE
    G-->>W: SessionBanner visibile
    A-->>W: 201 { data: session }
```

---

## 6. Flusso stop ricarica ✅

```mermaid
sequenceDiagram
    actor U as Utente
    participant W as web
    participant A as SessionsService
    participant O as ocpi-sim
    participant DB as Postgres
    participant G as SessionsGateway

    U->>W: Ferma
    W->>A: POST /sessions/:id/stop
    A->>DB: UPDATE status=STOPPING
    A->>G: emit STOPPING
    A->>O: commands STOP_SESSION
    O->>O: calcola kWh sintetici + CDR
    O->>O: evse.status = AVAILABLE
    A->>O: GET CDR
    A->>A: finalTotalFromCdr()
    A->>DB: UPDATE COMPLETED, finalKwh, finalTotal
    A->>DB: UPDATE evse AVAILABLE
    A->>G: emit COMPLETED
    G-->>W: totale in banner
    A-->>W: 200 { data: session }
    W->>W: refresh GET /stations
```

---

## 7. Macchina a stati sessione ✅

```mermaid
stateDiagram-v2
    [*] --> STARTING: POST /sessions
    STARTING --> ACTIVE: OCPI start OK
    STARTING --> FAILED: OCPI start errore

    ACTIVE --> STOPPING: POST /sessions/:id/stop
    STOPPING --> COMPLETED: CDR ricevuto
    STOPPING --> FAILED: stop errore

    COMPLETED --> [*]
    FAILED --> [*]

    note right of ACTIVE
        WebSocket emit ad ogni transizione
        EVSE: CHARGING ↔ AVAILABLE
    end note
```

Definito in `packages/db/src/schema.ts` (`sessions.status`).

---

## 8. Realtime WebSocket ✅

```mermaid
sequenceDiagram
    participant W as web useSessionSocket
    participant G as SessionsGateway
    participant S as SessionsService

    W->>G: connect socket.io (NEXT_PUBLIC_API_URL)
    Note over W,G: quando c'è sessione attiva
    W->>G: join room session:{id}
    S->>G: emitSessionUpdate(id, payload)
    G-->>W: evento session:update
    W->>W: setActiveSession → UI banner/sheet
```

**Endpoint WS:** stesso host dell'API (`ws://localhost:3001` in locale).

---

## 9. Sync disponibilità (worker) ✅

```mermaid
sequenceDiagram
    participant Q as QueueService (api)
    participant R as Redis BullMQ
    participant W as worker
    participant O as ocpi-sim
    participant A as api /stations/sync
    participant DB as Postgres

    Note over Q: ogni 60s all'avvio API
    Q->>R: add availability.sync (repeat)
    R->>W: job availability.sync
    W->>O: getLocations() warm-up
    W->>A: GET /stations/sync
    loop per location nota in DB
        A->>DB: UPDATE evses.status, tariffId
    end
```

---

## 10. Dati Catania (ocpi-sim) ✅

```mermaid
flowchart LR
    subgraph Locations["ocpi-sim store.ts"]
        D["loc-catania-duomo\nPiazza del Duomo\n2 EVSE"]
        P["loc-catania-porto\nVia Dusmet\n2 EVSE"]
    end

    subgraph Tariffs
        T1["tariff-standard\n€/kWh + flat"]
        T2["tariff-economy\n€/kWh + time"]
    end

    D --> T1
    D --> T2
    P --> T1
    P --> T2

    API["api GET /stations"] --> Locations
    SEED["api seed + packages/db seed"] --> DB[("Postgres stations/evses")]
    Locations -.->|"stessi ocpiLocationId"| DB
```

---

## 11. Flusso completo target (con pagamenti) 🔜

Stato **roadmap** — non ancora nel codice applicativo.

```mermaid
sequenceDiagram
    actor U as Guidatore
    participant W as web
    participant A as api
    participant S as Stripe test
    participant O as CPO / ocpi-sim
    participant DB as Postgres

    U->>W: mappa + prezzo all-in
    W->>A: POST /sessions
    A->>S: PaymentIntent pre-auth 🔜
    A->>O: START_SESSION
  A->>DB: sessione + quote
    U->>W: stop
    W->>A: POST /sessions/:id/stop
    A->>O: STOP + CDR
    A->>S: capture importo reale 🔜
    A->>DB: CDR + ricevuta MinIO 🔜
    A-->>W: ricevuta PDF 🔜
```

---

## 12. Avvio locale — sequenza dev ✅

```mermaid
flowchart TD
    A["cp .env.example .env"] --> B["docker compose up -d --build"]
    B --> C["postgres healthy"]
    C --> D["api: migrate + seed Catania"]
    D --> E["ocpi-sim healthy"]
    E --> F["api + worker + web up"]
    F --> G["http://localhost:3000"]
    G --> H["API :3001/health OK"]
    H --> I["GET /stations → 4 EVSE Catania"]
```

---

## Riferimento rapido endpoint API ✅

| Metodo | Path | Scopo |
|---|---|---|
| `GET` | `/health` | Healthcheck |
| `GET` | `/stations` | Colonnine + prezzo all-in (da OCPI) |
| `GET` | `/stations/sync` | Aggiorna status EVSE in DB da OCPI |
| `POST` | `/sessions` | Avvia ricarica |
| `POST` | `/sessions/:id/stop` | Termina e settlement CDR |
| `GET` | `/sessions/:id` | Dettaglio sessione |
| WS | `/sessions` namespace | `session:update` |

---

*Ultimo aggiornamento: allineato a `develop` con UI glass, colonnine Catania, commenti `@file` nel codice.*
