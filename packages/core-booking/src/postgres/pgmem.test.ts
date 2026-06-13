import { describe, it, expect } from 'vitest';
import { newDb } from 'pg-mem';
import { MockSaudiConnector, MockTravelSupplier } from '@auj/connector-mock';
import { createCoreBooking } from '../core';
import { hotelItem } from '../package-builder';
import { migrate, type DbPool } from './db';
import { createPostgresStores } from './repositories';

// Runs the real SQL + repositories against an in-memory Postgres emulator (pg-mem),
// so the adapter is exercised end-to-end offline (no DB, no network).
async function freshPool(): Promise<DbPool> {
  const db = newDb();
  const { Pool } = db.adapters.createPg();
  const pool = new Pool() as unknown as DbPool;
  await migrate(pool);
  return pool;
}

describe('Postgres adapter against pg-mem', () => {
  it('round-trips a customer and pilgrim', async () => {
    const pool = await freshPool();
    const core = createCoreBooking({ saudi: new MockSaudiConnector(), travel: new MockTravelSupplier(), stores: createPostgresStores(pool) });

    const customer = await core.crm.createCustomer({ fullName: 'Imran Ali', email: 'i@x.example' });
    const pilgrim = await core.crm.addPilgrim({ customerId: customer.id, firstName: 'Imran', lastName: 'Ali', passportNumber: 'PK1', nationality: 'PK', dob: '1985-01-01', gender: 'M' });

    expect((await core.stores.customers.get(customer.id))?.email).toBe('i@x.example');
    expect((await core.stores.pilgrims.get(pilgrim.id))?.nationality).toBe('PK');
  });

  it('persists the booking aggregate (items + BRNs) and the visa case across fresh stores', async () => {
    const pool = await freshPool();
    const saudi = new MockSaudiConnector();
    const core = createCoreBooking({ saudi, travel: new MockTravelSupplier(), stores: createPostgresStores(pool) });

    const customer = await core.crm.createCustomer({ fullName: 'Greta K', email: 'g@x.example' });
    const pilgrim = await core.crm.addPilgrim({ customerId: customer.id, firstName: 'Greta', lastName: 'K', passportNumber: 'LT1', nationality: 'LT', dob: '1990-01-01', gender: 'F' });
    const hotels = await saudi.searchHotels({ city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 1 });

    const draft = await core.bookings.createDraft({ customerId: customer.id, channel: 'PILGRIMAGE', pilgrimIds: [pilgrim.id], items: [hotelItem(hotels[0]!)] });
    await core.bookings.hold(draft.id);
    const confirmed = await core.bookings.confirm(draft.id, 'pay');
    const { visaCase } = await core.bookings.startVisa(draft.id);

    // Re-read through a separate stores instance on the same pool -> proves it persisted.
    const fresh = createPostgresStores(pool);
    const reloaded = await fresh.bookings.get(draft.id);
    expect(reloaded?.status).toBe('VISA_IN_PROGRESS');
    expect(reloaded?.bookingRef).toBe(confirmed.bookingRef);
    expect(reloaded?.items).toHaveLength(1);
    expect(reloaded?.items[0]?.brn).toBeTruthy();
    expect(reloaded?.pilgrimIds).toEqual([pilgrim.id]);
    expect((await fresh.visaCases.get(visaCase.id))?.route).toBe('EVISA_DIRECT'); // LT
  });

  it('persists package mode and a Rawdah permit (jsonb) across fresh stores', async () => {
    const pool = await freshPool();
    const saudi = new MockSaudiConnector();
    const core = createCoreBooking({ saudi, travel: new MockTravelSupplier(), stores: createPostgresStores(pool) });

    const customer = await core.crm.createCustomer({ fullName: 'Imran', email: 'i2@x.example' });
    const pilgrim = await core.crm.addPilgrim({ customerId: customer.id, firstName: 'Imran', lastName: 'Ali', passportNumber: 'PK7', nationality: 'PK', dob: '1985-01-01', gender: 'M' });
    const draft = await core.bookings.createDraft({ customerId: customer.id, channel: 'PILGRIMAGE', mode: 'COMPREHENSIVE', pilgrimIds: [pilgrim.id], items: [] });

    const slots = await core.bookings.rawdahSlots('2026-09-02');
    const permit = await core.bookings.bookRawdah(draft.id, slots[0]!.slotId);

    const reloaded = await createPostgresStores(pool).bookings.get(draft.id);
    expect(reloaded?.mode).toBe('COMPREHENSIVE');
    expect(reloaded?.rawdah?.permitRef).toBe(permit.permitRef);
    expect(reloaded?.rawdah?.status).toBe('CONFIRMED');
    expect(reloaded?.rawdah?.pilgrimIds).toEqual([pilgrim.id]);
  });

  it('persists a gift voucher (jsonb) and its redeemed flag across fresh stores', async () => {
    const pool = await freshPool();
    const core = createCoreBooking({ saudi: new MockSaudiConnector(), travel: new MockTravelSupplier(), stores: createPostgresStores(pool) });
    const customer = await core.crm.createCustomer({ fullName: 'Bilal', email: 'b3@x.example' });
    const draft = await core.bookings.createDraft({
      customerId: customer.id, channel: 'PILGRIMAGE', pilgrimIds: [], items: [],
      gift: { recipientName: 'Mother', recipientEmail: 'mum@x.example' },
    });

    const reloaded = await createPostgresStores(pool).bookings.get(draft.id);
    expect(reloaded?.gift?.voucherCode).toBe(draft.gift?.voucherCode);
    expect(reloaded?.gift?.recipientName).toBe('Mother');
    expect(reloaded?.gift?.redeemed).toBe(false);

    await core.bookings.redeemGift(draft.gift!.voucherCode);
    expect((await createPostgresStores(pool).bookings.get(draft.id))?.gift?.redeemed).toBe(true);
  });

  it('persists special requests (jsonb) and status updates across fresh stores', async () => {
    const pool = await freshPool();
    const core = createCoreBooking({ saudi: new MockSaudiConnector(), travel: new MockTravelSupplier(), stores: createPostgresStores(pool) });
    const customer = await core.crm.createCustomer({ fullName: 'Sara', email: 's4@x.example' });
    const draft = await core.bookings.createDraft({
      customerId: customer.id, channel: 'PILGRIMAGE', pilgrimIds: [], items: [],
      specialRequests: [{ category: 'ROOM_NEAR_HARAM', note: 'High floor' }],
    });
    const reqId = draft.specialRequests![0]!.id;
    await core.bookings.setRequestStatus(draft.id, reqId, 'FULFILLED');

    const reloaded = await createPostgresStores(pool).bookings.get(draft.id);
    expect(reloaded?.specialRequests).toHaveLength(1);
    expect(reloaded?.specialRequests?.[0]?.category).toBe('ROOM_NEAR_HARAM');
    expect(reloaded?.specialRequests?.[0]?.note).toBe('High floor');
    expect(reloaded?.specialRequests?.[0]?.status).toBe('FULFILLED');
  });

  it('updates a booking in place (upsert) rather than duplicating', async () => {
    const pool = await freshPool();
    const stores = createPostgresStores(pool);
    const base = { id: 'b1', customerId: 'c1', channel: 'TRAVEL' as const, status: 'DRAFT' as const, pilgrimIds: [], items: [], createdAt: 't0', updatedAt: 't0' };
    await stores.bookings.save(base);
    await stores.bookings.save({ ...base, status: 'CONFIRMED', bookingRef: 'BK-9', updatedAt: 't1' });
    const all = await stores.bookings.list();
    expect(all).toHaveLength(1);
    expect(all[0]?.status).toBe('CONFIRMED');
    expect(all[0]?.bookingRef).toBe('BK-9');
  });
});
