# 03 · Predictive Cost Analysis

**Prototype:** `AUJ Predictive Analysis.dc.html`
**Target:** `apps/web/app/admin/finance/predict/page.tsx` + `apps/web/src/finance/predict.ts`
**Wave:** A (after 02 — reuses finance calc + currency)

## What it is
Step-by-step group forecast. Custom pax (presets 40/80/120 + a −/＋ number input, 1–500) and a season
scenario (Off-peak ×1.0 / Peak ×1.28 / Ramadan ×1.55) that scales hotel & flight rates. 6 steps —
Flights → Hotels (night×nights÷occupancy) → Transport → Visa → Ziyarat & food → Forecast & margin —
with a live running total, colour breakdown bar, and suggested sell + projected profit.

## Port map
- Per-step cost math + `scenFactor()` → `src/finance/predict.ts` (`forecast(inputs, pax, scen)`), unit tested.
- Reuse `src/finance/calc.ts` for the markup→sell→profit tail (don't duplicate).
- UI → stepper (packages/ui `Stepper`), running-forecast panel, breakdown bar. Pax stepper clamps 1–500.

## Command
```
Implement Predictive Cost Analysis from "AUJ Predictive Analysis.dc.html".
src/finance/predict.ts: forecast({flightEach,hotelNight,nights,roomShare,transport,visaEach,
  ziyaratEach,foodDay}, pax, scen) with scenFactor {normal:1, peak:1.28, ramadan:1.55}; returns
  per-line group + per-pax costs and grand total. Reuse calc.ts for markup/sell/profit. Unit tests.
UI: app/admin/finance/predict/page.tsx — pax presets 40/80/120 + numeric −/＋ (clamp 1–500), scenario
  toggle, 6-step Stepper, running forecast panel + breakdown bar, suggested sell/profit. packages/ui + tokens.css.
Money via src/currency.ts. Link "Open deal finance planner" → /admin/finance.
Pass: typecheck, lint, unit, e2e-mock. Summarize changed files; update sessions/.
```

## DB integration (see 00b-db-conventions.md)
A forecast is a **saveable scenario** that can convert to a `finance_deal`:
- Table `forecast_scenarios (id, name, pax, scenario, inputs JSONB, grand_minor, sell_minor, profit_minor, currency, created_at)`
  via `ForecastRepository extends Repository<Forecast>`.
- Server Action `saveForecast` (Zod-validate, recompute server-side via `predict.ts`+`calc.ts`, `activity_logs`).
- "Convert to deal" → insert a `finance_deals` row from the scenario (reuse spec 02 action).

## Acceptance
- [ ] Any pax 1–500 recalculates every step + total live.
- [ ] Forecast persists; recomputed server-side; convertible to a finance_deal.
- [ ] Scenario scales hotels & flights; breakdown sums to grand total + buffer.
- [ ] Suggested sell/profit reuse finance calc (no duplicated formula).
