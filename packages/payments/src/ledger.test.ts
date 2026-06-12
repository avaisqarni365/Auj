import { describe, it, expect } from 'vitest';
import { Ledger, assertBalanced, UnbalancedEntryError } from './ledger';

describe('double-entry ledger', () => {
  it('posts a balanced entry and computes account balances', () => {
    const ledger = new Ledger();
    ledger.post({
      ref: 'b1',
      postings: [
        { account: 'gateway:EUR', direction: 'DEBIT', amount: 10000, currency: 'EUR' },
        { account: 'revenue:bookings', direction: 'CREDIT', amount: 10000, currency: 'EUR' },
      ],
    });
    expect(ledger.balance('revenue:bookings', 'EUR')).toBe(10000);
    expect(ledger.balance('gateway:EUR', 'EUR')).toBe(-10000);
    expect(ledger.isBalanced()).toBe(true);
  });

  it('rejects unbalanced entries', () => {
    expect(() =>
      assertBalanced([
        { account: 'a', direction: 'DEBIT', amount: 100, currency: 'EUR' },
        { account: 'b', direction: 'CREDIT', amount: 90, currency: 'EUR' },
      ]),
    ).toThrow(UnbalancedEntryError);
  });

  it('rejects non-integer or non-positive amounts', () => {
    expect(() =>
      assertBalanced([
        { account: 'a', direction: 'DEBIT', amount: 10.5, currency: 'EUR' },
        { account: 'b', direction: 'CREDIT', amount: 10.5, currency: 'EUR' },
      ]),
    ).toThrow(UnbalancedEntryError);
  });

  it('balances each currency independently within an entry', () => {
    const ledger = new Ledger();
    ledger.post({
      ref: 'mix',
      postings: [
        { account: 'gateway:EUR', direction: 'DEBIT', amount: 100, currency: 'EUR' },
        { account: 'revenue:bookings', direction: 'CREDIT', amount: 100, currency: 'EUR' },
        { account: 'gateway:PKR', direction: 'DEBIT', amount: 200, currency: 'PKR' },
        { account: 'revenue:bookings', direction: 'CREDIT', amount: 200, currency: 'PKR' },
      ],
    });
    expect(ledger.isBalanced()).toBe(true);
    expect(ledger.balance('revenue:bookings', 'PKR')).toBe(200);
  });
});
