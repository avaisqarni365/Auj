import { describe, it, expect } from 'vitest';
import { REFUND_WINDOW_DAYS } from '@auj/compliance';
import { getComplianceStore } from './compliance-store';

// No DATABASE_URL in tests → in-memory implementation.
describe('compliance store (in-memory)', () => {
  it('on package booking: issues a delivered certificate, records consent, opens a 6-month refund window', async () => {
    const s = await getComplianceStore();
    const { certificate, consent, refund } = await s.onPackageBooking({
      bookingRef: 'BK-T1', customerId: 'cust-1', customerName: 'Imran Ali', tier: 'T50K', shown: ['a', 'b'], ip: '0.0.0.0',
    });
    expect(certificate.deliveredAt).toBeTruthy();
    expect(certificate.deliveryProof).toContain('cust-1'); // proof of delivery stored
    expect(certificate.coverageMinor).toBe(5_000_000); // tier drives cover
    expect(certificate.content).toContain('Insolvency');
    expect(consent.shown).toEqual(['a', 'b']);
    const span = (new Date(refund.dueAt).getTime() - new Date(refund.openedAt).getTime()) / 86_400_000;
    expect(Math.round(span)).toBe(REFUND_WINDOW_DAYS); // ~6 months
  });

  it('GDPR export returns the customer records; delete erases PII', async () => {
    const s = await getComplianceStore();
    await s.onPackageBooking({ bookingRef: 'BK-T2', customerId: 'cust-2', customerName: 'Sara Khan', tier: 'T20K', shown: [], ip: '' });

    const exp = await s.requestGdpr('cust-2', 'export');
    const out = await s.completeGdpr(exp.id);
    expect((out.export as { certificates: unknown[] }).certificates.length).toBeGreaterThan(0);

    const del = await s.requestGdpr('cust-2', 'delete');
    await s.completeGdpr(del.id);
    const certs = await s.listCertificates();
    expect(certs.find((c) => c.bookingRef === 'BK-T2')?.customerName).toBe('[erased]');
  });
});
