# 02 · Finance Self-Assessment

**Prototype:** `AUJ Finance Self Assessment.dc.html`
**Target:** `apps/web/app/admin/finance/page.tsx` + extend `apps/web/src/finance/` (`calc.ts`, `store.ts`, `FinanceCalculator.tsx`)
**Wave:** A

## What it is
Money-in / money-out / profit per deal. B2C/B2B toggle (B2B adds agent commission), editable cost
line items, pricing dials (markup/buffer/fee/commission), a per-pilgrim waterfall bar, and a
**per-deal book** (named deals, IND/GRP tag, save/update/new) saved to localStorage.

## Port map
- The calc chain → extend `src/finance/calc.ts`:
  `base = Σ costs; buffer = base·buf%; markup = (base+buffer)·mk%; fee = (…)·fee%;`
  `commission = b2b ? (…)·comm% : 0; selling = base+buffer+markup+fee+commission;`
  `profit = selling − base − buffer − fee − commission`. Decimals not floats. Unit test (`calc.test.ts` exists).
- Deal book (`deals{}`, `dealId`, `snapshot/saveDeal/newDeal/pickDeal`, localStorage `auj-finance-deals`)
  → `src/finance/store.ts` (Zustand or server actions per existing pattern). Keep the storage key.
- UI → `FinanceCalculator.tsx` sub-components: DealBar, SummaryCards (in/out/profit), Waterfall, CostInputs, PricingDials.
- Money display through `src/currency.ts` (EUR-charged, PKR-indicative).

## Command
```
Extend apps/web/src/finance to add the deal-by-deal Self-Assessment from
"AUJ Finance Self Assessment.dc.html".
calc.ts: add buildAssessment(costs, {bufferPct,feePct,markupPct,commissionPct,channel,pax}) returning
  {base,buffer,markup,fee,commission,selling,profit,margin} — decimals, with unit tests.
store.ts: a deal book (named deals, IND/GRP by pax, save/update/new/pick) persisted under the EXISTING
  key auj-finance-deals.
UI: app/admin/finance/page.tsx + FinanceCalculator sub-components (DealBar, Summary in/out/profit,
  per-pilgrim Waterfall, CostInputs, PricingDials) using packages/ui + tokens.css.
All money via src/currency.ts (EUR charged / PKR indicative). B2B-only commission line behind the channel flag.
Pass: typecheck, lint, unit, e2e-mock. Summarize changed files; update sessions/.
```

## DB integration (see 00b-db-conventions.md)
Replace the `auj-finance-deals` localStorage book with Postgres (keep localStorage as offline cache only):
- Tables:
  `finance_deals (id, ref, name, channel, pax, kind, agency_id, agent_id, created_at, updated_at)`
  `finance_deal_inputs (deal_id PK→deals, costs JSONB, buffer_pct INT, fee_pct INT, markup_pct INT, commission_pct INT)`
  `finance_deal_results (deal_id PK→deals, base_minor, buffer_minor, markup_minor, fee_minor, commission_minor, selling_minor, profit_minor, currency, computed_at)` — **store inputs AND computed outputs** (audit).
- `FinanceDealRepository extends Repository<FinanceDeal>` + `listByAgency(id)` / `listByAgent(id)`.
- Server Action `saveDeal`: Zod-validate → recompute in `calc.ts` (never trust client totals) → save inputs+results → `activity_logs`.
- Money in **minor units**; `currency` column; B2B agent sees only own `agent_id` deals.

## Acceptance
- [ ] `profit = selling − base − buffer − fee − commission` exact; decimals throughout.
- [ ] Deal inputs+results persisted to Postgres; recomputed server-side; agent-scoped; change logged.
- [ ] Deal save/switch works group↔group and person↔person; key preserved.
- [ ] B2B adds commission; B2C hides it. EUR/PKR shown.
