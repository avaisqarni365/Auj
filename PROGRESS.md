# PROGRESS — single source of truth for "where are we"
_Last updated: 2026-06-12 · by: Claude Code · commit: (scaffold)_

## Now building
Wave 0 COMPLETE. Wave A is open — booking, payments, visa-router, general-travel can build in parallel against the mock.

## Status by wave
### Wave 0 — sequential (scaffold + contracts + mock) — DONE
- [x] 00-getting-started — pnpm+Turborepo monorepo wired; build/typecheck/lint/test all green; CI + docker-compose authored
- [x] saudi-connector-interface — @auj/contracts v1.0.0: SaudiConnector + TravelSupplier ports, full Zod domain schemas, reusable contract-tests (@auj/contracts/contract-tests). 5 schema tests green
- [x] saudi-connector-mock — @auj/connector-mock v1.0.0: in-memory SaudiConnector + TravelSupplier, seed catalog, env edge-case toggles, offline demo (search->hold->confirm->BRN->visa->ISSUED). 15 tests incl. shared contract-tests green

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
- (nothing in flight — Wave 0 closed)

## Next up (top 3)
1. Wave A: build visa-router (pure domain — formalize the e-visa vs agent-channel rule the mock stubs in visa-rule.ts).
2. Wave A: booking-crm-documents and payments-wallet against connector-mock; general-travel-connectors against the mock TravelSupplier.
3. Wave B prep: wire the AUJ design tokens (tailwind.config.js / tokens.css) into the ui package + web-b2c/web-b2b.

## Blockers / waiting on
- Saudi Maqam access: PENDING (partner TBD). Does NOT block Wave A/B — build on the mock.

## Open assumptions (full list in docs/assumptions.md)
- Maqam payload shapes are mocked; real shapes come from partner sandbox in Wave C.
- e-visa eligible nationality list is config-driven; verify against the current Saudi list.
- PKR payment gateway = TBD; validate acquiring early.

## First launchable milestone
General-travel slice (connector-travel + core-booking + payments + web-b2c) — zero Saudi dependency.
