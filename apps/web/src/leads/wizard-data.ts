// Static option data for the Smart Visit wizard. Proper nouns (countries, airports, ziyarah
// sites) are data, not localized — like package/hotel names elsewhere. The structural labels
// (step titles, field labels, buttons) live in the "smartvisit" i18n namespace.

export const COUNTRIES: Array<{ code: string; name: string; airports: Array<{ code: string; city: string }> }> = [
  { code: 'LT', name: 'Lithuania', airports: [{ code: 'VNO', city: 'Vilnius' }, { code: 'KUN', city: 'Kaunas' }] },
  { code: 'PL', name: 'Poland', airports: [{ code: 'WAW', city: 'Warsaw' }, { code: 'KRK', city: 'Kraków' }] },
  { code: 'DE', name: 'Germany', airports: [{ code: 'FRA', city: 'Frankfurt' }, { code: 'BER', city: 'Berlin' }, { code: 'MUC', city: 'Munich' }] },
  { code: 'IE', name: 'Ireland', airports: [{ code: 'DUB', city: 'Dublin' }] },
  { code: 'NL', name: 'Netherlands', airports: [{ code: 'AMS', city: 'Amsterdam' }] },
  { code: 'FR', name: 'France', airports: [{ code: 'CDG', city: 'Paris' }] },
  { code: 'GB', name: 'United Kingdom', airports: [{ code: 'LHR', city: 'London' }, { code: 'MAN', city: 'Manchester' }] },
  { code: 'PK', name: 'Pakistan', airports: [{ code: 'ISB', city: 'Islamabad' }, { code: 'LHE', city: 'Lahore' }, { code: 'KHI', city: 'Karachi' }] },
  { code: 'OTHER', name: 'Other / not listed', airports: [] },
];

export const HOTEL_BANDS = ['≤300 m', '≤800 m', '≤2 km', 'Any distance'] as const;

export const MAKKAH_ZIYARAH = ['Jabal al-Nour (Hira)', 'Mina', 'Arafat', 'Muzdalifah', 'Jabal Thawr', "Jannat al-Mu'alla"];
export const MADINAH_ZIYARAH = ['Quba Mosque', 'Mount Uhud', 'Qiblatain Mosque', 'Trench (Khandaq)', "Jannat al-Baqi'", 'Date farms'];

export const airportsFor = (countryCode: string): Array<{ code: string; city: string }> =>
  COUNTRIES.find((c) => c.code === countryCode)?.airports ?? [];
