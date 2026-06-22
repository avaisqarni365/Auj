---
name: AUJ Pilgrim Tools
description: "The pilgrim self-service planning tools — Day Planner, Packing Organizer, Personal Diary and Financial Planner (budget estimator)."
---

# AUJ Pilgrim Tools

## What it is
Four free pilgrim-facing planning tools: a jamaat-anchored **Day Planner**, a profile/stay-length
**Packing Organizer**, a private **Personal Diary**, and a per-pilgrim **Financial Planner** budget
estimator. Mobile-first; the persisted ones save per signed-in pilgrim (no localStorage).

## Source prototypes (in this folder)
`AUJ Day Planner.dc.html` · `AUJ Packing Organizer.dc.html` · `AUJ Personal Diary.dc.html` ·
`AUJ Financial Planner.dc.html`

## Where the logic lives
- **Day Planner** → route `/plan/day` · `apps/web/src/ritual/DayPlanner.tsx` + schedule data `ritual/planner.ts` · store `ritual/day-plan-store.ts` (`day_plans`, Postgres+in-memory) + `day-plan-actions.ts` (city + ±15-min shift persist per pilgrim)
- **Packing Organizer** → route `/companion/packing` · `apps/web/src/companion/PackingOrganizer.tsx` + `packing.ts` (build by profile/days) · store `companion/packing-store.ts` (`packing_lists`) + `packing-actions.ts`
- **Personal Diary** → route `/companion/diary` · `apps/web/src/ritual/DiaryJournal.tsx` · store `ritual/diary-store.ts` (`diary_entries`, one row per pilgrim+date) + `saveDiaryAction`
- **Financial Planner** → route `/plan/budget` · `apps/web/src/budget/FinancialPlanner.tsx` (client estimator; amounts in EUR minor units via `src/currency.ts` `displayFromEur`)

## Design
Cinematic `ScreenFrame`; `@auj/ui` tokens; mono numerals for counters/totals; steppers/toggles/chips;
design-taste motion ≤300ms, focus rings, 44px targets; RTL-safe.

## Data & backend
Day Planner / Packing / Diary persist per-pilgrim in their Postgres stores (in-memory fallback) —
they replace the prototypes' localStorage. Financial Planner is a client estimator (matches the
prototype) and is reachable from the Smart Planner; persistence optional.

## Acceptance criteria
- [ ] All four routes render with the prototype content + interactions.
- [ ] Day Planner / Packing / Diary persist for signed-in pilgrims (DB, no localStorage); anonymous can use, sign-in to save.
- [ ] Financial Planner toggles 10/15 days and shows EUR + indicative PKR totals.

## Status
Live and matching the prototypes (DB-backed upgrades over the static prototypes).
