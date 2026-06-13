// Sample data for the Traveller web portal (/journey). Fed by core-booking in
// production (booking + pilgrims + status timeline); representative data here.
import type { Money } from '@auj/contracts';

export const BOOKING = {
  brn: 'BRN-26-VNO-00481',
  pkg: 'Umrah Premium · 14 nights',
  mode: 'Comprehensive package',
  route: 'Vilnius → Makkah → Madinah',
  dates: '12–26 Sep 2026',
  pax: 4,
  stageIndex: 2, // 0..4 into STAGES (currently "Visa")
  daysToDeparture: 91,
  total: { amount: 992000, currency: 'EUR' } as Money,
  paid: { amount: 446400, currency: 'EUR' } as Money,
};

// Rawdah (Riyadh ul-Jannah) permit — Madinah. Booked via Maqam/Nusuk on the seam.
export const RAWDAH = {
  permitRef: 'RWD-26-MED-02217',
  status: 'CONFIRMED' as 'REQUESTED' | 'CONFIRMED' | 'REJECTED',
  when: '20 Sep 2026 · 03:00',
  pax: 4,
};

export const STAGES = ['Booked', 'Documents', 'Visa', 'Travel', 'Return'] as const;

export const TIMELINE: Array<{ title: string; sub: string; badge?: string }> = [
  { title: 'Booking confirmed', sub: 'Deposit received · 14 Jun 2026' },
  { title: 'Documents collected', sub: 'Passport & photo verified for all 4 pilgrims' },
  { title: 'Visa processing', sub: 'e-Visa submitted to MOFA · est. 2–3 days', badge: 'In progress' },
  { title: 'Travel & departure', sub: 'VNO → JED · 12 Sep 2026 · 09:00' },
  { title: 'Return', sub: 'JED → VNO · 26 Sep 2026' },
];

export const NEXT_STEPS: Array<{ icon: string; title: string; sub: string; action: string }> = [
  { icon: '🪪', title: 'Visa decision expected', sub: 'We’ll notify you within 2–3 days', action: 'Track' },
  { icon: '💶', title: 'Balance due 30 days before travel', sub: '€5,456 remaining', action: 'Pay now' },
];

export const ITINERARY: Array<{ day: string; date: string; icon: string; title: string; body: string }> = [
  { day: 'Day 1', date: '12 Sep', icon: '✈', title: 'Arrive Jeddah → Makkah', body: 'Land at JED, meet & greet, private transfer to your Makkah hotel near the Haram.' },
  { day: 'Day 2', date: '13 Sep', icon: '🕋', title: 'Umrah', body: 'Perform Umrah with a guide — ihram, tawaf, sa’i, and tahallul.' },
  { day: 'Day 5', date: '16 Sep', icon: '🚌', title: 'Makkah ziyarah', body: 'Guided visits to the historical sites around Makkah.' },
  { day: 'Day 8', date: '19 Sep', icon: '🚌', title: 'Transfer to Madinah', body: 'Coach to Madinah; check in near Masjid an-Nabawi.' },
  { day: 'Day 9', date: '20 Sep', icon: '🕌', title: 'Madinah ziyarah', body: 'Visit Masjid an-Nabawi, Quba, and Uhud.' },
  { day: 'Day 14', date: '26 Sep', icon: '✈', title: 'Return home', body: 'Transfer to JED for your return flight to Vilnius.' },
];

export const DOCUMENTS: Array<{ name: string; meta: string; done: boolean }> = [
  { name: 'Passport scan', meta: 'Verified · all pilgrims', done: true },
  { name: 'Visa photo', meta: 'Verified · all pilgrims', done: true },
  { name: 'e-Visa (PDF)', meta: 'Issued when MOFA approves', done: false },
];

export const PILGRIM_VISAS: Array<{ name: string; nationality: string }> = [
  { name: 'Imran Ali', nationality: 'PK' },
  { name: 'Ayesha Khan', nationality: 'LT' },
  { name: 'Sara Ali', nationality: 'LT' },
  { name: 'Bilal Ali', nationality: 'PK' },
];

export const TRANSACTIONS: Array<{ date: string; desc: string; amount: Money }> = [
  { date: '14 Jun 2026', desc: 'Deposit · card', amount: { amount: 198400, currency: 'EUR' } },
  { date: '20 Jun 2026', desc: 'Part payment · SEPA', amount: { amount: 248000, currency: 'EUR' } },
];
