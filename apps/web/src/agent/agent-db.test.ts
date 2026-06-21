import { describe, it, expect } from 'vitest';
import { getAgentDb, toJournalEntries, SEED_TOPUP_MINOR } from './agent-db';
import { buildStatement } from './statements';

// No DATABASE_URL in tests → in-memory implementation.
describe('agent DB (in-memory)', () => {
  it('seeds an opening float and tracks balance via double-entry legs', async () => {
    const db = await getAgentDb();
    await db.loadOrCreateAgency('user-a', 'Alpha Travel', 'a@x.com', 'GOLD');
    let w = await db.wallet('user-a');
    expect(w.balanceMinor).toBe(SEED_TOPUP_MINOR);

    await db.append('user-a', { ref: 'BK1', kind: 'BOOKING', memo: '10 pax', debitMinor: 1_000_000, creditMinor: 0 });
    w = await db.wallet('user-a');
    expect(w.balanceMinor).toBe(SEED_TOPUP_MINOR - 1_000_000);
  });

  it('reconstructed journal entries balance and reconcile the statement', async () => {
    const db = await getAgentDb();
    await db.loadOrCreateAgency('user-b', 'Beta', 'b@x.com', 'SILVER');
    await db.append('user-b', { ref: 'BK1', kind: 'BOOKING', memo: 'grp', debitMinor: 500_000, creditMinor: 0 });
    const legs = await db.ledger('user-b');
    const entries = toJournalEntries('user-b', legs, 'EUR');
    // every entry is balanced (sum debit === sum credit)
    for (const e of entries) {
      const d = e.postings.filter((p) => p.direction === 'DEBIT').reduce((s, p) => s + p.amount, 0);
      const c = e.postings.filter((p) => p.direction === 'CREDIT').reduce((s, p) => s + p.amount, 0);
      expect(d).toBe(c);
    }
    const stmt = buildStatement(entries, 'wallet:user-b', 'EUR');
    expect(stmt.closing).toBe(SEED_TOPUP_MINOR - 500_000);
  });

  it('isolates quotes by agency', async () => {
    const db = await getAgentDb();
    await db.loadOrCreateAgency('user-c', 'Gamma', 'c@x.com', 'GOLD');
    await db.loadOrCreateAgency('user-d', 'Delta', 'd@x.com', 'GOLD');
    const q = await db.saveQuote('user-c', { lines: [{ label: 'Hotel', net: { amount: 200_000, currency: 'EUR' } }], netMinor: 200_000, markupMinor: 20_000, sellMinor: 220_000, currency: 'EUR' });

    expect(await db.listQuotes('user-c')).toHaveLength(1);
    expect(await db.listQuotes('user-d')).toHaveLength(0);
    // shareable lookup works across agencies by ref
    expect((await db.findByRef(q.ref))?.id).toBe(q.id);
  });

  it('persists, updates and removes markup rules, scoped by agency', async () => {
    const db = await getAgentDb();
    await db.saveMarkup('ag-1', { id: 'm1', tier: 'GOLD', kind: 'PERCENT', value: 12, enabled: true });
    await db.saveMarkup('ag-1', { id: 'm2', kind: 'FIXED', value: 5000, enabled: true });
    expect(await db.listMarkups('ag-1')).toHaveLength(2);
    expect(await db.listMarkups('ag-2')).toHaveLength(0); // isolation

    await db.saveMarkup('ag-1', { id: 'm1', tier: 'GOLD', kind: 'PERCENT', value: 12, enabled: false }); // upsert, not duplicate
    const after = await db.listMarkups('ag-1');
    expect(after).toHaveLength(2);
    expect(after.find((r) => r.id === 'm1')?.enabled).toBe(false);

    await db.deleteMarkup('ag-1', 'm2');
    expect(await db.listMarkups('ag-1')).toHaveLength(1);
  });
});
