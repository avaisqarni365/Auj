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

- **10 Companion guides** (`dc6507c`) — `/guide/<slug>` for food, transport, connectivity, gifts,
  laundry, hospitals, helpline. ONE shared `<GuideWizard>` (city tabs + category rail + item list +
  prev/next dots). Content transcribed from the 7 prototypes into `companion/guide-data.ts`
  (`GUIDES`, ~290 items, both cities, marks/tags/notes preserved). **DB** `guide_entries (guide, city,
  category, name, note, tag, mark, sort, locale)` via `guide-store.ts` — seeds from the seed on first
  init, `getGuide(slug)` regroups DB rows under the seed's category meta; editable later via Admin CMS.
  `GuideScreen` server loader; all 7 linked from `/companion`. Seed-integrity test (2). Public.
  Deferred: hotels-via-`SaudiConnector.searchHotels` (hotels already searchable in the booking funnel)
  and the prototype's Jeddah gifts block (type is makkah/madinah only) — note for a later pass.

- **11 Step-video wizards** (`PENDING`) — `/guide/{airport,luggage,makkah-ziyarat,madina-ziyarat}`.
  (Virtual Tour already live at `/guide/tour`.) ONE shared `<StepVideoWizard>` (step rail + media
  panel + localized RTL title/body + string-or-customs-rule items + tip + per-step video link +
  language switcher + prev/next). `parse-embed.ts` YouTube/Vimeo/MP4 → embeddable (4 tests). Content
  transcribed into `ritual/wizard-steps.ts` (45 steps: airport 7, luggage 8, Makkah 16, Madinah 14;
  EN/UR/AR/DE airport+luggage, EN/AR ziyarat; luggage items = ok/permit/prohibited customs rules).
  **DB** `ritual_steps (wizard, idx, short, label, text jsonb, items jsonb, tip, video_url, sort)` via
  `wizard-store.ts` (seeds from seed, editable via CMS) + `pilgrim_step_videos (pilgrim_id, wizard,
  step_idx, url)` via `step-video-store.ts`/`-actions.ts` — **sign-in to save** per-step clips, URL
  validated by parseEmbed. `WizardScreen` loader; all linked from `/companion`. Seed test (2).
  Assumption A9 logged (content + translations + customs rules pending review). Deferred: object-store
  video upload (URL-only for now) + LT/TR locale text.

## Next
- Wave B: 05 Dashboard (passport OCR + Me/Family/Group switcher — needs object store).
  Then Wave C (12 B2B · 13 admin connectors · 14 compliance · 15 landing last).
- Pending (non-blocking): voice recordings on-device vs object store; passport OCR (needs object store);
  hotels-via-connector in guides; Jeddah gifts data + guide localisation (LT/UR/AR via `locale`).

Gate per screen: typecheck · lint · unit · build green → commit → pipeline deploys.
