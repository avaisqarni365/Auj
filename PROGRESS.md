# PROGRESS — single source of truth for "where are we"
_Last updated: 2026-06-12 · by: setup · commit: (initial)_

## Now building
Wave 0 — scaffold → contracts → mock.

## Status by wave
### Wave 0 — sequential (scaffold + contracts + mock)
- [ ] 00-getting-started — monorepo scaffolds, CI green
- [ ] saudi-connector-interface — contracts + Zod + contract-tests
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
- (nothing yet)

## Next up (top 3)
1. Run /session-start, then 00-getting-started to scaffold the monorepo.
2. Build packages/contracts from saudi-connector-interface/SKILL.md.
3. Build connector-mock; get contract-tests green.

## Blockers / waiting on
- Saudi Maqam access: PENDING (partner TBD). Does NOT block Wave A/B — build on the mock.

## Open assumptions (full list in docs/assumptions.md)
- Maqam payload shapes are mocked; real shapes come from partner sandbox in Wave C.
- e-visa eligible nationality list is config-driven; verify against the current Saudi list.
- PKR payment gateway = TBD; validate acquiring early.

## First launchable milestone
General-travel slice (connector-travel + core-booking + payments + web-b2c) — zero Saudi dependency.
