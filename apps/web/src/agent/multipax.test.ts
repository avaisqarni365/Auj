import { describe, it, expect } from 'vitest';
import { hotelItem } from '@auj/core-booking';
import { MAX_PAX, validatePax, bookGroupFromWallet } from './multipax';
import { createInProcessBackend } from './backend/in-process';
import type { Agent, PaxRow } from './domain';

const row = (n: number): PaxRow => ({
  firstName: `First${n}`, lastName: `Last${n}`, passportNumber: `PK${n}`, nationality: 'PK', dob: '1990-01-01', gender: 'M',
});
const rows = (count: number): PaxRow[] => Array.from({ length: count }, (_, i) => row(i + 1));

describe('validatePax', () => {
  it('accepts up to 49 and rejects more', () => {
    expect(validatePax(rows(49)).ok).toBe(true);
    expect(validatePax(rows(49)).remaining).toBe(0);
    const over = validatePax(rows(50));
    expect(over.ok).toBe(false);
    expect(over.errors[0]).toContain(`Max ${MAX_PAX}`);
  });

  it('flags missing fields and empty groups', () => {
    expect(validatePax([]).ok).toBe(false);
    const bad = validatePax([{ ...row(1), passportNumber: '' }]);
    expect(bad.ok).toBe(false);
  });
});

async function approvedAgent(backend: ReturnType<typeof createInProcessBackend>): Promise<Agent> {
  const agent = await backend.agents.register({ agencyName: 'Big Group Travel', email: 'ops@big.example', tier: 'GOLD' });
  return backend.agents.approve(agent.id);
}

describe('bookGroupFromWallet', () => {
  it('books 49 pax in one go and pays from the wallet', async () => {
    const backend = createInProcessBackend();
    const agent = await approvedAgent(backend);
    backend.wallet.open(agent.id, 'EUR', 0);
    backend.wallet.topUp(agent.id, { amount: 5_000_000, currency: 'EUR' }, 'topup');

    const hotels = await backend.booking.searchHotels({ city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 49 });
    const sell = { amount: 4_900_000, currency: 'EUR' as const };
    const booking = await bookGroupFromWallet(backend, { agent, rows: rows(49), items: [hotelItem(hotels[0]!)], sell });

    expect(booking.status).toBe('CONFIRMED');
    expect(booking.pilgrimIds).toHaveLength(49);
    expect(backend.wallet.balance(agent.id)).toBe(100_000); // 5,000,000 - 4,900,000 settled
  });

  it('blocks a booking that exceeds the credit limit', async () => {
    const backend = createInProcessBackend();
    const agent = await approvedAgent(backend);
    backend.wallet.open(agent.id, 'EUR', 50_000); // small credit, no top-up

    const hotels = await backend.booking.searchHotels({ city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 1 });
    await expect(
      bookGroupFromWallet(backend, { agent, rows: rows(2), items: [hotelItem(hotels[0]!)], sell: { amount: 200_000, currency: 'EUR' } }),
    ).rejects.toThrow();
  });

  it('refuses to book for an unapproved agent', async () => {
    const backend = createInProcessBackend();
    const agent = await backend.agents.register({ agencyName: 'New', email: 'n@x.example' });
    backend.wallet.open(agent.id, 'EUR', 1_000_000);
    await expect(
      bookGroupFromWallet(backend, { agent, rows: rows(1), items: [], sell: { amount: 1000, currency: 'EUR' } }),
    ).rejects.toThrow(/not approved/);
  });
});
