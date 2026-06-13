import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MockSaudiConnector, MockTravelSupplier } from '@auj/connector-mock';
import { createCoreBooking } from '../core';
import { hotelItem } from '../package-builder';
import { createPool, migrate, type DbPool } from './db';
import { createPostgresStores } from './repositories';

// Integration tests run only when TEST_DATABASE_URL is set (e.g. against the
// docker-compose Postgres, or the IONOS Postgres via an SSH tunnel). Otherwise they
// skip so the offline gate stays green:
//   TEST_DATABASE_URL=postgresql://auj:auj@localhost:5432/auj pnpm --filter @auj/core-booking test
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('Postgres persistence adapter (integration)', () => {
  let pool: DbPool;

  beforeAll(async () => {
    pool = createPool(url);
    await migrate(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('persists the full booking lifecycle through the Postgres stores', async () => {
    const saudi = new MockSaudiConnector();
    const core = createCoreBooking({ saudi, travel: new MockTravelSupplier(), stores: createPostgresStores(pool) });

    const customer = await core.crm.createCustomer({ fullName: 'Imran Ali', email: `imran-${Date.now()}@example.com` });
    const pilgrim = await core.crm.addPilgrim({ customerId: customer.id, firstName: 'Imran', lastName: 'Ali', passportNumber: 'PK123', nationality: 'PK', dob: '1985-01-01', gender: 'M' });

    const hotels = await saudi.searchHotels({ city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 1 });
    const booking = await core.bookings.createDraft({ customerId: customer.id, channel: 'PILGRIMAGE', pilgrimIds: [pilgrim.id], items: [hotelItem(hotels[0]!)] });
    await core.bookings.hold(booking.id);
    const confirmed = await core.bookings.confirm(booking.id, 'pay');
    const { visaCase } = await core.bookings.startVisa(booking.id);

    // Re-read from a fresh stores instance to prove it really persisted.
    const fresh = createCoreBooking({ saudi: new MockSaudiConnector(), travel: new MockTravelSupplier(), stores: createPostgresStores(pool) });
    const reloaded = await fresh.stores.bookings.get(booking.id);
    expect(reloaded?.status).toBe('VISA_IN_PROGRESS');
    expect(reloaded?.bookingRef).toBe(confirmed.bookingRef);
    expect(reloaded?.items[0]?.brn).toBeTruthy();
    expect((await fresh.stores.visaCases.get(visaCase.id))?.visaRef).toBe(visaCase.visaRef);
    expect((await fresh.stores.customers.get(customer.id))?.email).toBe(customer.email);
  });
});
