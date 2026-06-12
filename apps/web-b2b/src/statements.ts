import type { Money } from '@auj/contracts';
import type { JournalEntry } from '@auj/payments';
import type { Statement, StatementRow } from './domain';

/** Build a per-account statement from the double-entry ledger. Reconciles by construction. */
export function buildStatement(
  entries: JournalEntry[],
  account: string,
  currency: Money['currency'],
): Statement {
  let balance = 0;
  let debits = 0;
  let credits = 0;
  const rows: StatementRow[] = [];

  for (const entry of entries) {
    for (const posting of entry.postings) {
      if (posting.account !== account || posting.currency !== currency) continue;
      const debit = posting.direction === 'DEBIT' ? posting.amount : 0;
      const credit = posting.direction === 'CREDIT' ? posting.amount : 0;
      balance += credit - debit;
      debits += debit;
      credits += credit;
      rows.push({ date: entry.createdAt, ref: entry.ref, description: entry.memo ?? '', debit, credit, balance });
    }
  }

  return { account, currency, opening: 0, debits, credits, closing: balance, rows };
}

const csvField = (value: string): string => `"${value.replace(/"/g, '""')}"`;

/** Statement as CSV (date, ref, description, debit, credit, balance) + a closing row. */
export function statementToCSV(statement: Statement): string {
  const header = 'date,ref,description,debit,credit,balance';
  const lines = statement.rows.map((r) =>
    [csvField(r.date), csvField(r.ref), csvField(r.description), r.debit, r.credit, r.balance].join(','),
  );
  const footer = ['', '', csvField('CLOSING BALANCE'), statement.debits, statement.credits, statement.closing].join(',');
  return [header, ...lines, footer].join('\n');
}
