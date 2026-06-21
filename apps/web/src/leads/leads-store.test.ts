import { describe, it, expect } from 'vitest';
import { InMemoryLeads, toLead } from './store';
import type { InquiryInput } from './inquiry';

const sample: InquiryInput = {
  country: 'LT',
  city: 'Vilnius',
  departureAirport: 'VNO',
  adults: 2,
  children: 1,
  infants: 0,
  partyKind: 'FAMILY',
  makkahNights: 7,
  makkahHotelBand: '≤300m',
  makkahZiyarah: [],
  transferMode: 'TRAIN',
  transferPrivate: false,
  transferTime: 'FLEXIBLE',
  madinahNights: 4,
  madinahHotelBand: '≤800m',
  rawdah: true,
  madinahZiyarah: [],
  dining: 'TOP_RATED',
  returnFrom: 'MADINAH',
  returnMode: 'TRAIN',
  jeddahStopover: false,
  trackerOptIn: true,
  name: 'Imran Ali',
  email: 'imran@example.com',
  channel: 'WHATSAPP',
  lang: 'ur',
  consent: true,
};

describe('leads store (in-memory) — normalized lead + GDPR consent', () => {
  it('projects a submitted inquiry into a normalized lead row with consent', async () => {
    const store = new InMemoryLeads();
    const inquiry = await store.create(sample);
    const leads = await store.listLeads();

    expect(leads).toHaveLength(1);
    const lead = leads[0]!;
    expect(lead.id).toBe(inquiry.id);
    expect(lead.name).toBe('Imran Ali');
    expect(lead.contact).toBe('imran@example.com'); // email preferred, else phone
    expect(lead.locale).toBe('ur');
    expect(lead.consent).toBe(true); // GDPR consent captured
    expect(lead.intent).toBe('FAMILY · 7+4 nts');
  });

  it('toLead falls back to phone when no email, and carries consent=false', () => {
    const lead = toLead({ ...sample, email: '', phone: '+37060000000', consent: false, id: 'x', ref: 'INQ-X', createdAt: '2026-06-21T00:00:00Z', status: 'NEW' });
    expect(lead.contact).toBe('+37060000000');
    expect(lead.consent).toBe(false);
  });
});
