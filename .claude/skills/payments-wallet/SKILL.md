---
name: payments-wallet
description: "Use this skill to build payments and the agent wallet/ledger. Supports EUR (EU acquirer, e.g. Stripe) and PKR (Pakistan gateway), multi-currency, refunds, plus a credit/wallet system for B2B agents and a double-entry ledger. Build in parallel wave A."
---

# Payments & wallet

## Scope
In `packages/payments`: take customer payments (cards, EUR + PKR), run an agent wallet with credit
limits, and keep a double-entry ledger. Exposes a stable payment ref that booking uses on `confirm`.

## Depends on
Shared `Money` type from contracts. Booking calls payments; payments never calls connectors.

## Build steps
1. Payment gateway abstraction `PaymentProvider` with at least: `createIntent`, `capture`,
   `refund`, `webhook`. Implement EUR (Stripe) and a PKR gateway adapter.
2. Multi-currency: store amounts in minor units; never mix currencies in one ledger entry.
3. Agent wallet: balance, credit limit, top-ups, holds on booking, settlement; all as ledger entries.
4. Double-entry ledger (debit/credit) as the source of truth; reconcile against gateway webhooks.
5. Refund + partial-refund flows mapped to booking cancellations.
6. PCI: never store PANs; use gateway tokenization. Idempotency keys on capture.

## Acceptance criteria
- EUR and PKR test payments capture + refund against sandboxes.
- Agent wallet enforces credit limits; ledger always balances (sum of debits == credits).

## Out of scope
Booking state, markups display (B2B), connector logic.
