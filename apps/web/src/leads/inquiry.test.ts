import { describe, it, expect } from 'vitest';
import { InMemoryLeads } from './store';
import type { InquiryInput } from './inquiry';

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

describe('Smart Visit leads store (in-memory)', () => {
  it('creates a lead with a ref + NEW status, lists it, and advances status', async () => {
    const store = new InMemoryLeads();
    const created = await store.create(input);
    expect(created.ref).toMatch(/^INQ-[0-9A-F]{4}$/);
    expect(created.status).toBe('NEW');
    expect(created.name).toBe('Imran Ali');

    const listed = (await store.list()).find((i) => i.id === created.id);
    expect(listed?.makkahZiyarah).toEqual(['Mina']);

    const updated = await store.setStatus(created.id, 'CONTACTED');
    expect(updated?.status).toBe('CONTACTED');
    expect(await store.setStatus('no-such-id', 'QUOTED')).toBeUndefined();
  });
});
