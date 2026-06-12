import { describe, it, expect } from 'vitest';
import { MockSaudiConnector, MockTravelSupplier } from '@auj/connector-mock';
import { createCoreBooking, type CoreBooking } from './core';
import { hotelItem } from './package-builder';

const now = (): string => '2026-06-12T00:00:00.000Z';

function setup(): CoreBooking & { saudi: MockSaudiConnector; travel: MockTravelSupplier } {
  const saudi = new MockSaudiConnector();
  const travel = new MockTravelSupplier();
  return { ...createCoreBooking({ saudi, travel, now }), saudi, travel };
}

describe('pilgrimage booking lifecycle (end-to-end against connector-mock)', () => {
  it('draft -> hold -> confirm(BRNs) -> visa -> ISSUED -> ticketed -> completed', async () => {
    const core = setup();
    const customer = await core.crm.createCustomer({ fullName: 'Imran Ali', email: 'imran@example.com' });
    const pilgrim = await core.crm.addPilgrim({
      customerId: customer.id, firstName: 'Imran', lastName: 'Ali',
      passportNumber: 'PK1234567', nationality: 'PK', dob: '1985-04-12', gender: 'M',
    });

    const hotels = await core.saudi.searchHotels({ city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 1 });
    const pkg = core.buildPackage({ name: 'Umrah 4 nights', channel: 'PILGRIMAGE', items: hotels.slice(0, 1).map(hotelItem) });

    let booking = await core.bookings.createDraft({ customerId: customer.id, channel: 'PILGRIMAGE', pilgrimIds: [pilgrim.id], items: pkg.items });
    expect(booking.status).toBe('DRAFT');

    booking = await core.bookings.hold(booking.id);
    expect(booking.status).toBe('HELD');
    expect(booking.holdId).toBeTruthy();

    booking = await core.bookings.confirm(booking.id, 'pay_ref_1');
    expect(booking.status).toBe('CONFIRMED');
    expect(booking.bookingRef).toBeTruthy();
    expect(booking.items[0]?.brn).toBeTruthy(); // BRN captured per item

    const { visaCase } = await core.bookings.startVisa(booking.id);
    expect(visaCase.route).toBe('AGENT_CHANNEL'); // PK passport
    expect(visaCase.perPilgrim[0]?.route).toBe('AGENT_CHANNEL');
    expect(visaCase.status).toBe('DRAFT');

    let vc = visaCase;
    for (let i = 0; vc.status !== 'ISSUED' && i < 10; i += 1) {
      vc = await core.bookings.refreshVisa(booking.id);
    }
    expect(vc.status).toBe('ISSUED');

    expect((await core.bookings.markTicketed(booking.id)).status).toBe('TICKETED');
    expect((await core.bookings.complete(booking.id)).status).toBe('COMPLETED');
  });

  it('routes an EU pilgrim to EVISA_DIRECT', async () => {
    const core = setup();
    const customer = await core.crm.createCustomer({ fullName: 'Greta K', email: 'greta@example.com' });
    const pilgrim = await core.crm.addPilgrim({
      customerId: customer.id, firstName: 'Greta', lastName: 'Kazlauskaite',
      passportNumber: 'LT9', nationality: 'LT', dob: '1990-01-01', gender: 'F',
    });
    const hotels = await core.saudi.searchHotels({ city: 'MADINAH', checkIn: '2026-09-01', checkOut: '2026-09-03', pax: 1 });
    const pkg = core.buildPackage({ name: 'Umrah', channel: 'PILGRIMAGE', items: hotels.slice(0, 1).map(hotelItem) });
    const booking = await core.bookings.createDraft({ customerId: customer.id, channel: 'PILGRIMAGE', pilgrimIds: [pilgrim.id], items: pkg.items });
    await core.bookings.hold(booking.id);
    await core.bookings.confirm(booking.id, 'pay');
    const { visaCase } = await core.bookings.startVisa(booking.id);
    expect(visaCase.route).toBe('EVISA_DIRECT');
  });

  it('rejects confirm before hold', async () => {
    const core = setup();
    const customer = await core.crm.createCustomer({ fullName: 'X', email: 'x@example.com' });
    const pilgrim = await core.crm.addPilgrim({ customerId: customer.id, firstName: 'X', lastName: 'Y', passportNumber: 'PK1', nationality: 'PK', dob: '1990-01-01', gender: 'M' });
    const booking = await core.bookings.createDraft({ customerId: customer.id, channel: 'PILGRIMAGE', pilgrimIds: [pilgrim.id], items: [] });
    await expect(core.bookings.confirm(booking.id, 'pay')).rejects.toThrow(/not held/);
  });
});

describe('general-travel booking lifecycle (one-step, no visa)', () => {
  it('draft -> confirm(book) -> cancel(refund) -> refund', async () => {
    const core = setup();
    const customer = await core.crm.createCustomer({ fullName: 'Traveller', email: 't@example.com' });
    const traveller = await core.crm.addPilgrim({ customerId: customer.id, firstName: 'Jonas', lastName: 'P', passportNumber: 'LT2', nationality: 'LT', dob: '1988-01-01', gender: 'M' });

    const hotels = await core.travel.searchHotels({ city: 'JEDDAH', country: 'AE', checkIn: '2026-10-01', checkOut: '2026-10-04', pax: 1 });
    const pkg = core.buildPackage({ name: 'Dubai stay', channel: 'TRAVEL', items: hotels.slice(0, 1).map(hotelItem) });

    let booking = await core.bookings.createDraft({ customerId: customer.id, channel: 'TRAVEL', pilgrimIds: [traveller.id], items: pkg.items });
    booking = await core.bookings.confirm(booking.id, 'pay_travel'); // one-step DRAFT -> CONFIRMED
    expect(booking.status).toBe('CONFIRMED');
    expect(booking.items[0]?.brn).toBeTruthy();

    booking = await core.bookings.cancel(booking.id);
    expect(booking.status).toBe('CANCELLED');
    expect(booking.refund?.currency).toBe('EUR');

    booking = await core.bookings.refund(booking.id);
    expect(booking.status).toBe('REFUNDED');
  });
});
