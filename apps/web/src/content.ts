// Marketing copy + data for the landing page. Scene imagery resolves via src/scenes.ts.
import type { Money } from '@auj/contracts';
import type { SceneName } from './scenes';

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

export const JOURNEY_TYPES: Array<{ name: string; desc: string; img: string; scene: SceneName }> = [
  { name: 'Umrah', desc: 'Any time of year — flexible nights in Makkah & Madinah with e-Visa guidance.', img: 'from-green-600 to-green-900', scene: 'makkah' },
  { name: 'Hajj', desc: 'Seasonal, Ministry-regulated packages with Nusuk-approved hotels.', img: 'from-accent-500 to-accent-700', scene: 'madinah' },
  { name: 'Ziyarat', desc: 'Guided visits — Najaf, Karbala and the holy sites beyond the Haramain.', img: 'from-green-700 to-green-950', scene: 'ziyarat' },
];

export const STEPS: Array<{ n: string; title: string; desc: string }> = [
  { n: '1', title: 'Search & build', desc: 'Pick a package; add hotel, transport, ground & flights into one cart.' },
  { n: '2', title: 'Add pilgrims', desc: 'We auto-detect each pilgrim’s visa route from their passport.' },
  { n: '3', title: 'Pay securely', desc: 'Charged in EUR; PKR shown for reference at today’s rate.' },
  { n: '4', title: 'Travel & track', desc: 'Live BRN + visa status, your itinerary and a digital pass.' },
];

export const PACKAGES: Array<{ name: string; meta: string; price: Money; visa: 'e-Visa' | 'Agent'; img: string; scene: SceneName }> = [
  { name: 'Umrah Premium', meta: '5★ · near Haram · 14 nts', price: { amount: 248000, currency: 'EUR' }, visa: 'e-Visa', img: 'from-green-600 to-green-900', scene: 'makkah' },
  { name: 'Umrah Essential', meta: '4★ · 10 nts · flexible', price: { amount: 169000, currency: 'EUR' }, visa: 'e-Visa', img: 'from-accent-500 to-accent-700', scene: 'madinah' },
  { name: 'Iraq Ziyarat', meta: 'Najaf & Karbala · 9 nts', price: { amount: 212000, currency: 'EUR' }, visa: 'Agent', img: 'from-green-700 to-green-950', scene: 'ziyarat' },
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
  { q: 'Do you offer Hajj and general travel, not just Umrah?', a: 'Yes. Alongside Umrah and Ziyarat, AUJ books Ministry-regulated Hajj and ordinary leisure travel — hotels and flights — through the same cart. The general-travel leg has no Saudi dependency.' },
  { q: 'Can travel agents sell through AUJ?', a: 'Yes. The agent portal gives your agency a wallet, a credit limit, configurable markups, multi-pilgrim booking and reconciling statements. Register, and an administrator approves your account.' },
];

// ── Landing feature blocks modelled on the dynamic-packaging Umrah platforms ──
// Prices/hotel names/cities/details are DATA (not localised, like PACKAGES). The
// titles/descriptions/labels live in the "landing" message catalogs (all 4 locales).

// "This week's exclusive deals" — dynamic-packaging cards (named Makkah+Madinah hotels).
export interface Deal {
  id: string;
  days: number;
  makkahHotel: string;
  makkahNights: number;
  madinahHotel: string;
  madinahNights: number;
  from: string;
  price: Money;
  scene: SceneName;
}

// Fallback deals (used when the connector returns nothing — keeps the section non-empty offline).
export const DEALS: Deal[] = [
  { id: 'budget-vno', days: 10, makkahHotel: 'Dar Al Eiman Royal', makkahNights: 6, madinahHotel: 'Al Eiman Taibah', madinahNights: 3, from: 'Vilnius (VNO)', price: { amount: 45000, currency: 'EUR' }, scene: 'makkah' },
  { id: 'premium-waw', days: 14, makkahHotel: 'Swissôtel Al Maqam', makkahNights: 9, madinahHotel: 'Anwar Al Madinah Mövenpick', madinahNights: 4, from: 'Warsaw (WAW)', price: { amount: 118300, currency: 'EUR' }, scene: 'madinah' },
  { id: 'ramadan-dub', days: 12, makkahHotel: 'Conrad Makkah', makkahNights: 7, madinahHotel: 'Dar Al Hijra InterContinental', madinahNights: 4, from: 'Dublin (DUB)', price: { amount: 58900, currency: 'EUR' }, scene: 'makkah' },
];

