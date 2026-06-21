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

## Next
- Wave B: 04 Pilgrim Profile · 05 Dashboard (+ retrofit guide storage to DB/user) · 06 Booking +
  hotels · 07 Packing · 08–09 planners/diary · 10 companion guides · 11 tour/wizards. Then Wave C
  (12 B2B · 13 admin connectors · 14 compliance · 15 landing last).

Gate per screen: typecheck · lint · unit · build green → commit → pipeline deploys.
