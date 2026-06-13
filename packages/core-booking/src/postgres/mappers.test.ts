import { describe, it, expect } from 'vitest';
import { rowToBooking, rowToCustomer, rowToPilgrim, rowToDocument, rowToVisaCase } from './mappers';

describe('postgres row mappers (offline)', () => {
  it('maps a customer row, omitting null phone', () => {
    expect(rowToCustomer({ id: 'c1', full_name: 'Imran Ali', email: 'i@x', phone: null, created_at: 't' })).toEqual({
      id: 'c1', fullName: 'Imran Ali', email: 'i@x', createdAt: 't',
    });
  });

  it('maps a pilgrim row with optional residence fields', () => {
    const p = rowToPilgrim({
      id: 'p1', customer_id: 'c1', first_name: 'A', last_name: 'B', passport_number: 'PK1', nationality: 'PK',
      residence_country: 'DE', residence_permit: true, dob: '1990-01-01', gender: 'M', mahram_pilgrim_id: null,
    });
    expect(p.residenceCountry).toBe('DE');
    expect(p.residencePermit).toBe(true);
    expect('mahramPilgrimId' in p).toBe(false);
  });

  it('reassembles a booking aggregate with ordered items + BRNs and refund', () => {
    const booking = rowToBooking(
      {
        id: 'b1', customer_id: 'c1', channel: 'PILGRIMAGE', status: 'CONFIRMED', pilgrim_ids: ['p1', 'p2'],
        hold_id: null, hold_expires_at: null, booking_ref: 'BK-1', visa_case_id: 'v1',
        refund_amount: 50000, refund_currency: 'SAR', created_at: 't0', updated_at: 't1',
      },
      [
        { booking_id: 'b1', position: 1, kind: 'TRANSPORT', offer_id: 'o2', title: 'Coach', net_amount: 18000, net_currency: 'SAR', brn: 'BRN2' },
        { booking_id: 'b1', position: 0, kind: 'HOTEL', offer_id: 'o1', title: 'Hotel', net_amount: 95000, net_currency: 'SAR', brn: 'BRN1' },
      ],
    );
    expect(booking.items.map((i) => i.offerId)).toEqual(['o1', 'o2']); // sorted by position
    expect(booking.items[0]?.brn).toBe('BRN1');
    expect(booking.bookingRef).toBe('BK-1');
    expect(booking.refund).toEqual({ amount: 50000, currency: 'SAR' });
    expect('holdId' in booking).toBe(false);
  });

  it('maps document + visa-case rows', () => {
    expect(rowToDocument({ id: 'd1', pilgrim_id: 'p1', type: 'PASSPORT', file_ref: 'k', verified: true, uploaded_at: 't', mrz: 'P<...' }).mrz).toBe('P<...');
    const vc = rowToVisaCase({ id: 'v1', booking_id: 'b1', visa_ref: 'VR', route: 'AGENT_CHANNEL', status: 'DRAFT', per_pilgrim: [{ pilgrimId: 'p1', route: 'AGENT_CHANNEL', warnings: [] }] });
    expect(vc.route).toBe('AGENT_CHANNEL');
    expect(vc.perPilgrim).toHaveLength(1);
  });
});