// "Why book with AUJ" value props + "Experience the difference" service blocks — icons
// only; titles/desc come from the catalogs (landing.valueProps / landing.features arrays).
export const VALUE_ICONS = ['⚡', '🛒', '🏷️', '🛡️'] as const;
export const FEATURE_ICONS = ['🏨', '✈️', '🧩', '🎧'] as const;

// Departure directory — region labels are localised (landing.departures[]); cities are data.
export const DEPARTURES_GRID: Array<{ cities: string[] }> = [
  { cities: ['Vilnius', 'Riga', 'Tallinn', 'Kaunas'] },
  { cities: ['Warsaw', 'Berlin', 'Vienna', 'Prague'] },
  { cities: ['Dublin', 'Amsterdam', 'Brussels', 'Paris'] },
];

// Support channels — channel name localised (landing.support[].channel); detail is data.
export const SUPPORT_CHANNELS: Array<{ icon: string; detail: string }> = [
  { icon: '📞', detail: '+370 5 214 0001' },
  { icon: '💬', detail: '+370 600 30000' },
  { icon: '✉️', detail: 'help@auj.codes-ai.uk' },
  { icon: '🗨️', detail: 'In your account' },
];

// Accepted payment methods (display only).
export const PAYMENT_METHODS = ['Visa', 'Mastercard', 'American Express', 'SEPA', 'PKR gateway'];

// AUJ contact + social (footer). PLACEHOLDERS — replace with AUJ's verified details before
// launch. AUJ is an EU/Lithuanian operator (insolvency-protection model, NOT UK ATOL), so
// no ATOL/IATA numbers here. Company registration + registered address are intentionally
// omitted until provided — never invent or borrow another operator's legal identity.
export const AUJ_CONTACT = {
  email: 'hello@auj.codes-ai.uk',
  phone: '+370 5 214 0001',
  location: 'Vilnius, Lithuania',
};
export const SOCIALS: Array<{ label: string; icon: string; href: string }> = [
  { label: 'Instagram', icon: '◎', href: '#' },
  { label: 'Facebook', icon: 'f', href: '#' },
  { label: 'WhatsApp', icon: '✆', href: '#' },
];

// ── Cinematic landing data (ported from "AUJ Landing Cinematic.dc.html") ──────────────────
// Trust marquee badges (doubled track in the UI).
export const TRUST_MARQUEE = ['IATA accredited', 'GDPR compliant', 'SEPA secure payments', 'Licensed pilgrimage operator', 'ATOL-style bonded'];

// Hero "FRAME 01 · SMART PLANNER" glance tiles: [label, value, mono?].
export const GLANCE_TILES: Array<[string, string, boolean]> = [
  ['Journey', 'Umrah', false],
  ['From', 'Vilnius (VNO)', false],
  ['Dates', '12–26 Sep · 14 nts', false],
  ['Pilgrims', '4 travellers', false],
  ['Visa route', 'e-Visa · EU', false],
  ['Est. total', '€9,920', true],
];

