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
  { cities: ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Multan', 'Sialkot'] },
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

// The frame sequence (frames 02–18) — two-panel feature cards ported 1:1 from the prototype.
// Each links to its real migrated route. accent = preview-panel tone (token gradients).
export type FrameAccent = 'green' | 'blue' | 'gold' | 'red';
export interface LandingFrame {
  n: string;
  name: string; // mono header label
  tag: string; // header pill
  icon: string;
  accent: FrameAccent;
  kicker: string; // mono line on the preview panel
  punch: string; // serif headline on the preview panel
  caption: string; // mono caption on the preview panel
  heading: string; // white-panel h3
  blurb: string;
  chips: string[];
  cta: string;
  href: string;
}
export const LANDING_FRAMES: LandingFrame[] = [
  { n: '02', name: 'VIRTUAL TOUR', tag: '15 guided steps', icon: '🌅', accent: 'green', kicker: 'WALK EACH RITE', punch: 'See every step before you go', caption: 'EN · العربية · WITH VIDEO', heading: 'Virtual tour', blurb: 'A guided panorama of every Umrah step with narration and a short video on each — preview the whole journey before you travel.', chips: ['Ihram', 'Tawaf', 'Saʿi'], cta: 'Open virtual tour', href: '/guide/tour' },
  { n: '03', name: 'SEARCH', tag: 'EUR · PKR', icon: '🔎', accent: 'blue', kicker: 'VERIFIED CATALOGUE', punch: 'Search packages & hotels', caption: 'CHARGED IN EUR · PKR SHOWN', heading: 'Search packages', blurb: 'Search the verified catalogue by city, dates and pilgrims — hotels by distance to the Haram, priced in EUR with an indicative PKR total.', chips: ['By distance', 'e-Visa', 'From €'], cta: 'Search packages', href: '/book' },
  { n: '04', name: 'LUGGAGE WIZARD', tag: '8 steps · video', icon: '🧳', accent: 'green', kicker: 'CHECK-IN → CHECK-OUT', punch: 'What you can pack, by the rules', caption: 'SAUDI CUSTOMS · EN · العربية', heading: 'Luggage & packing guide', blurb: 'A step-by-step guide from check-in to check-out — what you can bring, what to declare and what is prohibited, with a short video on every step.', chips: ['Allowed', 'Declare', 'Prohibited'], cta: 'Open luggage wizard', href: '/guide/luggage' },
  { n: '05', name: 'AIRPORT WIZARD', tag: '7 steps · video', icon: '✈️', accent: 'blue', kicker: 'VILNIUS → JEDDAH / MADINAH', punch: 'From check-in to your hotel transfer', caption: 'ARRIVAL GUIDE · EN · العربية', heading: 'Airport wizard', blurb: 'Every airport step — check-in, security, boarding, the flight, immigration, baggage and your transfer — with a video and a “have ready” checklist on each.', chips: ['Check-in', 'Immigration', 'Transfer'], cta: 'Open airport wizard', href: '/guide/airport' },
  { n: '06', name: 'MAKKA ZIYARAT', tag: '16 sites · video', icon: '🕋', accent: 'green', kicker: 'SACRED SITES OF MAKKAH', punch: 'The Haram, holy sites & museums', caption: 'EN · العربية · WITH VIDEO', heading: 'Makka Ziyarat', blurb: 'Every sacred place of Makkah in one guide — Masjid al-Haram, the Kaaba, Safa & Marwah, Mina, Arafat and more — with a short video on each site.', chips: ['Masjid al-Haram', 'Safa & Marwah', 'Museums'], cta: 'Open Makka ziyarat', href: '/guide/makkah-ziyarat' },
  { n: '07', name: 'MADINA ZIYARAT', tag: '14 sites · video', icon: '🕌', accent: 'green', kicker: 'SACRED SITES OF MADINAH', punch: 'An-Nabawi, Rawdah & holy sites', caption: 'EN · العربية · WITH VIDEO', heading: 'Madina Ziyarat', blurb: 'The sacred places of Madinah — Masjid an-Nabawi, the Rawdah, Quba, Uhud and the heritage sites — each with context and a short video.', chips: ['An-Nabawi', 'Rawdah', 'Quba & Uhud'], cta: 'Open Madina ziyarat', href: '/guide/madina-ziyarat' },
  { n: '08', name: 'MAKKAH HOTELS', tag: 'by distance', icon: '🏨', accent: 'gold', kicker: 'NEAR MASJID AL-HARAM', punch: 'Famous hotels, by walking distance', caption: '0–250 M → SHUTTLE · REAL NAMES', heading: 'Hotels in Makkah', blurb: 'Browse real, famous hotels grouped by distance to the Haram — from the Clock Tower towers and Jabal Omar down to value stays with a shuttle.', chips: ['0–250 m', 'Jabal Omar', 'Shuttle'], cta: 'Open Makkah hotels', href: '/hotels/makkah' },
  { n: '09', name: 'MADINA HOTELS', tag: 'by distance', icon: '🏨', accent: 'blue', kicker: 'NEAR MASJID AN-NABAWI', punch: 'Stays around the Prophet’s Mosque', caption: 'CENTRAL → SHUTTLE · REAL NAMES', heading: 'Hotels in Madinah', blurb: 'Real, famous hotels by distance to Masjid an-Nabawi — from the central Piazza by the Haram to comfortable outer-district stays with a shuttle.', chips: ['Central Piazza', 'Outer ring', 'Shuttle'], cta: 'Open Madinah hotels', href: '/hotels/madinah' },
  { n: '10', name: 'FOOD & DINING', tag: 'Makkah & Madinah', icon: '🍽️', accent: 'green', kicker: 'GOOD EATS & ONLINE ORDERS', punch: 'Restaurants & food delivery', caption: 'DESI · ARAB · TURKISH · CAFÉS', heading: 'Food & dining', blurb: 'Good restaurants near the Haram in both cities — Desi, Arab, Turkish and cafés — plus the delivery apps to order straight to your hotel.', chips: ['Near the Haram', 'Desi & Arab', 'Order online'], cta: 'Open food guide', href: '/guide/food' },
  { n: '11', name: 'HOSPITALS & CARE', tag: 'Makkah & Madinah', icon: '🏥', accent: 'red', kicker: 'EMERGENCY · 997 / 911', punch: 'Hospitals, clinics & pharmacies', caption: 'GOVT · PRIVATE · 24H PHARMACIES', heading: 'Hospitals & care', blurb: 'Emergency numbers and the main hospitals, private clinics and 24-hour pharmacies in Makkah and Madinah — so you always know where to go.', chips: ['Emergency 997', 'Hospitals', '24h pharmacy'], cta: 'Open hospitals guide', href: '/guide/hospitals' },
  { n: '12', name: 'TRANSPORT', tag: 'options · fares', icon: '🚌', accent: 'blue', kicker: 'GETTING AROUND · FARES', punch: 'Rail, ride-hailing, buses & taxis', caption: 'HARAMAIN RAIL · CAREEM · SAPTCO', heading: 'Transport', blurb: 'Every way to move — the Haramain high-speed train, airport transfers, ride-hailing, coaches, local buses and private cars — with indicative fares.', chips: ['Haramain rail', 'Ride-hailing', 'Fares'], cta: 'Open transport guide', href: '/guide/transport' },
  { n: '13', name: 'LAUNDRY', tag: 'Makkah & Madinah', icon: '🧺', accent: 'blue', kicker: 'WASH · IRON · PICKUP', punch: 'Clean ihram & clothes, fast', caption: 'SHOPS · EXPRESS · PICKUP APPS', heading: 'Laundry', blurb: 'Where to wash, iron and dry-clean in both cities — hotel laundry, walk-in shops near the Haram, express & 24-hour, and pickup apps.', chips: ['Near the Haram', 'Express 24h', 'Pickup apps'], cta: 'Open laundry guide', href: '/guide/laundry' },
  { n: '14', name: 'GIFTS & SHOPPING', tag: 'Makkah · Madinah · Jeddah', icon: '🎁', accent: 'gold', kicker: 'DATES · ZAMZAM · GIFTS', punch: 'Dates, Zamzam & souvenirs', caption: 'MAKKAH · MADINAH · JEDDAH', heading: 'Gifts & shopping', blurb: 'Where to buy the famous gifts — sealed Zamzam, Ajwa and dates, attar, prayer mats and souvenirs — across the three cities, plus online options.', chips: ['Dates & Zamzam', 'Souqs & malls', 'Order online'], cta: 'Open gifts guide', href: '/guide/gifts' },
  { n: '15', name: 'DAY PLANNER', tag: 'jamaat times · weather', icon: '🕌', accent: 'green', kicker: 'DAWN TO NIGHT', punch: 'Your day, by jamaat times', caption: 'HOURLY TEMPERATURE · ADJUSTABLE', heading: 'Day planner', blurb: 'A full day mapped around the Haram jamaat — wake-up, prayers, meals and activities — with the hour-by-hour temperature and a one-tap time adjust.', chips: [], cta: 'Open day planner', href: '/plan/day' },
  { n: '16', name: 'PERSONAL DIARY', tag: 'saved on device', icon: '📿', accent: 'green', kicker: 'QURAN · NAFL · DUA', punch: 'Your spiritual journal', caption: 'PRIVATE · CUSTOM TO YOU', heading: 'Personal diary', blurb: 'Track your Quran target, nafl & sunnah prayers and dua list, and write daily reflections — saved privately and personal to you.', chips: [], cta: 'Open personal diary', href: '/companion/diary' },
  { n: '17', name: 'HELPLINE & SOS', tag: '997 · 911 · 937', icon: '🆘', accent: 'red', kicker: 'EMERGENCY · REGISTER', punch: 'Helplines & what to do', caption: 'EMBASSY · LOST & FOUND', heading: 'Helpline & SOS', blurb: 'All the emergency numbers, the official apps to register, embassy guidance, and what to do if you are separated from your group.', chips: [], cta: 'Open helpline guide', href: '/guide/helpline' },
  { n: '18', name: 'CONNECTIVITY', tag: 'SIM · wifi · location', icon: '📶', accent: 'blue', kicker: 'SIM · INTERNET · LOCATION', punch: 'Stay connected to home', caption: 'STC · WHATSAPP · NUSUK', heading: 'Connectivity', blurb: 'SIM & eSIM options, data and wifi, staying in touch with home, live location sharing for the crowds, and every official Saudi website and app.', chips: [], cta: 'Open connectivity guide', href: '/guide/connectivity' },
];
