# 07 · Packing Organizer

**Prototype:** `AUJ Packing Organizer.dc.html`
**Target:** `apps/web/app/companion/packing/` + `apps/web/src/companion/`
**Wave:** B

## What it is
Tickable checklist by profile (Men/Women/Kids/Family/Diabetic) and stay length (11/21/30 days,
quantities scale). Grouped sections; progress bar; saved per profile.

## Port map
- `build(profile, days)` quantity logic → `src/companion/packing.ts` (pure, unit tested).
- Check state (`profile:itemId`) → DB-backed per pilgrim; localStorage `auj-packing` as offline cache.

## DB integration (see 00b-db-conventions.md)
- Table `packing_lists (id, pilgrim_id, profile, days, checked JSONB, updated_at)` via `PackingRepository`.
- Server Action `togglePackingItem` / `setProfileDays` → upsert; revalidate.
- Quantities computed server-or-client from `packing.ts` (single source).

## Command
```
Implement Packing Organizer from "AUJ Packing Organizer.dc.html" at app/companion/packing.
src/companion/packing.ts: build(profile, days) → grouped items with scaled quantities (unit tests).
DB: packing_lists (pilgrim_id, profile, days, checked JSONB) — SCHEMA_SQL, adapters, repo test.
Actions: toggle item, set profile/days → upsert (keep localStorage auj-packing as offline cache).
UI: profile tabs (incl. Diabetic), 11/21/30-day toggle, grouped checkboxes, progress bar.
packages/ui + tokens.css. Pass: typecheck, lint, unit, e2e-mock. Summarize; update sessions/.
```

## Acceptance
- [ ] Quantities scale with days; Diabetic adds its items.
- [ ] Ticks persist to DB per pilgrim+profile; progress correct.
