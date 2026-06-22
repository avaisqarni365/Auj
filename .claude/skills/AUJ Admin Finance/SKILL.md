---
name: AUJ Admin Finance
description: "The admin money tools — deal-by-deal Finance Self-Assessment and the step-by-step Predictive Cost Analysis, both writing to one DB-backed deal book. Money in integer cents."
---

# AUJ Admin Finance

## What it is
Two ADMIN-only profit tools: **Finance Self-Assessment** (per-deal money-in / money-out / profit with
a per-pilgrim waterfall) and **Predictive Cost Analysis** (a 6-step group-cost forecaster with season
scenarios → suggested sell price + projected profit). Both persist to one deal book. Estimates only.

## Source prototypes (in this folder)
`AUJ Finance Self Assessment.dc.html` · `AUJ Predictive Analysis.dc.html`

## Where the logic lives
- **Finance Self-Assessment** → route `/admin/finance` (ADMIN) · `apps/web/src/finance/FinanceSelfAssessment.tsx` · math `finance/calc.ts`
- **Predictive Cost Analysis** → route `/admin/finance/predict` (ADMIN) · `apps/web/src/finance/PredictiveAnalysis.tsx` (6-step rail: Flights→Hotels→Transport→Visa→Ziyarat&food→Forecast) · math `finance/predict.ts`
- **Shared deal book** → `apps/web/src/finance/deals-store.ts` (`umrah_finance_deals`, Postgres + in-memory) + `deals-actions.ts` (`saveDealAction`); Predictive hands off into the planner via `saveDealAction`
- Linked from the admin nav (💷 Finance · 📊 Assess)

## Design
Cinematic `ScreenFrame`; `@auj/ui` tokens; numeric inputs/dials, live forecast ledger + per-pilgrim
waterfall, mono numerals for money; design-taste motion ≤300ms, focus rings, 44px targets.

## Data & backend
**Money is stored in integer cents.** Deals persist to `umrah_finance_deals` (no localStorage).
Self-assessment/forecast are estimates — lock real supplier quotes before selling. ADMIN role-gated.

## Acceptance criteria
- [ ] `/admin/finance` computes sell/profit/margin per deal + waterfall; save/load/delete deals.
- [ ] `/admin/finance/predict` walks the 6-step rail, shows running forecast + per-pilgrim cost, saves as a deal.
- [ ] ADMIN-gated; integer cents; ScreenFrame + tokens.

## Status
Live and matching the prototypes (Predictive restored to the prototype's stepped-wizard UX).
