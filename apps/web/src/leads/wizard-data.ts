// Static option data for the Smart Visit wizard. Proper nouns (countries, airports, ziyarah
// sites) are data, not localized — like package/hotel names elsewhere. The structural labels
// (step titles, field labels, buttons) live in the "smartvisit" i18n namespace.

// AUJ departs from across Europe + Pakistan. One or more main international airports per country.
const A = (code: string, city: string) => ({ code, city });
export const COUNTRIES: Array<{ code: string; name: string; airports: Array<{ code: string; city: string }> }> = [
  // Baltics & Nordics
  { code: 'LT', name: 'Lithuania', airports: [A('VNO', 'Vilnius'), A('KUN', 'Kaunas')] },
  { code: 'LV', name: 'Latvia', airports: [A('RIX', 'Riga')] },
  { code: 'EE', name: 'Estonia', airports: [A('TLL', 'Tallinn')] },
  { code: 'FI', name: 'Finland', airports: [A('HEL', 'Helsinki')] },
  { code: 'SE', name: 'Sweden', airports: [A('ARN', 'Stockholm'), A('GOT', 'Gothenburg')] },
  { code: 'NO', name: 'Norway', airports: [A('OSL', 'Oslo')] },
  { code: 'DK', name: 'Denmark', airports: [A('CPH', 'Copenhagen')] },
  { code: 'IS', name: 'Iceland', airports: [A('KEF', 'Reykjavík')] },
  // Western Europe
  { code: 'GB', name: 'United Kingdom', airports: [A('LHR', 'London'), A('MAN', 'Manchester'), A('BHX', 'Birmingham')] },
  { code: 'IE', name: 'Ireland', airports: [A('DUB', 'Dublin')] },
  { code: 'FR', name: 'France', airports: [A('CDG', 'Paris'), A('LYS', 'Lyon'), A('MRS', 'Marseille')] },
  { code: 'NL', name: 'Netherlands', airports: [A('AMS', 'Amsterdam')] },
  { code: 'BE', name: 'Belgium', airports: [A('BRU', 'Brussels')] },
  { code: 'LU', name: 'Luxembourg', airports: [A('LUX', 'Luxembourg')] },
  { code: 'DE', name: 'Germany', airports: [A('FRA', 'Frankfurt'), A('MUC', 'Munich'), A('BER', 'Berlin'), A('DUS', 'Düsseldorf')] },
  { code: 'CH', name: 'Switzerland', airports: [A('ZRH', 'Zürich'), A('GVA', 'Geneva')] },
  { code: 'AT', name: 'Austria', airports: [A('VIE', 'Vienna')] },
  // Southern Europe
  { code: 'ES', name: 'Spain', airports: [A('MAD', 'Madrid'), A('BCN', 'Barcelona')] },
  { code: 'PT', name: 'Portugal', airports: [A('LIS', 'Lisbon')] },
  { code: 'IT', name: 'Italy', airports: [A('FCO', 'Rome'), A('MXP', 'Milan')] },
  { code: 'GR', name: 'Greece', airports: [A('ATH', 'Athens')] },
  { code: 'MT', name: 'Malta', airports: [A('MLA', 'Malta')] },
  { code: 'CY', name: 'Cyprus', airports: [A('LCA', 'Larnaca')] },
  // Central & Eastern Europe
  { code: 'PL', name: 'Poland', airports: [A('WAW', 'Warsaw'), A('KRK', 'Kraków')] },
  { code: 'CZ', name: 'Czechia', airports: [A('PRG', 'Prague')] },
  { code: 'SK', name: 'Slovakia', airports: [A('BTS', 'Bratislava')] },
  { code: 'HU', name: 'Hungary', airports: [A('BUD', 'Budapest')] },
  { code: 'RO', name: 'Romania', airports: [A('OTP', 'Bucharest')] },
  { code: 'BG', name: 'Bulgaria', airports: [A('SOF', 'Sofia')] },
  { code: 'SI', name: 'Slovenia', airports: [A('LJU', 'Ljubljana')] },
  { code: 'HR', name: 'Croatia', airports: [A('ZAG', 'Zagreb')] },
  // Balkans
  { code: 'RS', name: 'Serbia', airports: [A('BEG', 'Belgrade')] },
  { code: 'BA', name: 'Bosnia and Herzegovina', airports: [A('SJJ', 'Sarajevo')] },
  { code: 'XK', name: 'Kosovo', airports: [A('PRN', 'Pristina')] },
  { code: 'MK', name: 'North Macedonia', airports: [A('SKP', 'Skopje')] },
  { code: 'AL', name: 'Albania', airports: [A('TIA', 'Tirana')] },
  { code: 'TR', name: 'Türkiye', airports: [A('IST', 'Istanbul'), A('SAW', 'Istanbul-Sabiha')] },
  // Pakistan
  { code: 'PK', name: 'Pakistan', airports: [A('ISB', 'Islamabad'), A('LHE', 'Lahore'), A('KHI', 'Karachi')] },
  { code: 'OTHER', name: 'Other / not listed', airports: [] },
];

export const HOTEL_BANDS = ['≤300 m', '≤800 m', '≤2 km', 'Any distance'] as const;

export const MAKKAH_ZIYARAH = ['Jabal al-Nour (Hira)', 'Mina', 'Arafat', 'Muzdalifah', 'Jabal Thawr', "Jannat al-Mu'alla"];
export const MADINAH_ZIYARAH = ['Quba Mosque', 'Mount Uhud', 'Qiblatain Mosque', 'Trench (Khandaq)', "Jannat al-Baqi'", 'Date farms'];

export const airportsFor = (countryCode: string): Array<{ code: string; city: string }> =>
  COUNTRIES.find((c) => c.code === countryCode)?.airports ?? [];
