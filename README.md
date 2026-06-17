# Voltaway — Il Wallet Unico per Ricaricare l'Auto Elettrica

> Una sola app per trovare, avviare e pagare la ricarica su qualsiasi colonnina — di qualsiasi operatore, in qualsiasi Paese — con il **prezzo reale mostrato prima di attaccare il cavo**, esattamente come EasyPark ha fatto per il parcheggio.

![Stato](https://img.shields.io/badge/stato-MVP-orange)
![Stack](https://img.shields.io/badge/stack-TypeScript-3178c6)
![Runtime](https://img.shields.io/badge/runtime-Docker%20Compose-2496ed)
![Licenza](https://img.shields.io/badge/licenza-proprietaria-lightgrey)

Voltaway è un **e-Mobility Service Provider (eMSP)**: un livello software sopra le reti di ricarica altrui. Non possiede né colonnine né energia — aggrega gli operatori via roaming **OCPI** e vince sulla **trasparenza del prezzo** e sull'**affidabilità**.

> **Nota su questa repo.** Fase attuale: **documentazione + infrastruttura Docker** — lo sviluppo applicativo (`apps/*`) inizierà più avanti. Lo stack è quello di produzione, eseguibile in locale via **Docker Compose**; l'integrazione ricarica passa da **`ocpi-sim`** (OCPI simulato, nessun accordo CPO); i pagamenti da **Stripe test mode** (account e chiavi API gratuiti). Servizi esterni ammessi **solo se gratuiti** (es. tile OpenStreetMap). Dettagli in [`ARCHITECTURE.md`](./ARCHITECTURE.md) e [Politica sviluppo locale](#politica-sviluppo-locale).

## Indice

**Prodotto**

1. [Problema risolto](#problema-risolto)
2. [Perché ora](#perché-ora)
3. [Utente target](#utente-target)
4. [Dimensione del mercato](#dimensione-del-mercato)
5. [Funzionalità principali](#funzionalità-principali)
6. [Come funziona — MVP](#come-funziona--mvp)
7. [Concorrenza e posizionamento](#concorrenza-e-posizionamento)
8. [Modello di pricing e commissioni](#modello-di-pricing-e-commissioni)
9. [Unit economics](#unit-economics)
10. [Perché continuano a usarla](#perché-continuano-a-usarla)
11. [Go-to-market — primi 10.000 utenti](#go-to-market--primi-10000-utenti)
12. [Piano di validazione](#piano-di-validazione)
13. [Roadmap 12 mesi](#roadmap-12-mesi)
14. [KPI da monitorare](#kpi-da-monitorare)
15. [Rischio principale](#rischio-principale)

**Tecnologia & sviluppo**

16. [Stack tecnologico](#stack-tecnologico)
17. [Struttura del repository](#struttura-del-repository)
18. [Avvio rapido](#avvio-rapido)
19. [Politica sviluppo locale](#politica-sviluppo-locale)
20. [Glossario](#glossario)
21. [Licenza](#licenza)

---

## Problema risolto

Chi guida un'auto elettrica si ritrova un portafoglio digitale pieno di app e tessere RFID: una per Enel X, una per Be Charge, una per Ionity, una per Tesla, una per il supermercato, una per la rete dell'altro Paese. Ogni operatore ha la sua app, la sua tariffa, il suo metodo di pagamento e — soprattutto — **nasconde il prezzo finché non hai già attaccato il cavo**. Il guidatore non sa quasi mai quanto pagherà al kWh prima di iniziare, scopre sovrapprezzi a sessione e penali di sosta a posteriori, e in viaggio all'estero spesso una colonnina semplicemente «non parte» perché la sua tessera non è abilitata su quella rete.

È esattamente la frammentazione che EasyPark ha eliminato per il parcheggio: tanti gestori locali, micro-pagamenti ad alta frequenza, attrito altissimo (monete/tessere/app diverse) e zero trasparenza. Il guidatore EV vuole una cosa sola: **arrivo, attacco, pago, riparto — sapendo prima il prezzo.** Oggi non ce l'ha.

## Perché ora

- **Il parco EV è diventato massa, non più nicchia** — in Europa circolano decine di milioni di veicoli elettrici e ibridi plug-in e le immatricolazioni di full-electric viaggiano stabilmente sopra il 15% del venduto in molti mercati: il bacino di utenti frustrati cresce ogni mese.
- **La rete pubblica è esplosa ma resta balcanizzata** — l'Europa ha superato il milione di punti di ricarica pubblici con centinaia di operatori (CPO) diversi: più colonnine = più operatori = più attrito, non meno.
- **La normativa AFIR impone trasparenza e pagamento ad-hoc** — il regolamento europeo obbliga i nuovi punti di ricarica veloce a esporre il prezzo €/kWh e ad accettare pagamenti senza abbonamento: spinge il settore verso lo standard «prezzo chiaro, paga e vai» su cui questo prodotto si fonda.
- **Lo standard eMSP/roaming (OCPI) è maturo** — i protocolli di interoperabilità (OCPI, hub come Hubject/Gireve) permettono a un nuovo operatore di mobilità (eMSP) di collegarsi a migliaia di colonnine senza accordi uno-a-uno: la barriera tecnica all'ingresso è crollata.

## Utente target

Guidatori EV privati, 30–60 anni, che fanno **ricarica pubblica fuori casa** (chi vive in appartamento senza box, pendolari, chi viaggia spesso). Beachhead: **chi non ha ricarica domestica** — il segmento più dipendente dalla rete pubblica e quindi col dolore massimo. Secondo bacino: **flotte e partite IVA** (commerciali, agenti, piccole aziende) che oggi gestiscono decine di tessere e una rendicontazione spese da incubo. Geografia iniziale: 1–2 mercati ad alta densità EV (es. Italia + un secondo Paese alpino/transfrontaliero dove il roaming serve davvero).

## Dimensione del mercato

| Livello | Stima | Ragionamento |
|---|---|---|
| TAM | €15–25 mld/anno (spesa ricarica pubblica Europa) | Decine di milioni di EV × quota di energia presa in pubblico × prezzo medio €/kWh; cresce a doppia cifra l'anno |
| SAM | €2–4 mld/anno | Guidatori dipendenti dalla rete pubblica + flotte nei 2–4 mercati iniziali |
| SOM a 3 anni | €8–20M di ricavi (margine su GMV) | 150–400k utenti attivi con commissione/markup medio per sessione |

Ancore di mercato:

- Oltre 1 milione di punti di ricarica pubblici in Europa e in forte crescita annuale
- Decine di milioni di veicoli a spina circolanti, con immatricolazioni full-electric a doppia cifra percentuale
- Aggregatori esistenti (Octopus Electroverse, Chargemap, Bonnet, Plugsurfing) muovono già milioni di sessioni l'anno: la domanda per «una sola app» è dimostrata
- Le grandi reti (Ionity, Fastned, Tesla Supercharger aperto a terzi) generano già centinaia di milioni di ricavi: il volume di spesa esiste

Fonti: European Alternative Fuels Observatory (EAFO), ACEA (immatricolazioni), regolamento UE AFIR, dati pubblici operatori e aggregatori.

## Funzionalità principali

- **Prezzo reale prima di attaccare** — la mappa mostra €/kWh *all-in* (energia + fee sessione + eventuale sosta) per ogni colonnina, in tempo reale: il guidatore sceglie sapendo quanto spende, non lo scopre dopo
- **Avvio universale** — plug & charge dove supportato, altrimenti avvio via app/QR; una sola identità per migliaia di colonnine di operatori diversi via roaming OCPI
- **Filtro «funziona davvero»** — stato live della colonnina (libera/occupata/guasta), potenza reale erogata e affidabilità storica segnalata dagli utenti: il dolore numero uno in viaggio è la colonnina rotta
- **Pianificatore di viaggio con costo** — inserisci destinazione e auto: l'app propone le soste ottimizzando tempo *e* costo totale, non solo distanza
- **Wallet flotte e rendicontazione** — più conducenti, regole di spesa, fatturazione unica mensile, export per la contabilità e split uso privato/aziendale (killer feature B2B)
- **Avvisi anti-penale** — notifica quando l'auto è carica e parte il costo di occupazione (idle fee), così smetti di pagare la sosta inutile

## Come funziona — MVP

**Cosa si costruisce per primo (v1, 4–6 mesi):**

1. **Integrazione roaming** — connessione a 1–2 hub OCPI (Hubject/Gireve) + accordi diretti con i 3–5 CPO principali del mercato beachhead: copertura immediata di decine di migliaia di punti
2. **Motore prezzo all-in** — normalizzazione delle tariffe eterogenee dei CPO in un unico €/kWh trasparente comprensivo di fee; è il cuore del valore percepito
3. **Avvio sessione + pagamento** — start/stop remoto via OCPI, tokenizzazione carta, addebito a fine sessione, ricevuta unica
4. **Mappa con stato live e affidabilità** — dati di disponibilità da OCPI + layer di segnalazioni community

**Si rimanda:** plug & charge nativo su tutte le reti, planner avanzato multi-tappa, hardware/tessera fisica, mercati oltre i primi due.

**Nota chiave sui costi:** non si possiede hardware né energia — si è un livello software (eMSP) sopra le reti altrui. Il margine viene dal differenziale tra prezzo all'utente e prezzo di acquisto roaming, più una fee a sessione.

> Il dettaglio tecnico completo dell'MVP (stack, moduli, modello dati, flussi) è in [`ARCHITECTURE.md`](./ARCHITECTURE.md). Per i vincoli di sviluppo locale (Docker, costo zero, servizi esterni gratuiti) vedi [Politica sviluppo locale](#politica-sviluppo-locale).

## Concorrenza e posizionamento

| Concorrente | Cosa fa | Perché non basta |
|---|---|---|
| App dei singoli CPO (Enel X, Be Charge, Ionity…) | Ricarica sulla *propria* rete | Frammentazione totale: una app per operatore, niente roaming, prezzo nascosto |
| Octopus Electroverse / Plugsurfing / Chargemap | Aggregatori roaming pan-europei | Buona copertura ma prezzo spesso poco trasparente, UX di viaggio e affidabilità migliorabili, B2B/flotte debole |
| Tessere RFID generiche (Shell Recharge, NewMotion) | Tessera fisica multi-rete | Esperienza «vecchio mondo», nessuna trasparenza prezzo, niente live status |
| Tesla / costruttori auto | App integrata nel veicolo | Chiusa sul proprio ecosistema o sulla propria rete; il multi-brand resta scoperto |
| Google Maps / planner generici | Mostrano dove ricaricare | Trovano ma non avviano né pagano né garantiscono il prezzo |

**Posizionamento:** *transparency-first e affidabilità-first*. Gli aggregatori esistenti hanno risolto «una sola tessera»; il gap che resta è **«so quanto pago prima di attaccare e so che la colonnina funziona»** — più una proposta B2B/flotte seria. Voltaway compete sulla fiducia (prezzo chiaro) e sull'esperienza di viaggio, non sulla sola copertura.

## Modello di pricing e commissioni

Doppio motore di ricavo, come EasyPark (fee sul transato + abbonamento premium):

| Fonte | Modello | Note |
|---|---|---|
| Fee a sessione | €0,20–0,49 a ricarica oppure markup 3–8% sull'energia | È la commissione tipo EasyPark: piccola, per-transazione, scala col volume |
| Premium (consumer) | 3,99–5,99 €/mese | Azzera/riduce la fee a sessione, sblocca planner avanzato e tariffe scontate negoziate |
| Flotte (B2B) | 1,5–4 €/veicolo/mese + fee a sessione | Fatturazione unica, regole spesa, export contabilità |
| Margine roaming negoziato | Sconto volume dai CPO non interamente girato all'utente | Cresce con la scala: più volume, migliori tariffe d'acquisto |

Regola d'oro: la fee deve restare **invisibile e onesta** — sempre inclusa nel prezzo all-in mostrato prima. La trasparenza è il prodotto; nasconderla ucciderebbe il moat di fiducia.

## Unit economics

| Voce | Stima |
|---|---|
| Spesa media per sessione | €10–25 (energia) |
| Ricavo per sessione (fee + markup) | €0,40–1,20 |
| Costo variabile (PSP + fee hub OCPI) | €0,15–0,40 a sessione |
| Margine di contribuzione per sessione | €0,25–0,80 |
| Sessioni/mese per utente attivo (dipendente da rete pubblica) | 8–20 |
| Ricavo lordo per utente/mese | €3–12 (consumer) ; molto più alto su flotte |
| CAC previsto | €15–40 consumer (community + referral) ; payback 3–6 mesi |

Il business è a **margine sottile per transazione ma altissima frequenza e bassissimo costo marginale software** — identico alla logica EasyPark. La leva di profitto è il volume (potere negoziale roaming) e l'upsell a premium/flotte.

## Perché continuano a usarla

La ricarica fuori casa è un bisogno **settimanale e obbligato** per chi non ha il box: senza l'app non si muove l'auto. Una volta che le carte sono salvate, l'identità roaming attiva e lo storico delle colonnine affidabili costruito, cambiare app significa ricominciare da zero a ogni viaggio — costo di switch reale. Le flotte si agganciano ancora più forte: la rendicontazione unificata diventa un processo aziendale, non un'app personale, e si disinstalla solo cambiando fornitore di mobilità. Più si viaggia, più il sistema «impara» le colonnine che funzionano sul tuo percorso: il valore si accumula con l'uso.

## Go-to-market — primi 10.000 utenti

**Beachhead:** guidatori EV senza ricarica domestica in 1–2 città ad alta densità, dove il dolore della rete pubblica è quotidiano.

1. **Community EV** — gruppi Facebook/forum/Reddit di elettrico, raduni e canali YouTube di settore: il pubblico più caldo e vocale che esista
2. **Loop di referral sul risparmio** — «invita un amico, sessione gratis»: il prodotto fa risparmiare in modo misurabile, quindi il passaparola è naturale
3. **Concessionarie e costruttori** — onboarding al momento della consegna dell'auto (l'attimo in cui il guidatore cerca «come ricarico fuori casa»)
4. **Assicurazioni e fleet manager** — canale B2B verso le partite IVA con auto elettriche aziendali: ingresso diretto al segmento ad alto valore
5. **Comparatore di prezzo come amo** — pubblicare la mappa «prezzo reale €/kWh» anche gratis/web: attira traffico SEO e crea il brand della trasparenza prima ancora dell'app

**Sequenza:** prima dominare 1 città (densità = affidabilità dei dati colonnine) → estendere il corridoio di viaggio verso il secondo Paese → aggredire le flotte con i case study consumer.

## Piano di validazione

1. **Test di copertura e avvio** — collegare 1 hub OCPI + 3 CPO e dimostrare che si avvia/paga davvero ≥90% delle sessioni tentate su un campione di 200 colonnine reali. **Gate go/no-go: tasso di avvio riuscito >90% e prezzo all-in corretto vs scontrino reale.**
2. **Wizard of Oz sul prezzo** — landing + mappa con prezzi €/kWh aggregati a mano: misurare quanti utenti la usano per *decidere dove ricaricare* (segnale di domanda per la trasparenza)
3. **Pilota flotte** — 5–10 piccole flotte con rendicontazione semi-manuale: validare disponibilità a pagare il canone per-veicolo
4. **Pre-registrazioni** — 1.000 iscritti in waiting list dalla community prima della beta

**Criteri di successo:** gate tecnico superato + ≥40% degli utenti beta che fa ≥4 sessioni/mese + almeno 3 flotte che firmano un pilota a pagamento.

## Roadmap 12 mesi

| Fase | Mesi | Obiettivo |
|---|---|---|
| Integrazione + gate tecnico | 1–3 | 1 hub OCPI + 3–5 CPO, motore prezzo all-in, avvio/pagamento; gate >90% successo |
| Beta in 1 città | 4–6 | Mappa live + affidabilità, 1.000 beta user, loop referral |
| Lancio pubblico + corridoio viaggio | 7–9 | Premium consumer, estensione al 2° Paese sul corridoio principale |
| Flotte B2B | 10–12 | Wallet flotte, rendicontazione, primi contratti aziendali; target 10–20k utenti attivi |

## KPI da monitorare

- **Affidabilità:** tasso di avvio sessione riuscito (>95% obiettivo); % colonnine con stato live corretto
- **Trasparenza/fiducia:** scostamento medio tra prezzo mostrato e addebitato (deve tendere a 0); NPS
- **Engagement:** sessioni/mese per utente attivo; % utenti che usano la mappa per *scegliere* la colonnina
- **Economia:** margine di contribuzione per sessione; quota premium/flotte sul transato; CAC e payback
- **Crescita:** GMV (energia transata), utenti attivi mensili, copertura colonnine raggiungibili, churn

## Rischio principale

**Margini compressi tra i CPO a monte e gli aggregatori già lanciati a valle.** Gli operatori di ricarica vogliono tenersi il cliente (e il margine) e possono peggiorare le condizioni roaming; gli aggregatori esistenti (Electroverse di Octopus su tutti) hanno scala, capitale e copertura. La difesa non può essere la copertura — sarebbe una gara persa — ma **la trasparenza radicale del prezzo + l'affidabilità live + il prodotto flotte**, cioè le tre cose che gli incumbent fanno peggio. La finestra per costruire il brand «l'app onesta della ricarica» è stretta (12–24 mesi) e richiede densità geografica prima dell'ampiezza.

---

## Stack tecnologico

Sintesi delle scelte. Razionale completo, diagrammi, modello dati e flussi in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

| Livello | Tecnologia | Note |
|---|---|---|
| Linguaggio | **TypeScript** (strict) ovunque | tipi condivisi tra web, mobile, api, worker |
| Web | **Next.js** (App Router) + React + Tailwind + shadcn/ui | landing, mappa, dashboard flotte — in container (profilo `app`) |
| Mobile | **Expo / React Native** | *fase successiva* — fuori scope attuale; per ora solo web |
| Mappa | **MapLibre GL** + tiles **OpenStreetMap** (servizio esterno gratuito) | nessun accordo né costo; richiede connessione internet |
| API | **NestJS** (REST + WebSocket gateway) | backend always-on |
| Worker | **NestJS standalone** + **BullMQ** (Redis) | sessioni long-running, CDR, sync, idle-fee |
| Database | **PostgreSQL 16 + PostGIS** + **Drizzle ORM** | query geospaziali «vicino a me» |
| Cache / realtime | **Redis 7** + **WebSocket** (Socket.IO) | pub/sub, coda, stato live |
| Object storage | **MinIO** (S3-compatibile) | ricevute/asset → S3/GCS/R2 in prod |
| Pagamenti | **Stripe test mode** (account + API key gratuiti) | nessun addebito reale, nessun contratto PSP; webhook via Stripe CLI (gratuita) |
| Auth | **Keycloak** (OIDC/RBAC, self-hosted) | ruoli `driver`/`fleet_admin`/`admin` |
| Integrazione ricarica | client **OCPI 2.2.1** + servizio **`ocpi-sim`** | CPO simulato che parla OCPI reale |
| Gateway | **Traefik v3** | reverse proxy `*.voltaway.localhost` |
| Qualità / osservabilità | Vitest + Playwright + Testcontainers, ESLint/Prettier, SonarQube, OpenTelemetry → Grafana, Sentry | CI su GitHub Actions |
| Runtime | **Docker + Docker Compose** | infra in container; servizi esterni solo se gratuiti |

## Struttura del repository

> Il repository contiene **attualmente** la documentazione (`README.md`, `ARCHITECTURE.md`) e l'infrastruttura locale (`docker-compose.yml`, config `infra/`, `.env.example`). Lo scaffold del codice applicativo (`apps/*`) è il passo successivo: la struttura target (monorepo) è in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

```text
voltaway/
├── apps/
│   ├── api/             # NestJS REST
│   ├── worker/          # BullMQ / sync
│   ├── web/             # Next.js mappa
│   └── ocpi-sim/        # simulatore CPO OCPI
├── packages/
│   ├── core/            # dominio + motore prezzo
│   ├── ocpi/            # client OCPI
│   └── db/              # Drizzle schema
├── PROGRESS.md          # registro avanzamento
├── docker-compose.yml
└── ...
```

## Avvio rapido

Prerequisiti: **Docker** + **Docker Compose v2** (per stack completo), oppure **Node 22** + **pnpm** (solo app).

```bash
cp .env.example .env

# Infrastruttura
docker compose up -d

# Stack applicativo (build + avvio)
docker compose --profile app up -d --build
```

**Sviluppo senza rebuild Docker** (con infra già su Compose):
```bash
pnpm install
pnpm format              # formatta tutto il codice (Prettier)
pnpm --filter @voltaway/ocpi-sim dev   # :4000
pnpm --filter @voltaway/api dev        # :3001
pnpm --filter @voltaway/web dev         # :3000
```

Console: `app.voltaway.localhost` · `api.voltaway.localhost/health` · `auth.voltaway.localhost`

## Politica sviluppo locale

Regole per questa fase (documentazione + infra, sviluppo app più avanti):

| Cosa | Scelta |
|---|---|
| **Runtime** | Tutto ciò che è nostro gira in **Docker Compose** (infra oggi; `api`/`worker`/`web`/`ocpi-sim` quando scaffoldati) |
| **Costi** | **Zero costi** — nessun servizio a pagamento in locale |
| **Accordi commerciali** | **Nessuno** — niente CPO, hub OCPI, PSP reali; `ocpi-sim` + Stripe **test mode** |
| **Servizi esterni** | **Ammessi solo se gratuiti** — es. [Stripe test](https://stripe.com) (account + API key gratis), [tile OSM](https://www.openstreetmap.org) (mappa), Stripe CLI per i webhook |
| **Mobile** | **Rimandato** — per ora web in container; l'app nativa si definirà in seguito |
| **Codice applicativo** | **Scaffold base fatto** — mappa + prezzi all-in; sessioni/Stripe prossimi |

Cosa resta simulato o esterno (ma sempre gratis):

- **Ricarica** — `ocpi-sim` in Compose (OCPI 2.2.1, dati seed), non hub/CPO reali.
- **Pagamenti** — Stripe *test mode*: crei un account gratuito, usi chiavi `sk_test_` / `pk_test_`, nessun addebito reale.
- **Mappa** — tile da OpenStreetMap via internet; gratuite, senza API key.
- **Email** — Mailpit in Compose (nessun SMTP esterno).

## Glossario

- **CPO (Charge Point Operator)** — chi possiede e gestisce le colonnine
- **eMSP (e-Mobility Service Provider)** — fornitore del servizio di accesso/pagamento per il guidatore: il ruolo che gioca Voltaway
- **OCPI** — protocollo aperto che fa dialogare CPO ed eMSP (abilita il roaming tra reti)
- **Roaming** — usare e pagare colonnine di operatori diversi con un'unica identità/contratto
- **Hub (Hubject/Gireve)** — intermediari che aggregano connessioni roaming tra molti CPO ed eMSP
- **Plug & Charge** — avvio automatico della ricarica al collegamento del cavo, senza app/tessera
- **Idle fee** — penale per occupazione della colonnina dopo che l'auto è carica
- **AFIR** — regolamento UE sull'infrastruttura per i combustibili alternativi (impone trasparenza prezzi e pagamento ad-hoc)
- **GMV** — valore lordo transato sulla piattaforma (qui: energia pagata dagli utenti)
- **CAC / NPS / churn / TAM / SAM / SOM** — metriche standard: costo di acquisizione, soddisfazione, abbandono, mercato totale/servibile/ottenibile

## Licenza

Software **proprietario** — tutti i diritti riservati. Questo materiale (codice e documentazione) è confidenziale e destinato esclusivamente alla valutazione interna del progetto Voltaway. Nessun accordo, partnership o impegno commerciale con CPO, hub OCPI, PSP o terzi è implicato da questo repository.
