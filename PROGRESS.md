# PROGRESS — single source of truth for "where are we"
_Last updated: 2026-06-12 · by: Claude Code · commit: (scaffold)_

## Now building
Wave C + infra. compliance-eu, deployment pipeline, Postgres adapter, and web-b2c env-driven persistence done. Remaining: connector-saudi (gated), admin, optional web-b2b Next shell.

## Status by wave
### Wave 0 — sequential (scaffold + contracts + mock) — DONE
- [x] 00-getting-started — pnpm+Turborepo monorepo wired; build/typecheck/lint/test all green; CI + docker-compose authored
- [x] saudi-connector-interface — @auj/contracts v1.0.0: SaudiConnector + TravelSupplier ports, full Zod domain schemas, reusable contract-tests (@auj/contracts/contract-tests). 5 schema tests green
- [x] saudi-connector-mock — @auj/connector-mock v1.0.0: in-memory SaudiConnector + TravelSupplier, seed catalog, env edge-case toggles, offline demo (search->hold->confirm->BRN->visa->ISSUED). 15 tests incl. shared contract-tests green

### Wave A — parallel, against the mock
- [x] booking-crm-documents — @auj/core-booking v1.0.0: full booking lifecycle state machine, CRM (customers/pilgrims/mahram), package builder, document service (S3 port + OCR hook), connectors by DI + visa-router wired. 14 tests incl. e2e pilgrimage + travel against the mock
- [x] payments-wallet — @auj/payments v1.0.0: PaymentProvider port + Stripe(EUR)/PKR sandbox adapters, double-entry Ledger (always balances), agent WalletService with credit limits/holds/settlement, idempotent capture + refunds + webhook reconcile. 19 tests
- [x] visa-router — @auj/visa-router v1.0.0: pure routeFor()/routeForGroup(), config-driven eligibility (nationality + Schengen/UK/US/GCC residence), dual-national preference, seasonal-suspension warnings. 16 tests, all branches
- [x] general-travel-connectors — @auj/connector-travel v1.0.0: bedbank (TBO-style) + flight (Amadeus-style) adapters mapping vendor payloads into domain types, composed into a TravelConnector behind TravelSupplier; sandbox clients for offline. 8 tests incl. the shared TravelSupplier contract-tests

### Wave B — parallel, on Wave A APIs
- [x] ui design system — @auj/ui v1.0.0: aujPreset (Tailwind tokens), tokens.css, core React components (Button/Input/Select/Card/StatusPill/Stepper/SegmentedControl/Toggle). 10 tests. Maps the design handoff onto reusable primitives both apps share
- [x] b2c-website — @auj/web-b2c: funnel (ports + in-process backend, reducer, usecases, fx, i18n EN/LT/UR/AR, 6 @auj/ui screens; 15 tests incl. e2e on the mock) PLUS a Next.js App Router shell (app/ with Server Actions running the backend server-side, aujPreset Tailwind, IBM Plex fonts, tokens.css). `npm run dev` serves it at :3000; `next build` green. tsc gate stays fast (build = tsc -p tsconfig.build.json)
- [x] b2b-agent-portal (framework-light) — @auj/web-b2b: AgentService (register/approve/sub-agent hierarchy), MarkupEngine (tier+product specificity), multi-pax bookGroupFromWallet (<=49, wallet-funded, credit limit blocks over-limit), QuotationService, statements (ledger-reconciling + CSV), 6 @auj/ui screens. 21 tests incl. e2e (register->approve->fund->book 49 pax with markup->statement reconciles). Next.js shell optional/pending like web-b2c

### Wave C — gated / anytime
- [ ] certified-saudi-connector  (needs partner/Ministry access)
- [x] compliance-eu — @auj/compliance v1.0.0: insolvency-protection certificate (issue+deliver, guarantee tier config 20k/50k/200k), pre-contract consent gating (assertChargeable blocks until consent), PTD 6-month refund window, GDPR (processing records, subject export, erasure). ComplianceService facade. 4 test groups
- [ ] admin

