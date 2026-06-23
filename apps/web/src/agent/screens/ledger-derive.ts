// Pure money derivations for the agent Payments & Ledger view — no React, so they unit-test
// cleanly. Amounts are integer minor units; EUR is the currency of record.
import type { JournalEntry } from '@auj/payments';

export type LedgerRow = { label: string; ref: string; kind: 'top-up' | 'capture' | 'refund'; amount: number; refund: boolean };
export type TxFilter = 'all' | 'payments' | 'refunds';

/** Wallet credit consumed: a negative balance means credit is in use. */
export const usedOf = (balanceMinor: number): number => (balanceMinor < 0 ? -balanceMinor : 0);

/** Available-to-book = credit limit − credit used (never the raw balance). */
export const availableToBook = (balanceMinor: number, creditLimitMinor: number): number =>
  creditLimitMinor - usedOf(balanceMinor);

/** Double-entry health: a balanced ledger has Σ debit = Σ credit across every posting. */
export function ledgerHealth(entries: JournalEntry[]): { debitSum: number; creditSum: number; balanced: boolean } {
  let debitSum = 0;
  let creditSum = 0;
  for (const e of entries) {
    for (const p of e.postings) {
      if (p.direction === 'DEBIT') debitSum += p.amount;
      else creditSum += p.amount;
    }
  }
  return { debitSum, creditSum, balanced: debitSum === creditSum };
}

const isRefund = (entry: JournalEntry): boolean => /refund|ref-/i.test(`${entry.memo ?? ''} ${entry.ref}`);

/** One display row per entry that touches this wallet account. CREDIT = funds in (top-up/settle,
 *  positive), DEBIT = funds out (capture, negative); refunds are classified from memo/ref. */
export function walletRows(entries: JournalEntry[], account: string): LedgerRow[] {
  const out: LedgerRow[] = [];
  for (const e of entries) {
    const p = e.postings.find((x) => x.account === account);
    if (!p) continue;
    const refund = isRefund(e);
    const amount = p.direction === 'CREDIT' ? p.amount : -p.amount;
    out.push({ label: e.memo || e.ref, ref: e.ref, kind: refund ? 'refund' : p.direction === 'CREDIT' ? 'top-up' : 'capture', amount, refund });
  }
  return out;
}

/** All / Payments (non-refunds) / Refunds. */
export const filterRows = (rows: LedgerRow[], filter: TxFilter): LedgerRow[] =>
  rows.filter((r) => filter === 'all' || (filter === 'refunds' ? r.refund : !r.refund));