// The frame sequence (frames 02–18) — each links to its migrated route.
export interface LandingFrame {
  n: string;
  name: string;
  tag: string;
  icon: string;
  href: string;
  title: string;
  blurb: string;
  cta: string;
}
export const LANDING_FRAMES: LandingFrame[] = [
  { n: '02', name: 'VIRTUAL TOUR', tag: '15 guided steps', icon: '🌅', href: '/guide/tour', title: 'Walk through every rite', blurb: 'A guided panorama of each Umrah step, narrated in your language.', cta: 'Open virtual tour' },
  { n: '03', name: 'SEARCH', tag: 'EUR · PKR', icon: '🔎', href: '/book', title: 'Search verified packages', blurb: 'Hotels by distance to the Haram — charged in EUR with an indicative PKR total.', cta: 'Search packages' },
  { n: '04', name: 'LUGGAGE WIZARD', tag: 'customs rules', icon: '🧳', href: '/guide/luggage', title: 'Pack right, clear customs', blurb: 'What’s allowed, what to declare, what’s prohibited — Saudi customs at a glance.', cta: 'Open luggage guide' },
  { n: '05', name: 'AIRPORT WIZARD', tag: '7 steps', icon: '✈️', href: '/guide/airport', title: 'Check-in to your hotel', blurb: 'Every airport step from bag-drop to your transfer, bilingual.', cta: 'Open airport guide' },
  { n: '06', name: 'MAKKAH ZIYARAT', tag: '16 sites', icon: '🕋', href: '/guide/makkah-ziyarat', title: 'Sacred sites of Makkah', blurb: 'Sixteen ziyarat sites with context and a clip on each.', cta: 'Open Makkah ziyarat' },
  { n: '07', name: 'MADINAH ZIYARAT', tag: '14 sites', icon: '🕌', href: '/guide/madina-ziyarat', title: 'Sacred sites of Madinah', blurb: 'Fourteen ziyarat sites around the Prophet’s city ﷺ.', cta: 'Open Madinah ziyarat' },
  { n: '08', name: 'MAKKAH HOTELS', tag: 'near the Haram', icon: '🏨', href: '/book?city=MAKKAH', title: 'Stay near the Haram', blurb: 'Nusuk-approved hotels sorted by distance to Masjid al-Haram.', cta: 'Find Makkah hotels' },
  { n: '09', name: 'MADINAH HOTELS', tag: 'near an-Nabawi', icon: '🏨', href: '/book?city=MADINAH', title: 'Stay by an-Nabawi', blurb: 'Hotels steps from Masjid an-Nabawi, net rates in EUR.', cta: 'Find Madinah hotels' },
  { n: '10', name: 'FOOD & DINING', tag: 'by city', icon: '🍽️', href: '/guide/food', title: 'Where to eat', blurb: 'Trusted bites near the Haram, desi favourites and online orders.', cta: 'Open food guide' },
  { n: '11', name: 'HOSPITALS & CARE', tag: 'free for pilgrims', icon: '🏥', href: '/guide/hospitals', title: 'Health & emergencies', blurb: 'Hospitals, clinics and what to do if you fall ill.', cta: 'Open hospitals guide' },
  { n: '12', name: 'TRANSPORT', tag: 'fares', icon: '🚌', href: '/guide/transport', title: 'Getting around', blurb: 'Haramain rail, taxis and transfers with indicative fares.', cta: 'Open transport guide' },
  { n: '13', name: 'LAUNDRY', tag: 'by city', icon: '🧺', href: '/guide/laundry', title: 'Laundry & essentials', blurb: 'Where to wash and refresh between rites.', cta: 'Open laundry guide' },
  { n: '14', name: 'GIFTS & SHOPPING', tag: '3 cities', icon: '🎁', href: '/guide/gifts', title: 'Gifts, dates & Zamzam', blurb: 'Souqs and gift ideas across Makkah, Madinah and Jeddah.', cta: 'Open gifts guide' },
  { n: '15', name: 'DAY PLANNER', tag: 'jamaat-anchored', icon: '🕌', href: '/plan/day', title: 'Plan each day', blurb: 'A calm daily rhythm anchored to the Haram jamaat, ±15 min.', cta: 'Open day planner' },
  { n: '16', name: 'PERSONAL DIARY', tag: 'private', icon: '📿', href: '/companion/diary', title: 'Your spiritual journal', blurb: 'Quran, nafl and dua counters with a daily reflection.', cta: 'Open diary' },
  { n: '17', name: 'HELPLINE & SOS', tag: '24/7', icon: '🆘', href: '/guide/helpline', title: 'Help when you need it', blurb: 'Emergency numbers, official apps and lost-and-found.', cta: 'Open helpline' },
  { n: '18', name: 'CONNECTIVITY', tag: 'SIM · eSIM', icon: '📶', href: '/guide/connectivity', title: 'Stay connected', blurb: 'SIM, eSIM and the apps to set up before you fly.', cta: 'Open connectivity' },
];
