import { describe, it, expect } from 'vitest';
import { hotelItem } from '@auj/core-booking';
import { createInProcessBackend } from './backend/in-process';
import { adminMetrics } from './usecases';

describe('admin back office (oversight e2e on the mock)', () => {
  it('sees bookings/visa/ledger/certificates and can cancel + refund', async () => {
    const backend = createInProcessBackend();
    const { admin, core, saudi, payments, compliance } = backend;

    // --- seed a confirmed pilgrimage booking with a visa case (as the customer app would) ---
    const customer = await core.crm.createCustomer({ fullName: 'Imran Ali', email: 'i@example.com' });
    const pilgrim = await core.crm.addPilgrim({ customerId: customer.id, firstName: 'Imran', lastName: 'Ali', passportNumber: 'PK1', nationality: 'PK', dob: '1985-01-01', gender: 'M' });
    const hotels = await saudi.searchHotels({ city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 1 });
    const draft = await core.bookings.createDraft({ customerId: customer.id, channel: 'PILGRIMAGE', pilgrimIds: [pilgrim.id], items: [hotelItem(hotels[0]!)] });
    await core.bookings.hold(draft.id);
    const confirmed = await core.bookings.confirm(draft.id, 'pay');
    const { visaCase } = await core.bookings.startVisa(draft.id);
    for (let i = 0; (await core.bookings.refreshVisa(draft.id)).status !== 'ISSUED' && i < 10; i += 1) { /* poll */ }

    // payment recorded in the ledger; compliance certificate issued
    await payments.pay({ amount: { amount: 120000, currency: 'EUR' }, bookingRef: confirmed.bookingRef!, idempotencyKey: 'k1' });
    compliance.onPackageBooked({ bookingRef: confirmed.bookingRef!, customerId: customer.id, customerName: 'Imran Ali' });

    // --- oversight ---
    expect((await admin.listBookings()).map((b) => b.id)).toContain(draft.id);
    expect((await admin.listVisaCases()).find((v) => v.id === visaCase.id)?.bookingRef ?? visaCase.bookingId).toBe(draft.id);

    const metrics = await adminMetrics(admin);
    expect(metrics.totalBookings).toBe(1);
    expect(metrics.active).toBe(1);
    expect(metrics.visaIssued).toBe(1);
    expect(metrics.revenueEur.amount).toBe(120000);

    expect(admin.accountBalance('revenue:bookings', 'EUR')).toBe(120000);
    expect(admin.ledgerEntries().length).toBeGreaterThan(0);

    // compliance registry + GDPR
    const certs = admin.listCertificates();
    expect(certs).toHaveLength(1);
    expect(certs[0]?.bookingRef).toBe(confirmed.bookingRef);
    const exported = admin.exportSubject(customer.id);
    const firstSource = exported.sources[0] as { certificates: unknown[] };
    expect(firstSource.certificates).toHaveLength(1);
    expect(admin.deleteSubject(customer.id).erasedAt).toBeTruthy();

    // --- operator actions ---
    expect((await admin.cancelBooking(draft.id)).status).toBe('CANCELLED');
    expect((await admin.refundBooking(draft.id)).status).toBe('REFUNDED');
  });
});
