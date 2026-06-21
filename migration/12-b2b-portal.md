# 12 · B2B Agent Portal

**Prototype:** `AUJ B2B Portal.dc.html`
**Target:** `apps/web/app/agent/` + `apps/web/src/agent/` (consumes `core-booking`, `payments` wallet)
**Wave:** B

## What it is
Agent-facing portal: sub-agent onboarding, multi-pax bookings (≥49), wallet (balance/credit/holds),
configurable markups per tier/product, quotation builder, per-agent statements/reports.

## Port map
- Markup engine → reuse finance `calc.ts`; net-vs-sell preview per tier.
- Wallet → `payments` package (ledger + holds); block bookings over credit limit.
- Multi-pax booking → `core-booking` book in one transaction.
- Quotes → assemble package, shareable quote, convert→booking.

## DB integration (see 00b-db-conventions.md)
- `agencies (id, name, tier, parent_agency_id, status, created_at)`
  `agents (id, agency_id, name, email, role, status)`
  `markups (id, agency_id, tier, product, fixed_minor, pct)` 
  `quotes (id, agency_id, agent_id, ref, items JSONB, totals JSONB, status, currency, created_at)`
  `wallets (agency_id PK, balance_minor, credit_limit_minor, currency)`
  `wallet_ledger (id, agency_id, ts, debit_minor, credit_minor, ref, kind)` — **double-entry, sum(debit)=sum(credit)**.
- Repos: `AgencyRepository`, `AgentRepository`, `MarkupRepository`, `QuoteRepository`, `WalletRepository`.
- **Scope every query by `agency_id`/`agent_id`** — an agent never sees another agent's customers.
- Statements export (CSV) reconciles with `wallet_ledger`.

## Command
```
Implement the B2B Agent Portal from "AUJ B2B Portal.dc.html" at app/agent.
DB: agencies, agents, markups, quotes, wallets, wallet_ledger (double-entry; SCHEMA_SQL, adapters,
  repo tests). Every read scoped by agency_id/agent_id.
Features: sub-agent onboarding+approval; markup engine (reuse finance calc.ts; net-vs-sell per tier);
  multi-pax booking ≥49 in one transaction via core-booking; wallet (balance/credit/holds, block over
  limit) via payments; quote builder → shareable → convert to booking; CSV statements reconciling ledger.
Money minor units, EUR charged/PKR indicative. packages/ui + tokens.css.
Pass: typecheck, lint, unit, contract-tests, e2e-mock. Summarize; update sessions/.
```

## Acceptance
- [ ] Sub-agent registers→approved→books ≥49 pax→pays from wallet→shares quote.
- [ ] Markups per tier correct; ledger balances; statements reconcile; agent isolation enforced.
