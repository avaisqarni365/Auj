# PROGRESS — single source of truth for "where are we"
_Last updated: 2026-06-12 · by: Claude Code · commit: (scaffold)_

## Now building
Wave A COMPLETE. The first launchable slice (connector-travel + core-booking + payments) is proven end-to-end against mocks. Wave B (apps) is open.

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
- [ ] b2c-website
- [ ] b2b-agent-portal

### Wave C — gated / anytime
- [ ] certified-saudi-connector  (needs partner/Ministry access)
- [ ] compliance-eu              (finalize before launch)
- [ ] admin

## In progress
- (nothing in flight — Wave A closed)

## Next up (top 3)
1. Wave B: web-b2c (public booking funnel) on the Wave A APIs — wire the AUJ design tokens (tailwind.config.js / tokens.css) into the ui package + web-b2c.
2. Wave B: web-b2b (agent portal) — wallet/credit, multi-pax (<=49), markups, quotations, statements.
3. App edge wiring: PaymentsService.pay -> paymentRef -> core-booking.confirm; select CONNECTOR/SUPPLIER by env (mock now).

## Blockers / waiting on
- Saudi Maqam access: PENDING (partner TBD). Does NOT block Wave A/B — build on the mock.

## Open assumptions (full list in docs/assumptions.md)
- Maqam payload shapes are mocked; real shapes come from partner sandbox in Wave C.
- e-visa eligible nationality list is config-driven; verify against the current Saudi list.
- PKR payment gateway = TBD; validate acquiring early.

## First launchable milestone
General-travel slice (connector-travel + core-booking + payments + web-b2c) — zero Saudi dependency.
