# CLAUDE.md — build orchestration

You are building a hybrid Umrah/Hajj + general-travel platform. Build the product; integrate the
regulated Saudi pipe behind one interface. This file tells you HOW to drive the build. Read
`ARCHITECTURE.md` and `00-architecture-and-conventions/SKILL.md` before writing code.

## Golden rules (never break)
1. Product modules (core-booking, payments, visa-router, web-b2c, web-b2b) import the **interfaces**
   (`SaudiConnector`, `TravelSupplier`) — never a concrete connector.
2. The default connector in all dev/test is `connector-mock`. The real one is selected by
   `CONNECTOR=saudi` in production only.
3. **Never block a module on real Saudi/Maqam access.** Build against the mock; swap later via env.
4. A module is not done until it passes the shared contract-tests AND its own SKILL.md acceptance
   criteria. Do not invent Maqam payloads — keep using the mock and record assumptions.

## Build waves (gate each wave on the previous; parallelize within a wave)
- **Wave 0 — sequential:** scaffold the monorepo → `saudi-connector-interface` → `saudi-connector-mock`.
- **Wave A — parallel (against the mock):** `booking-crm-documents`, `payments-wallet`,
  `visa-router`, `general-travel-connectors`.
- **Wave B — parallel (on Wave A's APIs):** `b2c-website`, `b2b-agent-portal`.
- **Wave C — gated / anytime:** `certified-saudi-connector` (needs partner/Ministry access),
  `compliance-eu` (finalize before launch), `admin`.

## How to run one skill
1. Open its `SKILL.md`. Treat "Scope", "Depends on / Provides", and "Out of scope" as hard boundaries.
2. Implement exactly its "Build steps".
3. Satisfy every "Acceptance criteria" line; write the tests it asks for.
4. Run: typecheck, lint, unit, shared contract-tests, e2e-against-mock. All green before merge.

## Parallelism
Assign one skill per branch/worktree so multiple agents never edit the same package. Wave A's four
skills can run fully concurrently because they only share `contracts` (read-only after Wave 0).

## CI quality gates (must pass to merge)
`typecheck` · `lint` · `unit` · `contract-tests` (against mock) · `e2e-mock`.
Add `contract-tests` against the Saudi sandbox only inside the `connector-saudi` pipeline (Wave C).

## First launchable slice
The general-travel leg (`general-travel-connectors` + booking + payments + web-b2c) has ZERO Saudi
dependency. Ship it first to validate the stack and start revenue while Saudi access is pending.

## If you get stuck
- Missing Saudi spec → keep the mock, note the assumption in `/docs/assumptions.md`, continue.
- Cross-module need → add it to the relevant interface in `contracts`, bump the contract version,
  update the mock — do NOT reach into another module's internals.
