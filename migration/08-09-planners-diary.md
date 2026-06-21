# 08 · Smart & Day Planner   ·   09 · Personal Diary

**Prototypes:** `AUJ Smart Planner.dc.html`, `AUJ Day Planner.dc.html`, `AUJ Personal Diary.dc.html`
**Target:** `apps/web/app/plan/` (planners) + `apps/web/app/companion/diary/` + `apps/web/src/ritual/`
**Wave:** B

## What they are
- **Smart Planner:** 7-step trip planner.
- **Day Planner:** jamaat-anchored daily schedule (Makkah/Madinah), ±15-min time adjust, **hourly temperature** strip.
- **Personal Diary:** Quran target + nafl/sunnah counters + dua checklist + daily reflection, saved per device.

## Port map
- Schedule + temperature tables, `scenFactor`/shift math → `src/ritual/planner.ts` (pure, tested).
- Diary counters/duas/note → DB per pilgrim; localStorage (`auj-diary`, planner state) as offline cache.
- Prayer/jamaat times: stub now; later a prayer-times service (note assumption in `docs/assumptions.md`).

## DB integration (see 00b-db-conventions.md)
- `day_plans (id, pilgrim_id, city, shift_min, updated_at)`.
- `diary_entries (id, pilgrim_id, date, quran_target, quran_done, nafl JSONB, duas JSONB, note, updated_at)`
  via `DiaryRepository` (+ `listByPilgrim`).
- Server Actions: `setShift`, `setDiaryField` → upsert; `activity_logs` not required (non-financial).

## Command
```
Implement Smart Planner (app/plan), Day Planner (app/plan/day), Personal Diary (app/companion/diary)
from their .dc.html references.
src/ritual/planner.ts: jamaat schedule per city + hourly temperature + ±15min shift (pure, tests).
DB: day_plans + diary_entries (SCHEMA_SQL, adapters, repo tests) keyed by pilgrim_id; keep
  localStorage auj-diary as offline cache. Prayer times stubbed — note in docs/assumptions.md.
UI: stepper/timeline, city toggle, time-adjust, temperature chips; diary counters + dua checklist +
  reflection textarea. packages/ui + tokens.css, RTL ok. Pass: typecheck, lint, unit, e2e-mock.
Summarize; update sessions/.
```

## Acceptance
- [ ] Day planner shifts all slots; temperature per hour; city toggle works.
- [ ] Diary fields persist per pilgrim to DB; offline cache reconciles.
