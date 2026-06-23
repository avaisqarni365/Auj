import { describe, it, expect } from 'vitest';
import type { JournalEntry } from '@auj/payments';
import { availableToBook, filterRows, ledgerHealth, usedOf, walletRows } from './ledger-derive';

const ACCT = 'wallet:a1';
const eur = (amount: number, direction: 'DEBIT' | 'CREDIT', account = ACCT) => ({ account, direction, amount, currency: 'EUR' as const });
const entry = (ref: string, memo: string, postings: ReturnType<typeof eur>[]): JournalEntry => ({ id: ref, ref, memo, createdAt: 't', postings });

describe('agent ledger derivations', () => {
  it('usedOf / availableToBook: negative balance = credit consumed', () => {
    expect(usedOf(50_000)).toBe(0); // positive balance → none used
    expect(usedOf(-20_000)).toBe(20_000);
    expect(availableToBook(-20_000, 600_000)).toBe(580_000); // credit − used
    expect(availableToBook(0, 600_000)).toBe(600_000);
  });

  it('ledgerHealth: balanced only when Σdebit === Σcredit', () => {
    const balanced = [entry('e1', 'capture', [eur(1000, 'DEBIT'), eur(1000, 'CREDIT', 'rev')])];
    expect(ledgerHealth(balanced)).toEqual({ debitSum: 1000, creditSum: 1000, balanced: true });
    const skewed = [entry('e2', 'x', [eur(1000, 'DEBIT'), eur(800, 'CREDIT', 'rev')])];
    expect(ledgerHealth(skewed).balanced).toBe(false);
    expect(ledgerHealth([])).toEqual({ debitSum: 0, creditSum: 0, balanced: true });
  });

  it('walletRows: CREDIT positive (top-up), DEBIT negative (capture); only this account', () => {
    const entries = [
      entry('TOP-1', 'Wallet top-up · SEPA', [eur(500_000, 'CREDIT'), eur(500_000, 'DEBIT', 'bank')]),
      entry('BK-1', '10 pax · Hotel', [eur(200_000, 'DEBIT'), eur(200_000, 'CREDIT', 'rev')]),
      entry('OTHER', 'not ours', [eur(999, 'DEBIT', 'wallet:other')]),
    ];
    const rows = walletRows(entries, ACCT);
    expect(rows).toHaveLength(2); // the foreign-account entry is skipped
    expect(rows[0]).toMatchObject({ ref: 'TOP-1', kind: 'top-up', amount: 500_000, refund: false });
    expect(rows[1]).toMatchObject({ ref: 'BK-1', kind: 'capture', amount: -200_000, refund: false });
  });

  it('walletRows: refund classified from memo/ref', () => {
    const rows = walletRows([entry('REF-9', 'Refund for BK-1', [eur(200_000, 'CREDIT')])], ACCT);
    expect(rows[0]).toMatchObject({ kind: 'refund', refund: true, amount: 200_000 });
  });

  it('filterRows: all / payments (non-refund) / refunds', () => {
    const rows = walletRows(
      [
        entry('BK-1', 'capture', [eur(100, 'DEBIT')]),
        entry('REF-1', 'refund', [eur(100, 'CREDIT')]),
      ],
      ACCT,
    );
    expect(filterRows(rows, 'all')).toHaveLength(2);
    expect(filterRows(rows, 'payments').every((r) => !r.refund)).toBe(true);
    expect(filterRows(rows, 'refunds').every((r) => r.refund)).toBe(true);
  });
});
