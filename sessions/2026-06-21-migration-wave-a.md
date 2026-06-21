# 2026-06-21 — Screen migration, Wave A (01–03)

Driving `migration/*.md` in order, one screen per commit, gated + auto-deployed.

## Rules in force (this migration)
- **No localStorage — always DB.** Persistence = server actions → Postgres (in-memory fallback).
  Client components import a pg-free `*-types.ts`; the pg store stays server-only.
- **Wizards/forms fully interactive with DB.**
- **Pilgrim guide: browse open, sign-in to save** (progress/du'as/recordings → DB per user).
  Retrofit of the existing on-device guide storage is scheduled for **04–05 (Pilgrim Profile/Dashboard)**.

## Done & deployed
- **01 Visa Router** (`ccc939d`) — `/admin/visa` QA page over the existing pure `@auj/visa-router`
  (16 branch tests). Inputs → e-Visa/Agent pill + decision trace. No connector.
- **02 Finance Self-Assessment** (`2bab4f4`) — `/admin/finance`. `calc.buildAssessment` (decimals,
  B2B-only commission, profit==markup) + tests. **DB deal book** `umrah_finance_deals` via
  `deals-store.ts`/`deals-actions.ts` (NOT localStorage). B2C/B2B, cost lines, dials, in/out/profit,
  per-pilgrim, waterfall, EUR/PKR.
- **03 Predictive Cost Analysis** (`4a70aca`) — `/admin/finance/predict`. `predict.forecast()` scales
  flights+hotels by season (×1/1.28/1.55), reuses `buildAssessment` for sell/profit; 4 tests. Pax
  40/80/120 + clamp 1–500, live breakdown bar. **Save as deal → DB** (reuses #02). Links to /admin/finance.

- **07 Packing Organizer** (`bf3ae5d`) — `/companion/packing`. Pure `companion/packing.ts`
  `build(profile, days)` — quantities scale with stay (11/21/30), profile gates items, **Diabetic**
  adds glucose meter/insulin/strips/tabs (3 tests). **DB** `packing_lists (pilgrim_id, profile, days,
  checked jsonb)` via `packing-store.ts`/`packing-actions.ts` — browse open, **sign-in to save**,
  debounced upsert per (pilgrim, profile). UI: profile tabs, 11/21/30 toggle, grouped checkboxes,
  progress bar; linked from `/companion`.

- **08 Day Planner** (`ba78f2b`) — `/plan/day`. (Smart Planner #08-pt1 already shipped at `/plan`
  via `leads/SmartVisitWizard`.) Pure `ritual/planner.ts` `dayPlan(city, shiftMin)`: jamaat-anchored
  14-slot schedule per city, hourly temperature (Makkah; Madinah −2°C), ±15-min whole-day shift,
  `clampShift` (5 tests). **DB** `day_plans (pilgrim_id PK, city, shift_min)` via store/actions —
  browse open, **sign-in to save** city+shift. UI: city toggle, ∓ time-adjust, temp band, timeline.
  Assumption A8 logged (times are a static approximation).
- **09 Personal Diary** (`ba78f2b`) — `/companion/diary`. Pure `ritual/diary.ts` (NAFL/DUAS consts +
  `naflTotal`/`duaDone`/`quranPct`, 2 tests). **DB** `diary_entries (pilgrim_id, date, quran_target,
  quran_done, nafl jsonb, duas jsonb, note)` keyed per pilgrim+day (KSA date) — **DB not localStorage**,
  sign-in to save, server clamps bounds. UI: Quran target/done + nafl counters + dua chips +
  reflection textarea, debounced save. Both linked from `/companion`.

## Next
- Wave B: 05 Dashboard (passport OCR + Me/Family/Group switcher — needs object store) ·
  10 companion guides · 11 tour/wizards. Then Wave C
  (12 B2B · 13 admin connectors · 14 compliance · 15 landing last).
- Pending (non-blocking): voice recordings on-device vs object store; passport OCR (needs object store).

Gate per screen: typecheck · lint · unit · build green → commit → pipeline deploys.
