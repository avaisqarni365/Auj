# 04 · Pilgrim Profile  &  05 · Pilgrim Dashboard

**Prototypes:** `AUJ Pilgrim Profile.dc.html`, `AUJ Pilgrim Dashboard.dc.html`
**Target:** `apps/web/app/journey/` (+ `app/journey/[brn]/`) + `apps/web/src/journey/`
**Wave:** B

## What they are
- **Profile:** cover (avatar, where-from, tier, CRN, stats), editable personal details, pilgrimage history timeline, preferences.
- **Dashboard:** profile switcher (Me/Family/Group), **passport scan** (upload → OCR auto-fill, editable), **deposit/pay** card with **EUR/USD/SAR/PKR** toggle, a **success/progress bar** (Registered→Passport→Deposit→Visa started→Info sent), and an **icon grid linking every tool in sequence**.

## Port map
- `renderVals()` passport fields + `onPhoto` → form bound to `PassportOcr` port (`core-booking/ports.ts`) → fields editable.
- Currency toggle → `src/currency.ts` (EUR charged of record; others indicative via FX).
- Progress stages → derive from booking `state-machine.ts` status, not ad-hoc flags.
- Tool grid → real routes (link to each migrated screen).
- localStorage `auj-dashboard` / `auj-profile` → cache only; source of truth is DB.

## DB integration (see 00b-db-conventions.md)
- Reuse `customers` + `pilgrims` tables (already in core-booking schema). Add if missing:
  `pilgrim_profiles (pilgrim_id PK, city, country, email, phone, languages JSONB, tier, crn, since)`
  `pilgrimage_history (id, pilgrim_id, title, year, detail, rating, created_at)`
  `passport_scans (id, pilgrim_id, image_key→DocumentStore, mrz, extracted JSONB, status, created_at)`.
- Passport image → `DocumentStore.put` (S3/MinIO); MRZ via `PassportOcr.read`; extracted fields editable then `pilgrims.save`.
- Deposit → `payments` package intent (see spec on payments); progress bar reads booking status.
- `CustomerRepository`/`PilgrimRepository` already exist — add `ProfileRepository`, `HistoryRepository`.

## Command
```
Implement Pilgrim Profile (app/journey/[brn]) and Pilgrim Dashboard (app/journey) from
"AUJ Pilgrim Profile.dc.html" and "AUJ Pilgrim Dashboard.dc.html".
DB: reuse customers+pilgrims; add pilgrim_profiles, pilgrimage_history, passport_scans tables
  (SCHEMA_SQL, in-memory + postgres adapters, repo tests). Passport image→DocumentStore.put,
  MRZ→PassportOcr.read, fields editable→PilgrimRepository.save.
UI: Me/Family/Group switcher, passport scan card, deposit card with EUR/USD/SAR/PKR (src/currency.ts,
  EUR charged + others indicative), progress bar derived from booking state-machine status, tool grid
  linking real routes. packages/ui + tokens.css. Keep localStorage as offline cache only.
Visa-route per pilgrim shown. Pass: typecheck, lint, unit, e2e-mock. Summarize; update sessions/.
```

## Acceptance
- [ ] Passport upload stores blob + extracted fields; edits persist to `pilgrims`.
- [ ] Currency toggle: EUR charged of record, others indicative w/ FX surfaced.
- [ ] Progress bar reflects real booking status; agent/family scoping correct.
