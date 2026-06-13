import { describe, it, expect } from 'vitest';
import { ComplianceService } from './compliance-service';
import { ConsentRequiredError } from './consent';
import { GUARANTEE_TIERS } from './config';
import { refundDueBy, isRefundOverdue, daysUntilRefundDue } from './refund';

const FIXED = '2026-06-13T00:00:00.000Z';

describe('certificate issuance', () => {
  it('issues and delivers a stored certificate stating the guarantee tier', () => {
    const svc = new ComplianceService({ tier: 'T50K', now: () => FIXED });
    const cert = svc.onPackageBooked({ bookingRef: 'BK1', customerId: 'c1', customerName: 'Imran Ali' });
    expect(cert.coverage).toEqual(GUARANTEE_TIERS.T50K.coverage);
    expect(cert.deliveredAt).toBe(FIXED);
    expect(cert.deliveryProof).toContain('delivered via email');
    expect(cert.content).toContain('EUR 50,000');
    expect(svc.certificates.byBooking('BK1')?.id).toBe(cert.id);
  });
});

describe('pre-contract consent gating', () => {
  it('blocks a charge until consent is recorded', () => {
    const svc = new ComplianceService({ tier: 'T20K' });
    expect(() => svc.assertChargeable('BK2')).toThrow(ConsentRequiredError);
    svc.consent.recordPreContractConsent({ customerId: 'c1', bookingRef: 'BK2' });
    expect(() => svc.assertChargeable('BK2')).not.toThrow();
  });
});

describe('PTD refund window (six months)', () => {
  it('computes the deadline and overdue state', () => {
    const ref = '2026-01-01T00:00:00.000Z';
    expect(refundDueBy(ref).slice(0, 10)).toBe('2026-07-03'); // +183 days
    expect(isRefundOverdue(ref, '2026-06-01T00:00:00.000Z')).toBe(false);
    expect(isRefundOverdue(ref, '2026-08-01T00:00:00.000Z')).toBe(true);
    expect(daysUntilRefundDue(ref, '2026-07-01T00:00:00.000Z')).toBe(2);
  });
});

describe('GDPR export & erasure', () => {
  it('exports a subject including certificates + consents, and erases on request', () => {
    const svc = new ComplianceService({ tier: 'T200K', now: () => FIXED });
    svc.consent.recordPreContractConsent({ customerId: 'c9', bookingRef: 'BK9' });
    svc.onPackageBooked({ bookingRef: 'BK9', customerId: 'c9', customerName: 'Greta K' });

    const exported = svc.gdpr.exportSubject('c9');
    expect(exported.customerId).toBe('c9');
    const firstSource = exported.sources[0] as { certificates: unknown[]; consents: unknown[] };
    expect(firstSource.certificates).toHaveLength(1);
    expect(firstSource.consents).toHaveLength(1);

    expect(svc.gdpr.isErased('c9')).toBe(false);
    svc.gdpr.deleteSubject('c9');
    expect(svc.gdpr.isErased('c9')).toBe(true);
    expect(svc.gdpr.processingRecords().length).toBeGreaterThan(0);
  });
});
