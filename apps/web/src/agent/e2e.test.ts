import { describe, it, expect } from 'vitest';
import { hotelItem } from '@auj/core-booking';
import { createInProcessBackend } from './backend/in-process';
import { MarkupEngine } from './markup';
import { bookGroupFromWallet } from './multipax';
import { buildStatement } from './statements';
import type { PaxRow } from './domain';

const rows = (count: number): PaxRow[] =>
  Array.from({ length: count }, (_, i) => ({
    firstName: `F${i}`, lastName: `L${i}`, passportNumber: `PK${i}`, nationality: 'PK', dob: '1990-01-01', gender: 'M' as const,
  }));

describe('B2B end-to-end on the mock', () => {
  it('register -> approve -> fund wallet -> book 49 pax with markup -> statement reconciles', async () => {
    const backend = createInProcessBackend();

    // onboarding
    const registered = await backend.agents.register({ agencyName: 'Hajj Express', email: 'ops@hajjexpress.example', tier: 'GOLD' });
    const agent = await backend.agents.approve(registered.id);
    expect(agent.status).toBe('APPROVED');

    // wallet funded
    backend.wallet.open(agent.id, 'EUR', 0);
    backend.wallet.topUp(agent.id, { amount: 6_000_000, currency: 'EUR' }, 'gw_topup');

    // price with a GOLD markup
    const engine = new MarkupEngine([{ id: 'g', tier: 'GOLD', kind: 'PERCENT', value: 10, enabled: true }]);
    const net = { amount: 5_000_000, currency: 'EUR' as const };
    const { sell } = engine.price(net, { tier: agent.tier, kind: 'HOTEL' });
    expect(sell.amount).toBe(5_500_000);

    // book the whole group from the wallet
    const hotels = await backend.booking.searchHotels({ city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 49 });
    const booking = await bookGroupFromWallet(backend, { agent, rows: rows(49), items: [hotelItem(hotels[0]!)], sell });
    expect(booking.status).toBe('CONFIRMED');
    expect(booking.pilgrimIds).toHaveLength(49);
    expect(booking.bookingRef).toBeTruthy();

    // wallet drawn down by the sell amount; ledger balanced
    expect(backend.wallet.balance(agent.id)).toBe(6_000_000 - 5_500_000);

    // statement reconciles against the wallet account
    const statement = buildStatement(backend.wallet.entries(), `wallet:${agent.id}`, 'EUR');
    expect(statement.closing).toBe(backend.wallet.balance(agent.id));
    expect(statement.credits - statement.debits).toBe(statement.closing);
  });
});
