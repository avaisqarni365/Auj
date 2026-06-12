---
name: b2b-agent-portal
description: "Use this skill to build the B2B agent portal where sub-agents register, book on behalf of pilgrims, use a wallet, and earn configurable markups. Consumes booking + payments (wallet) APIs. Build in parallel wave B."
---

# B2B agent portal

## Scope
In `apps/web-b2b`: the agent-facing portal. Sub-agent onboarding, multi-pax bookings, wallet,
markups, quotations, statements. Talks only to booking + payments APIs.

## Depends on
`booking-crm-documents` API, `payments-wallet` API (wallet + ledger).

## Build steps
1. Agent registration + approval workflow; agent hierarchy (agent → sub-agent).
2. Markup engine UI: configurable markup per tier and per product; preview net vs sell price.
3. Multi-passenger booking in one transaction (target ≥49 pax) reusing the booking API.
4. Wallet view: balance, credit limit, top-ups, holds; block bookings over limit.
5. Quotation builder: assemble a package, generate a shareable quote, convert to booking.
6. Per-agent reports: sales, ledgers, statements (CSV/Excel export).

## Acceptance criteria
- Sub-agent can register, get approved, book ≥49 pax in one go, pay from wallet, share a quote.
- Markups apply correctly per tier; statements export and reconcile with the ledger.

## Out of scope
Public B2C UX, connector logic, payment-gateway internals.
