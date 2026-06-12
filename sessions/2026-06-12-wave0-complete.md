# Session 2026-06-12 — Wave 0 complete (scaffold + contracts + mock)
Device: desktop · Branch: main · Driver: Claude Code

## Goal this session
- Organize the repo, push to GitHub, and complete Wave 0 (scaffold -> contracts -> mock).

## What I did
- Reorganized D:\AUJ into a single clean repo; renamed project to AUJ; pushed to
  https://github.com/avaisqarni365/Auj.git (main).
- 00-getting-started: pnpm + Turborepo monorepo, strict TS, flat ESLint, Prettier,
  Vitest, docker-compose (pg/redis/minio), GitHub Actions CI. Green skeleton.
- saudi-connector-interface: @auj/contracts v1.0.0 — domain types + Zod schemas,
  SaudiConnector + TravelSupplier ports, reusable contract-tests at the
  @auj/contracts/contract-tests subpath.
- saudi-connector-mock: @auj/connector-mock v1.0.0 — in-memory SaudiConnector +
  TravelSupplier, seed catalog, env edge toggles (HOLD_EXPIRY / REJECT_VISA / SOLD_OUT),
  scripted offline demo. 15 tests incl. the shared contract-tests.
- Added the design handoff bundle under design_handoff_auj_platform/ (hi-fi B2C/B2B
  reference + tokens.css + tailwind.config.js).

## Decisions made (link ADRs)
- ADR-0001 (existing) holds: single SaudiConnector seam, build on mock, swap real later.
- connector-mock hosts BOTH the SaudiConnector and TravelSupplier mocks (per ARCHITECTURE
  s4: connector-mock = "in-memory SaudiConnector + TravelSupplier (dev/test default)").
- Mock's visa routing is a small inline stand-in; the canonical config-driven rule will
  live in the visa-router module (Wave A).

## Assumptions added / changed
- No new assumptions; docs/assumptions.md A1-A5 still open (Maqam shapes mocked, etc.).

## Tests / quality gate
- typecheck · lint · unit · contract-tests · e2e-mock(demo) -> PASS
- Full repo: build 11/11, typecheck 12/12, lint 11/11, test 12/12. Mock demo reaches visa ISSUED.

## State at end (mirror into PROGRESS.md)
- Wave / module: Wave 0 COMPLETE. Wave A open.
- Done: scaffold, @auj/contracts, @auj/connector-mock.
- Not done: all product modules (Wave A/B), connector-saudi + compliance (Wave C).

## Handoff — START HERE NEXT TIME
1. Run /session-start.
2. Wave A: start with visa-router (pure domain) to formalize the e-visa vs agent-channel
   rule; then booking-crm-documents + payments-wallet + general-travel-connectors, each
   against connector-mock. Keep each on its own branch.
3. Wave B prep: map design_handoff tokens onto the ui package + web-b2c/web-b2b.
