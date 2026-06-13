import { describe, it, expect } from 'vitest';
import { Ledger } from '@auj/payments';
import { buildStatement, statementToCSV } from './statements';

describe('statements', () => {
  it('builds a reconciling statement from the ledger', () => {
    const ledger = new Ledger();
    ledger.post({ ref: 'topup', memo: 'top-up', postings: [
      { account: 'gateway:EUR', direction: 'DEBIT', amount: 100000, currency: 'EUR' },
      { account: 'wallet:a1', direction: 'CREDIT', amount: 100000, currency: 'EUR' },
    ] });
    ledger.post({ ref: 'bk1', memo: 'hold', postings: [
      { account: 'wallet:a1', direction: 'DEBIT', amount: 40000, currency: 'EUR' },
      { account: 'wallet-held:a1', direction: 'CREDIT', amount: 40000, currency: 'EUR' },
    ] });

    const statement = buildStatement(ledger.all(), 'wallet:a1', 'EUR');
    expect(statement.credits).toBe(100000);
    expect(statement.debits).toBe(40000);
    expect(statement.closing).toBe(60000); // credits - debits
    expect(statement.closing).toBe(statement.credits - statement.debits); // reconciles
    expect(statement.rows).toHaveLength(2);
  });

  it('exports CSV with a closing row', () => {
    const ledger = new Ledger();
    ledger.post({ ref: 'r', memo: 'm', postings: [
      { account: 'wallet:a1', direction: 'CREDIT', amount: 5000, currency: 'EUR' },
      { account: 'gateway:EUR', direction: 'DEBIT', amount: 5000, currency: 'EUR' },
    ] });
    const csv = statementToCSV(buildStatement(ledger.all(), 'wallet:a1', 'EUR'));
    expect(csv.split('\n')[0]).toBe('date,ref,description,debit,credit,balance');
    expect(csv).toContain('CLOSING BALANCE');
  });
});
