// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { submitInquiryAction } from './actions';
import { getLeads } from './store';
import type { InquiryInput } from './inquiry';

// End-to-end (in-memory): the same path the Smart Planner & booking "Send to AUJ" button hits —
// submitInquiryAction → leads store → admin list. No DATABASE_URL ⇒ in-memory, no production data.
const sample: InquiryInput = {
  country: 'Lithuania',
  city: 'Vilnius',
  departureAirport: 'VNO',
  adults: 2,
  children: 1,
  infants: 0,
  partyKind: 'FAMILY',
  makkahNights: 7,
  makkahHotelBand: 'Near (≤300m)',
  makkahZiyarah: [],
  transferMode: 'FLEXIBLE',
  transferPrivate: false,
  transferTime: 'FLEXIBLE',
  madinahNights: 3,
  madinahHotelBand: 'Near (≤300m)',
  rawdah: true,
  madinahZiyarah: [],
  dining: 'NO_PREF',
  returnFrom: 'MADINAH',
  returnMode: 'FLEXIBLE',
  jeddahStopover: false,
  trackerOptIn: true,
  name: 'Aisha Khan',
  email: 'aisha@example.com',
  phone: '+370 600 00000',
  channel: 'WHATSAPP',
  lang: 'en',
  consent: true,
};

describe('inquiry round-trip (Send to AUJ → leads store)', () => {
  it('persists the inquiry and surfaces it in the admin list + leads table', async () => {
    const { ref } = await submitInquiryAction(sample);
    expect(ref).toMatch(/^INQ-[A-Z0-9]{4}$/);

    const inquiries = await (await getLeads()).list();
    const found = inquiries.find((i) => i.ref === ref);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Aisha Khan');
    expect(found?.email).toBe('aisha@example.com');
    expect(found?.status).toBe('NEW');
    expect(found?.makkahNights).toBe(7);

    // GDPR-consented lead row (contact falls back from email/phone)
    const leads = await (await getLeads()).listLeads();
    const lead = leads.find((l) => l.id === found?.id);
    expect(lead?.consent).toBe(true);
    expect(lead?.contact === 'aisha@example.com' || lead?.contact === '+370 600 00000').toBe(true);
  });
});
