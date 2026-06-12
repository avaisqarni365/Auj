import type { Currency } from '@auj/contracts';
import { uuidv7 } from './ids';

export type Direction = 'DEBIT' | 'CREDIT';

/** One line of a journal entry. Amounts are positive integer minor units. */
export interface Posting {
  account: string;
  direction: Direction;
  amount: number;
  currency: Currency;
}

export interface JournalEntry {
  id: string;
  ref: string;
  memo?: string;
  postings: Posting[];
  createdAt: string;
}

export class UnbalancedEntryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnbalancedEntryError';
  }
}

/** Every entry must balance per currency (sum of debits == sum of credits) and never mix is collapsed. */
export function assertBalanced(postings: Posting[]): void {
  if (postings.length < 2) {
    throw new UnbalancedEntryError('A journal entry needs at least two postings');
  }
  const byCurrency = new Map<Currency, { debit: number; credit: number }>();
  for (const p of postings) {
    if (!Number.isInteger(p.amount) || p.amount <= 0) {
      throw new UnbalancedEntryError('Posting amounts must be positive integer minor units');
    }
    const acc = byCurrency.get(p.currency) ?? { debit: 0, credit: 0 };
    if (p.direction === 'DEBIT') acc.debit += p.amount;
    else acc.credit += p.amount;
    byCurrency.set(p.currency, acc);
  }
  for (const [currency, { debit, credit }] of byCurrency) {
    if (debit !== credit) {
      throw new UnbalancedEntryError(`Unbalanced ${currency}: debit ${debit} != credit ${credit}`);
    }
  }
}

/**
 * Append-only double-entry ledger — the source of truth for money movement.
 * Account balance is credits minus debits; because every entry balances, the
 * whole ledger nets to zero per currency.
 */
export class Ledger {
  private readonly entries: JournalEntry[] = [];

  post(input: { ref: string; memo?: string; postings: Posting[]; createdAt?: string }): JournalEntry {
    assertBalanced(input.postings);
    const entry: JournalEntry = {
      id: uuidv7(),
      ref: input.ref,
      memo: input.memo,
      postings: input.postings,
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    this.entries.push(entry);
    return entry;
  }

  balance(account: string, currency: Currency): number {
    let balance = 0;
    for (const entry of this.entries) {
      for (const p of entry.postings) {
        if (p.account === account && p.currency === currency) {
          balance += p.direction === 'CREDIT' ? p.amount : -p.amount;
        }
      }
    }
    return balance;
  }

  /** Invariant check: across all entries, debits == credits per currency. */
  isBalanced(): boolean {
    const totals = new Map<Currency, number>();
    for (const entry of this.entries) {
      for (const p of entry.postings) {
        totals.set(p.currency, (totals.get(p.currency) ?? 0) + (p.direction === 'CREDIT' ? p.amount : -p.amount));
      }
    }
    return [...totals.values()].every((v) => v === 0);
  }

  all(): JournalEntry[] {
    return [...this.entries];
  }
}
