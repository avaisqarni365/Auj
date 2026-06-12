# PROGRESS — single source of truth for "where are we"
_Last updated: 2026-06-12 · by: Claude Code · commit: (scaffold)_

## Now building
Wave 0 — connector-mock next (scaffold + contracts done).

## Status by wave
### Wave 0 — sequential (scaffold + contracts + mock)
- [x] 00-getting-started — pnpm+Turborepo monorepo wired; build/typecheck/lint/test all green; CI + docker-compose authored
- [x] saudi-connector-interface — @auj/contracts v1.0.0: SaudiConnector + TravelSupplier ports, full Zod domain schemas, reusable contract-tests (@auj/contracts/contract-tests). 5 schema tests green
- [ ] saudi-connector-mock — passes contract-tests offline

### Wave A — parallel, against the mock
- [ ] booking-crm-documents
- [ ] payments-wallet
- [ ] visa-router
- [ ] general-travel-connectors

### Wave B — parallel, on Wave A APIs
- [ ] b2c-website
- [ ] b2b-agent-portal

### Wave C — gated / anytime
- [ ] certified-saudi-connector  (needs partner/Ministry access)
- [ ] compliance-eu              (finalize before launch)
- [ ] admin

## In progress
- packages/contracts is complete (types + Zod + ports + contract-tests). connector-mock + connector-travel mock still empty stubs.

## Next up (top 3)
1. Build connector-mock: in-memory SaudiConnector (+ a mock TravelSupplier) that passes @auj/contracts/contract-tests offline.
2. Wave A can then start in parallel: booking-crm-documents, payments-wallet, visa-router, general-travel-connectors.
3. Wave B prep: wire the AUJ design tokens (tailwind.config.js / tokens.css) into the ui package + web-b2c/web-b2b.

## Blockers / waiting on
- Saudi Maqam access: PENDING (partner TBD). Does NOT block Wave A/B — build on the mock.

## Open assumptions (full list in docs/assumptions.md)
- Maqam payload shapes are mocked; real shapes come from partner sandbox in Wave C.
- e-visa eligible nationality list is config-driven; verify against the current Saudi list.
- PKR payment gateway = TBD; validate acquiring early.

## First launchable milestone
General-travel slice (connector-travel + core-booking + payments + web-b2c) — zero Saudi dependency.
