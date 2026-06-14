import { describe, it, expect } from 'vitest';
import { createInProcessBackend } from './in-process';

describe('BookingApi.myBookings', () => {
  it('returns only the bookings for the customer matching the email (case-insensitive)', async () => {
    const be = createInProcessBackend();
    const a = await be.booking.createCustomer({ fullName: 'Aisha', email: 'aisha@auj.example' });
    const b = await be.booking.createCustomer({ fullName: 'Bilal', email: 'bilal@auj.example' });
    const mine = await be.booking.createBooking({ customerId: a.id, channel: 'PILGRIMAGE', pilgrimIds: [], items: [] });
    await be.booking.createBooking({ customerId: b.id, channel: 'TRAVEL', pilgrimIds: [], items: [] });

    const result = await be.booking.myBookings('AISHA@auj.example');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(mine.id);
    expect(await be.booking.myBookings('nobody@auj.example')).toHaveLength(0);

    // myBooking is ownership-checked: owner gets it, others get undefined.
    expect((await be.booking.myBooking('aisha@auj.example', mine.id))?.id).toBe(mine.id);
    expect(await be.booking.myBooking('bilal@auj.example', mine.id)).toBeUndefined();
    expect(await be.booking.myBooking('aisha@auj.example', 'no-such-id')).toBeUndefined();
  });

  it('uploads + lists documents per pilgrim', async () => {
    const be = createInProcessBackend();
    const c = await be.booking.createCustomer({ fullName: 'Aisha', email: 'a@x.example' });
    const p = await be.booking.addPilgrim({ customerId: c.id, firstName: 'Aisha', lastName: 'K', passportNumber: 'PK1', nationality: 'PK', dob: '1990-01-01', gender: 'F' });

    const doc = await be.booking.uploadDocument({ pilgrimId: p.id, type: 'PASSPORT', fileName: 'p.jpg', bytes: new Uint8Array([1, 2, 3]), contentType: 'image/jpeg' });
    expect(doc.verified).toBe(false);
    expect(doc.type).toBe('PASSPORT');

    const docs = await be.booking.documentsForPilgrims([p.id]);
    expect(docs).toHaveLength(1);
    expect(docs[0]?.pilgrimId).toBe(p.id);
  });
});
