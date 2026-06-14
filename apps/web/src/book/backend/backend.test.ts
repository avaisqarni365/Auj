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
  });
});