### Persistence (added 2026-06-13)
- [x] Postgres adapter behind the repository ports — @auj/core-booking/postgres:
  createPool/migrate (inline SCHEMA_SQL) + createPostgresStores(pool) returning the
  same Stores shape as in-memory (drop-in for createCoreBooking({ stores })). node-postgres
  + hand-written SQL (not Prisma — keeps the offline gate green; see ADR-0002).
  Pure row<->domain mappers unit-tested; full adapter exercised offline via pg-mem
  (aggregate save/reload, jsonb, upsert); real-DB integration test gated on TEST_DATABASE_URL.
- [x] web-b2c env-driven persistence — backend/in-process.ts now has createBackend():
  Postgres (createPool + migrate + createPostgresStores) when DATABASE_URL is set, else
  in-memory. Server Actions use a lazy async singleton. next.config marks pg external.
  Next app compiles + generates pages either way.

### Deployment pipeline (added 2026-06-13)
- [x] web-b2c Docker image (multi-stage monorepo -> Next standalone); .dockerignore
- [x] infra/docker-compose.yml (web + postgres/redis/minio, datastores bound to 127.0.0.1)
- [x] CI workflow (lint/typecheck/test/build + docker build verify) + Deploy workflow (tag -> GHCR push -> SSH deploy, guarded on secrets)
- [x] infra/deploy.sh + infra/.env.example + infra/README.md runbook (tunnel guidance, rollback)
- NOTE: standalone next build needs Linux symlinks (works in Docker/CI); local Windows build hits EPERM on the final symlink-copy only (app compiles fine). Docker build + remote deploy not executed here (no Docker/gh locally).

## In progress
- Wave B: web-b2c (runnable) + web-b2b (framework-light) done. Optional web-b2b Next shell; Wave C next.

## DB / infra (answered 2026-06-13)
- DB = PostgreSQL. Real adapter now exists at @auj/core-booking/postgres (node-postgres). In-memory remains the default until an app wires DATABASE_URL. To use it: createPool -> migrate -> createCoreBooking({ stores: createPostgresStores(pool) }). Verify against a DB: `TEST_DATABASE_URL=postgresql://auj:auj@localhost:5432/auj pnpm --filter @auj/core-booking test`.
- IONOS server 212.227.54.250: direct SSH check was blocked by the "only through tunnel" guardrail. To use the DB: open an SSH tunnel `ssh -N -L 5432:localhost:5432 root@212.227.54.250`, keep Postgres bound to 127.0.0.1 on the server, set DATABASE_URL=postgresql://USER:PASS@localhost:5432/auj. Do NOT expose 5432 publicly.

## Notes / how to run
- `npm run dev` (root) -> turbo builds web-b2c deps then `next dev` at http://localhost:3000.
- `npm run dev:all` runs every package's dev (needs --concurrency=15, already set).
- web-b2c gate build is `tsc -p tsconfig.build.json` (fast); the Next app build is `build:next`.

## Next up (top 3)
1. Wave B: web-b2b — agent portal (wallet/credit, multi-pax <=49, markups, quotations, statements), same framework-light-then-shell approach.
2. Wave C anytime: compliance-eu; connector-saudi when partner access lands.
3. Optional: drive <html lang/dir> from a locale route in web-b2c; add real photography/icons per the design handoff.

## Blockers / waiting on
- Saudi Maqam access: PENDING (partner TBD). Does NOT block Wave A/B — build on the mock.

## Open assumptions (full list in docs/assumptions.md)
- Maqam payload shapes are mocked; real shapes come from partner sandbox in Wave C.
- e-visa eligible nationality list is config-driven; verify against the current Saudi list.
- PKR payment gateway = TBD; validate acquiring early.

## First launchable milestone
General-travel slice (connector-travel + core-booking + payments + web-b2c) — zero Saudi dependency.
