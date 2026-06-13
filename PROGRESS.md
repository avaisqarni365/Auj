# PROGRESS — single source of truth for "where are we"
_Last updated: 2026-06-12 · by: Claude Code · commit: (scaffold)_

## Now building
ALL MODULES BUILT. web-b2b now has a Next.js shell too (runnable). Remaining: real partner SaudiPartnerClient (gated), real payment-gateway SDKs, optional admin Next shell, run the deploy pipeline.

## Frontend handoff (design_handoff_auj_platform, expanded 2026-06-13)
- New bundle adds Brand/Logo, Landing (responsive web /), Admin (Web) console, Traveller portal (web /journey + mobile). CLAUDE_CODE.md = kickoff prompt + route map; README = full spec.
- [x] @auj/ui <Logo/> — official zenith mark (4 colourways) + bilingual Wordmark.
- [x] apps/web (NEW Next app @auj/web) — Landing page at /: announcement, nav, hero (+floating cards), overlapping search (tabs/stepper), trust, journey types, one-cart, how-it-works, visa-route panel (real routeFor demo), featured packages, EN/LT/UR/AR switcher w/ RTL, track-booking timeline, testimonials, FAQ accordion, CTA, footer. Responsive (clamp/auto-fit). 6 tests. `npm run dev:web` (:3000).
- [x] Admin (Web) console at /admin — 248px green sidebar + topbar (search, FX chip, bell, +New booking); client view switching: Overview (KPIs, recent bookings, visa pipeline, departures), Pilgrims·CRM (table -> master/detail profile: journey timeline, docs, visa card, payments, comms, group), Landing CMS (hero editor + sections), Users & roles (tab filter + table). visa-route pills via real routeFor. Sample data in src/admin-content.ts (4 tests).
- [x] Traveller web portal /journey — portal nav + booking hero (BRN, route/dates/pax, "Visa in progress" pill, days-to-departure, 5-stage progress) + tabs: Journey (every-step timeline + What's-next + QR digital pass encoding the BRN), Itinerary (day cards), Documents (docs + per-pilgrim visa status via routeFor), Payments (summary + EUR/PKR + transactions + receipt/plan). Content in src/journey-content.ts (5 tests).
- [x] PDF travel-plan + Umrah guide — print-optimised /journey/plan (rituals, day-by-day, document checklist, tips; Print/Save-PDF; print:hidden toolbar, break-inside-avoid). Linked from portal + admin profile.
- [ ] Traveller MOBILE app screens (separate RN/PWA track).

## Design quality as a workflow (added 2026-06-13)
- [x] .claude/skills/design-taste/SKILL.md — Emil-Kowalski-grade motion + impeccable design + typography + taste, with a finish checklist. Auto-surfaces on UI work (description match); invoke as /design-taste. THE workflow to apply on every frontend change.
- [x] @auj/ui motion — preset keyframes (fade-in/rise/pop), ease-out-soft, duration-fast; @auj/ui/motion.css (prefers-reduced-motion guard, imported in all 3 app globals); Button press (active:scale .98), Card hover transition. Purposeful, fast, transform/opacity-only.

## How to run (each app is a SEPARATE Next app; one at a time on :3000)
- `npm run dev`  -> marketing LANDING (@auj/web) — the public front door. Routes: / , /admin , /journey , /journey/plan.
- `npm run dev:b2c` -> booking funnel (web-b2c). `npm run dev:b2b` -> agent portal. `npm run dev:web` = landing (alias of dev).
- If a page shows HTTP 500 / blank after many edits: it's a stale Next cache — stop dev, `rm -rf apps/<app>/.next`, restart. NEVER run `build:next` while `next dev` is live on the same app (it corrupts .next).
- (history) `npm run dev` previously launched web-b2c; it now launches the landing. (app bar + gold-star logo, serif hero, search card, popular rail, trust strip; sticky sub-screen headers; visa-route gradient card; green My-Booking header + live visa timeline).
- `npm run dev:b2b` -> web-b2b agent portal (:3000): HI-FI desktop design (dark-green rail + topbar, KPI dashboard + visa pipeline + credit card, multi-pax passenger table + group summary, wallet 3-card + transactions, markup rules+editor, quotation, statements). Auto-onboards a GOLD agent, funds wallet, multi-pax book (<=49).
- `npm run dev:all` -> every app (needs --concurrency, already set).

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
- [x] certified-saudi-connector (SHELL) — @auj/connector-saudi v1.0.0: SaudiPartnerConnector implements SaudiConnector by mapping Maqam/Nusuk vendor payloads (client.ts SaudiPartnerClient seam) -> domain; BRNs verbatim; Nusuk-approved-hotel rule enforced on visa flow; retry resilience. Ships an offline SandboxSaudiPartnerClient so the SHARED contract-tests pass now. 11 tests. SWAP: implement a real HTTP SaudiPartnerClient when partner sandbox/credentials land (A1); select via CONNECTOR=saudi
- [x] compliance-eu — @auj/compliance v1.0.0: insolvency-protection certificate (issue+deliver, guarantee tier config 20k/50k/200k), pre-contract consent gating (assertChargeable blocks until consent), PTD 6-month refund window, GDPR (processing records, subject export, erasure). ComplianceService facade. 4 test groups
- [x] admin — @auj/admin v1.0.0: back office over the shared service packages. AdminApi oversight (list/cancel/refund bookings, visa cases, ledger entries + balances, certificate registry, GDPR export/erase), adminMetrics, 5 @auj/ui screens (Dashboard/BookingsTable/LedgerView/VisaMonitor/CompliancePanel). 5 tests incl. oversight e2e. Framework-light (Next shell optional, like web-b2b)

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
