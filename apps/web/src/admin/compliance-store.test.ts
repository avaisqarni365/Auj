import { describe, it, expect } from 'vitest';
import { REFUND_WINDOW_DAYS } from '@auj/compliance';
import { getComplianceStore, issuePackageCompliance, tierForEur } from './compliance-store';

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

  it('tierForEur picks cover that meets/exceeds the booking value', () => {
    expect(tierForEur(1_500_000)).toBe('T20K'); // €15k ≤ €20k
    expect(tierForEur(2_000_000)).toBe('T20K'); // exactly €20k
    expect(tierForEur(2_000_001)).toBe('T50K'); // just over €20k
    expect(tierForEur(9_000_000)).toBe('T200K'); // €90k > €50k
  });

  it('issuePackageCompliance (the real-booking hook) writes a cert with the value-based tier', async () => {
    const s = await getComplianceStore();
    await issuePackageCompliance({ bookingRef: 'BK-HOOK', customerId: 'cust-hook', customerName: 'Bilal R', eurMinor: 9_000_000 });
    const cert = (await s.listCertificates()).find((c) => c.bookingRef === 'BK-HOOK');
    expect(cert?.tier).toBe('T200K');
    expect(cert?.coverageMinor).toBe(20_000_000);
    const refund = (await s.listRefundWindows()).find((r) => r.bookingRef === 'BK-HOOK');
    expect(refund).toBeTruthy(); // refund window opened
  });
});
