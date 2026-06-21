# 01 · Visa Router

**Prototype:** `AUJ Visa Router.dc.html`
**Target:** `packages/visa-router/` (logic — exists) + `apps/web/app/admin/visa/page.tsx` (UI)
**Wave:** A

## What it is
Pure eligibility engine: nationality + residence/qualifying-visa → `EVISA_DIRECT` or `AGENT_CHANNEL`,
plus a seasonal-suspension **warning** (not a hard fail). Prototype has an interactive demo with a
decision trace.

## Port map
- `renderVals()` logic (`eVisaNats`, `gccNats`, `seasonalBlocked`, the trace) → `packages/visa-router/src/routeFor.ts`
  returning `{ route: VisaRoute; warnings: string[] }`. Lists are **config** (easy to edit), 100% branch tested.
- The two dropdowns + result card + decision trace → an admin demo/QA page `app/admin/visa/page.tsx`.
- Route pill (e-Visa = success/green, Agent = info/teal) → reuse the shared `VisaRoutePill`.

## Command
```
Implement the Visa Router from "AUJ Visa Router.dc.html".
Logic: packages/visa-router/src/routeFor.ts — pure function routeFor(pilgrim) =>
  { route: 'EVISA_DIRECT'|'AGENT_CHANNEL'; warnings: string[] }. Encode eligibleNationalities,
  residenceQualifiers, seasonalSuspensions as config. 100% branch coverage unit tests.
UI: app/admin/visa/page.tsx — nationality + residence selects, route result card, decision trace,
  using packages/ui primitives + tokens.css (#0F5132→--auj-green-800, #2F6F8F→--auj-accent-600).
Reuse the VisaRoutePill component. No connector calls (pure domain).
Pass: typecheck, lint, unit (100% branch), contract-tests. Summarize changed files; update sessions/.
```

## DB integration (see 00b-db-conventions.md)
Visa Router itself is **pure** (no DB). What persists is the *decision* on a pilgrim/booking:
- Table `visa_cases (id, pilgrim_id, booking_id, route, status, warnings JSONB, created_at, updated_at)`
  via `VisaCaseRepository` (already in `core-booking/ports.ts`) — add `SCHEMA_SQL` if missing.
- On booking, persist the routed result; `activity_logs` row on any manual route override (with reason).
- Zod-validate `{route, status}` against `contracts` before save.

## Acceptance
- [ ] `routeFor` 100% branch coverage; lists change without code edits.
- [ ] Routed result stored on the visa_case; override logged.
- [ ] EU/UK/US/GCC → e-Visa; PK/other → Agent; seasonal returns route + warning.
- [ ] Pill colours match (success vs info); RTL ok.
