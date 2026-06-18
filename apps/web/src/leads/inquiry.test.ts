import { describe, it, expect } from 'vitest';
import { createInquiry, listInquiries, setInquiryStatus, type InquiryInput } from './inquiry';

const input: InquiryInput = {
  country: 'LT', city: 'Vilnius', departureAirport: 'VNO',
  adults: 2, children: 1, infants: 0, partyKind: 'FAMILY',
  makkahNights: 6, makkahHotelBand: '≤800 m', makkahZiyarah: ['Mina'],
  transferMode: 'TRAIN', transferPrivate: false,
  madinahNights: 3, madinahHotelBand: '≤800 m', rawdah: true, madinahZiyarah: ['Quba Mosque'],
  returnFrom: 'MADINAH', jeddahStopover: false,
  trackerOptIn: true,
  name: 'Imran Ali', email: 'imran@example.com', phone: '+370600', channel: 'WHATSAPP', lang: 'en', consent: true,
};

describe('Smart Visit inquiry store', () => {
  it('creates a lead with a ref + NEW status, lists it, and advances status', () => {
    const created = createInquiry(input, '2026-06-18T10:00:00Z');
    expect(created.ref).toMatch(/^INQ-[0-9A-F]{4}$/);
    expect(created.status).toBe('NEW');
    expect(created.name).toBe('Imran Ali');

    const listed = listInquiries().find((i) => i.id === created.id);
    expect(listed).toBeDefined();
    expect(listed?.makkahZiyarah).toEqual(['Mina']);

    const updated = setInquiryStatus(created.id, 'CONTACTED');
    expect(updated?.status).toBe('CONTACTED');
    expect(setInquiryStatus('no-such-id', 'QUOTED')).toBeUndefined();
  });
});
