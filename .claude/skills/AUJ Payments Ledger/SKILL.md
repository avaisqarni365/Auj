---
name: auj-payments-ledger
description: "Build the AUJ Payments & Ledger view inside the B2B agent portal — the agency-facing surface over @auj/payments. It shows the agent wallet (available-to-book = credit limit − used, plus Balance / Credit / Used), a double-entry ledger-health card (Σ debit must equal Σ credit, reconciled to gateway webhooks), and a filtered recent-transactions list (All / Payments / Refunds) derived from the agency's real journal entries, with an EUR/PKR display toggle. Amounts in integer minor units, one currency per ledger entry; no card numbers stored — gateway tokenization only. Lives in the agent portal at /agent (not an admin screen); booking calls payments on confirm, payments never call connectors."
---

# AUJ Payments & Ledger — agent wallet + double-entry view

## What it is
The agency-facing **Payments & Ledger** screen in the B2B agent portal. It renders the agent's **wallet**
(big "available to book" = credit limit − credit used, plus Balance / Credit / Used tiles, with an
**EUR/PKR** display toggle), a **double-entry ledger-health** card that sums every posting and confirms
**Σ debit = Σ credit** (reconciled to gateway webhooks), and a **recent-transactions** list filterable by
All / Payments / Refunds, derived from the agency's real `JournalEntry[]`. It is a *view* over the
payments domain — capture/refund/top-up logic lives in `@auj/payments`, not here.

## Source prototype
`migration/Files/AUJ Payments Ledger.dc.html` (this folder's `.dc.html`). Green header with gateway
pills (Stripe · EUR, Safepay · PKR), a dark wallet card with EUR/PKR toggle + Balance/Credit/On-hold
tiles, a ledger-health "=" card, and a filtered transactions list with per-row icon/status/amount.

## Route & files
- Surface: the **B2B agent portal** at `/agent` — `apps/web/app/agent/page.tsx`
  (`requireRole(['AGENT','SUB_AGENT','ADMIN'])`; agent must be `agentStatus === 'ACTIVE'`). Rendered as a
  screen inside `apps/web/src/agent/AgentPortal.tsx`.
- Component: `apps/web/src/agent/screens/LedgerView.tsx` (client) — props
  `{ agencyName, balance, creditLimit, entries: JournalEntry[], account }`. Money derivations
  (`availableToBook`, `usedOf`, `ledgerHealth`, `walletRows`, `filterRows`) live in the pure
  `agent/screens/ledger-derive.ts` (+ `ledger-derive.test.ts`).
- Domain/types: `@auj/payments` (`JournalEntry`, postings with `direction`/`account`/`amount`).
- Wiring/data: `apps/web/src/agent/actions.ts`, `agent-db.ts`, `backend/in-process.ts`, `statements.ts`.
- Currency display: `apps/web/src/currency.ts` (`displayFromEur`).

## Design
Cinematic dark wallet card (`green-800→green-950` gradient) + sand body cards via `@auj/ui` tokens —
`gold` accent, `success`, `danger`/`danger-bg`, `warning-fg`, `sand-*`. Mono numerals for every money
value; segmented EUR/PKR + filter pills; status chips (Settled / Captured / Refunded). Empty state when
no transactions. Motion ≤300ms, origin-aware; `prefers-reduced-motion` honoured; 44px targets; AA
contrast. Apply the design-taste checklist.

## Data & backend
- Driven by the agency's **real wallet** (balance, credit limit) and **journal entries** — no mock array.
  Available = `creditLimit − used` where `used = max(0, −balance)`.
- **Money in integer minor units**; **one currency per ledger entry** (EUR is the currency of record;
  PKR is an indicative display conversion only). **No card numbers stored** — gateway tokenization only,
  idempotency keys on capture. **No localStorage.**
- Ledger health sums postings by direction (`DEBIT`/`CREDIT`) → balanced when equal. Per-row amount uses
  the wallet account's posting (CREDIT = funds in, DEBIT = funds out); refunds detected from memo/ref.
- Booking calls payments on `confirm`; **payments never call connectors**.

## Acceptance criteria
- [ ] Lives in `/agent` (role-gated AGENT/SUB_AGENT/ADMIN, active agents only) — NOT an /admin route.
- [ ] Wallet shows available = credit − used + Balance/Credit/Used; EUR/PKR toggle reformats all amounts.
- [ ] Ledger-health card reports balanced/out-of-balance from Σdebit vs Σcredit over real entries.
- [ ] Transactions list filters All/Payments/Refunds; rows show ref, kind, status, signed amount; empty
      state when none.
- [ ] Minor units throughout; no PANs; no localStorage; typecheck/lint/unit green.

## Status
Live: `LedgerView` exists and is wired into `AgentPortal` at `/agent` over `@auj/payments` journal
entries. **Matches** the prototype (wallet, double-entry health, filtered transactions, EUR/PKR toggle).
The money derivations are extracted to a pure module and unit-tested (available=credit−used,
Σdebit=Σcredit health, signed per-row amounts, refund classification, All/Payments/Refunds filter);
the `@auj/payments` domain has its own ledger/wallet/service tests. Note: it is an **agent-portal**
screen, not an admin screen — no role redesign needed.
