import { describe, it, expect } from 'vitest';
import type { Pilgrim } from '@auj/contracts';
import { SaudiPartnerConnector, NusukApprovalError } from './connector';
import { SandboxSaudiPartnerClient } from './client';

const criteria = { city: 'MAKKAH' as const, checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 1 };
const pilgrims: Pilgrim[] = [
  { id: 'p1', firstName: 'Imran', lastName: 'Ali', passportNumber: 'PK1', nationality: 'PK', dob: '1985-01-01', gender: 'M' },
];

function connector() {
  return new SaudiPartnerConnector(new SandboxSaudiPartnerClient());
}

describe('SaudiPartnerConnector mapping', () => {
  it('maps vendor hotels into domain offers with the maqam: id prefix', async () => {
    const offers = await connector().searchHotels(criteria);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers[0]?.id.startsWith('maqam:')).toBe(true);
    expect(offers.some((o) => o.nusukApproved)).toBe(true);
  });

  it('keeps BRNs verbatim from the partner on confirm', async () => {
    const c = connector();
    const offers = await c.searchHotels(criteria);
    const approved = offers.find((o) => o.nusukApproved)!;
    const hold = await c.hold([approved.id], pilgrims);
    const result = await c.confirm(hold.holdId, { ref: 'pay' });
    expect(result.status).toBe('CONFIRMED');
    expect(result.brns.length).toBe(1);
    expect(result.brns[0]?.startsWith('BRN-')).toBe(true);
  });
});

describe('Nusuk-approved-hotel rule', () => {
  it('allows the visa flow when an approved hotel was booked', async () => {
    const c = connector();
    const offers = await c.searchHotels(criteria);
    const approved = offers.find((o) => o.nusukApproved)!;
    const hold = await c.hold([approved.id], pilgrims);
    const booking = await c.confirm(hold.holdId, { ref: 'pay' });
    const visa = await c.createVisaApplication(booking.bookingRef, pilgrims);
    expect(visa.visaRef).toBeTruthy();
  });

  it('blocks the visa flow when no approved hotel was booked', async () => {
    const c = connector();
    const offers = await c.searchHotels(criteria);
    const notApproved = offers.find((o) => !o.nusukApproved)!;
    const hold = await c.hold([notApproved.id], pilgrims);
    const booking = await c.confirm(hold.holdId, { ref: 'pay' });
    await expect(c.createVisaApplication(booking.bookingRef, pilgrims)).rejects.toThrow(NusukApprovalError);
  });

  it('does not block an unknown booking (no hotel context)', async () => {
    const visa = await connector().createVisaApplication('UNKNOWN-REF', pilgrims);
    expect(visa.visaRef).toBeTruthy();
  });
});

describe('cancel', () => {
  it('maps the partner refund', async () => {
    const res = await connector().cancel('BR-x');
    expect(res.cancelled).toBe(true);
    expect(res.refund?.currency).toBe('SAR');
  });
});
