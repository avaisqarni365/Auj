import { describe, it, expect } from 'vitest';
import { getDepositStore } from './deposit-store';

// No DATABASE_URL in tests → in-memory implementation.
describe('deposit store (in-memory)', () => {
  it('creates a pending deposit, finds it by ref, and marks it paid — owner-scoped', async () => {
    const s = await getDepositStore();
    await s.create({ id: 'deposit:u1:1', pilgrimId: 'u1', ref: 'deposit:u1:1', amountMinor: 30_000, currency: 'EUR', intentId: 'pi_1', status: 'pending' });

    expect((await s.byRef('u1', 'deposit:u1:1'))?.status).toBe('pending');
    expect(await s.byRef('u2', 'deposit:u1:1')).toBeUndefined(); // isolation

    await s.markPaid('u1', 'deposit:u1:1');
    expect((await s.byRef('u1', 'deposit:u1:1'))?.status).toBe('paid');
    expect((await s.listByPilgrim('u1')).some((d) => d.status === 'paid')).toBe(true);
  });
});
