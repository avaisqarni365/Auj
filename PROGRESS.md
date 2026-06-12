# PROGRESS — single source of truth for "where are we"
_Last updated: 2026-06-12 · by: Claude Code · commit: (scaffold)_

## Now building
Wave 0 — contracts next (scaffold done).

## Status by wave
### Wave 0 — sequential (scaffold + contracts + mock)
- [x] 00-getting-started — pnpm+Turborepo monorepo wired; build/typecheck/lint/test all green; CI + docker-compose authored
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
- Wave 0 scaffold landed: packages/{contracts,connector-mock,connector-saudi,connector-travel,core-booking,payments,compliance,ui} + apps/{web-b2c,web-b2b,admin}, each an empty-but-wired TS package. Design handoff added under design_handoff_auj_platform/.

## Next up (top 3)
1. Build packages/contracts from saudi-connector-interface/SKILL.md (SaudiConnector + TravelSupplier + Zod + domain types).
2. Build connector-mock; get the shared contract-tests green offline.
3. Wave B prep: wire the AUJ design tokens (tailwind.config.js / tokens.css) into the ui package + web-b2c/web-b2b.

## Blockers / waiting on
- Saudi Maqam access: PENDING (partner TBD). Does NOT block Wave A/B — build on the mock.

## Open assumptions (full list in docs/assumptions.md)
- Maqam payload shapes are mocked; real shapes come from partner sandbox in Wave C.
- e-visa eligible nationality list is config-driven; verify against the current Saudi list.
- PKR payment gateway = TBD; validate acquiring early.

## First launchable milestone
General-travel slice (connector-travel + core-booking + payments + web-b2c) — zero Saudi dependency.
