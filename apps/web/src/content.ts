// Marketing copy + data for the landing page. Imagery/icons are placeholders to swap.
import type { Money } from '@auj/contracts';

export const NAV_LINKS = ['Umrah', 'Hajj', 'Ziyarat', 'How it works', 'Packages', 'Track booking'];

export const HERO_STATS: Array<{ value: string; label: string }> = [
  { value: '6', label: 'EU departure cities' },
  { value: '1,240+', label: 'pilgrims served' },
  { value: '4 langs', label: 'EN · LT · UR · AR' },
  { value: '24/7', label: 'support desk' },
];

export const SEARCH_TABS = ['Umrah', 'Hajj', 'Ziyarat'] as const;
export type SearchTab = (typeof SEARCH_TABS)[number];
export const SEARCH_COUNT: Record<SearchTab, number> = { Umrah: 38, Hajj: 12, Ziyarat: 9 };

// Search-widget options (the booking funnel itself lives in the web-b2c app).
export const DEPARTURE_CITIES = ['Vilnius (VNO)', 'Riga (RIX)', 'Warsaw (WAW)', 'Dublin (DUB)', 'Berlin (BER)', 'Tallinn (TLL)'] as const;
export const DESTINATIONS = ['Makkah', 'Madinah', 'Jeddah'] as const;

export const TRUST = ['Licensed EU tour operator', 'e-Visa guidance included', 'EUR or PKR pricing', 'ATOL-style protection'];

export const JOURNEY_TYPES: Array<{ name: string; desc: string; img: string }> = [
  { name: 'Umrah', desc: 'Any time of year — flexible nights in Makkah & Madinah with e-Visa guidance.', img: 'from-green-600 to-green-900' },
  { name: 'Hajj', desc: 'Seasonal, Ministry-regulated packages with Nusuk-approved hotels.', img: 'from-accent-500 to-accent-700' },
  { name: 'Ziyarat', desc: 'Guided visits — Najaf, Karbala and the holy sites beyond the Haramain.', img: 'from-green-700 to-green-950' },
];

export const STEPS: Array<{ n: string; title: string; desc: string }> = [
  { n: '1', title: 'Search & build', desc: 'Pick a package; add hotel, transport, ground & flights into one cart.' },
  { n: '2', title: 'Add pilgrims', desc: 'We auto-detect each pilgrim’s visa route from their passport.' },
  { n: '3', title: 'Pay securely', desc: 'Charged in EUR; PKR shown for reference at today’s rate.' },
  { n: '4', title: 'Travel & track', desc: 'Live BRN + visa status, your itinerary and a digital pass.' },
];

export const PACKAGES: Array<{ name: string; meta: string; price: Money; visa: 'e-Visa' | 'Agent'; img: string }> = [
  { name: 'Umrah Premium', meta: '5★ · near Haram · 14 nts', price: { amount: 248000, currency: 'EUR' }, visa: 'e-Visa', img: 'from-green-600 to-green-900' },
  { name: 'Umrah Essential', meta: '4★ · 10 nts · flexible', price: { amount: 169000, currency: 'EUR' }, visa: 'e-Visa', img: 'from-accent-500 to-accent-700' },
  { name: 'Iraq Ziyarat', meta: 'Najaf & Karbala · 9 nts', price: { amount: 212000, currency: 'EUR' }, visa: 'Agent', img: 'from-green-700 to-green-950' },
];

export const LOCALES: Array<{ code: 'en' | 'lt' | 'ur' | 'ar'; label: string; phrase: string; rtl: boolean }> = [
  { code: 'en', label: 'English', phrase: 'Begin a sacred journey, with calm.', rtl: false },
  { code: 'lt', label: 'Lietuvių', phrase: 'Pradėkite šventą kelionę ramiai.', rtl: false },
  { code: 'ur', label: 'اردو', phrase: 'سکون کے ساتھ ایک مقدّس سفر کا آغاز کریں۔', rtl: true },
  { code: 'ar', label: 'العربية', phrase: 'ابدأ رحلتك المقدّسة بسكينة.', rtl: true },
];

export const TESTIMONIALS: Array<{ quote: string; name: string; city: string }> = [
  { quote: 'The visa route was clear from the first screen — no surprises. Everything in one cart.', name: 'Imran A.', city: 'Vilnius' },
  { quote: 'Paid in EUR, saw the PKR figure for my family back home. Beautifully simple.', name: 'Ayesha K.', city: 'Dublin' },
  { quote: 'Live BRN and visa tracking gave my parents real peace of mind.', name: 'Bilal R.', city: 'Warsaw' },
];

export const FAQS: Array<{ q: string; a: string }> = [
  { q: 'Which visa route applies to me?', a: 'We auto-detect it from each pilgrim’s passport: EU/EEA passports use the Saudi e-Visa; Pakistani and other passports route through a MoRA-licensed agent channel. Mixed groups are supported — each pilgrim sees their own route.' },
  { q: 'What currency am I charged in?', a: 'Always EUR. We also show an indicative PKR figure at today’s rate (1 € = ₨310.8) for reference, but the charged amount is never silently converted.' },
  { q: 'Can I book for a group?', a: 'Yes — up to 49 pilgrims in one booking, with per-pilgrim documents and visa routing. Travel agents have a dedicated portal with wallet, credit and markups.' },
  { q: 'How do I track my booking?', a: 'Every booking gets a BRN with a live status timeline (booked → documents → visa → travel → return) and a QR digital pass.' },
];
