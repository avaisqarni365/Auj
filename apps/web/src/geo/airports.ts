// Operating geography for the Smart Planner: every country AUJ serves (Europe + UK + Pakistan)
// and their major airports. Client-safe plain data (no pg). Airport label = "City (IATA)".

export interface AirportRec {
  code: string; // IATA
  city: string;
  country: string;
}

export const airportLabel = (a: AirportRec): string => `${a.city} (${a.code})`;

// Grouped by country, core diaspora markets first, then the rest of Europe alphabetically.
const BY_COUNTRY: Record<string, [string, string][]> = {
  Lithuania: [['VNO', 'Vilnius'], ['KUN', 'Kaunas'], ['PLQ', 'Palanga']],
  Latvia: [['RIX', 'Riga']],
  Estonia: [['TLL', 'Tallinn']],
  Poland: [['WAW', 'Warsaw'], ['WMI', 'Warsaw Modlin'], ['KRK', 'Kraków'], ['GDN', 'Gdańsk'], ['KTW', 'Katowice'], ['WRO', 'Wrocław'], ['POZ', 'Poznań']],
  Germany: [['FRA', 'Frankfurt'], ['MUC', 'Munich'], ['BER', 'Berlin'], ['DUS', 'Düsseldorf'], ['HAM', 'Hamburg'], ['CGN', 'Cologne'], ['STR', 'Stuttgart'], ['HAJ', 'Hanover'], ['NUE', 'Nuremberg']],
  'United Kingdom': [['LHR', 'London Heathrow'], ['LGW', 'London Gatwick'], ['STN', 'London Stansted'], ['LTN', 'London Luton'], ['LCY', 'London City'], ['MAN', 'Manchester'], ['BHX', 'Birmingham'], ['GLA', 'Glasgow'], ['EDI', 'Edinburgh'], ['BRS', 'Bristol'], ['NCL', 'Newcastle'], ['LPL', 'Liverpool'], ['LBA', 'Leeds Bradford']],
  Pakistan: [['KHI', 'Karachi'], ['LHE', 'Lahore'], ['ISB', 'Islamabad'], ['PEW', 'Peshawar'], ['MUX', 'Multan'], ['LYP', 'Faisalabad'], ['SKT', 'Sialkot'], ['UET', 'Quetta'], ['GWD', 'Gwadar'], ['SKZ', 'Sukkur'], ['RYK', 'Rahim Yar Khan'], ['BHV', 'Bahawalpur'], ['DEA', 'Dera Ghazi Khan'], ['TUK', 'Turbat'], ['KDU', 'Skardu'], ['GIL', 'Gilgit'], ['CJL', 'Chitral'], ['PZH', 'Zhob'], ['PJG', 'Panjgur']],
  Ireland: [['DUB', 'Dublin'], ['ORK', 'Cork']],
  France: [['CDG', 'Paris Charles de Gaulle'], ['ORY', 'Paris Orly'], ['NCE', 'Nice'], ['LYS', 'Lyon'], ['MRS', 'Marseille'], ['TLS', 'Toulouse'], ['BOD', 'Bordeaux']],
  Netherlands: [['AMS', 'Amsterdam'], ['EIN', 'Eindhoven'], ['RTM', 'Rotterdam']],
  Belgium: [['BRU', 'Brussels'], ['CRL', 'Brussels Charleroi']],
  Spain: [['MAD', 'Madrid'], ['BCN', 'Barcelona'], ['AGP', 'Málaga'], ['PMI', 'Palma de Mallorca'], ['VLC', 'Valencia'], ['SVQ', 'Seville'], ['ALC', 'Alicante']],
  Italy: [['FCO', 'Rome Fiumicino'], ['MXP', 'Milan Malpensa'], ['BGY', 'Milan Bergamo'], ['LIN', 'Milan Linate'], ['VCE', 'Venice'], ['NAP', 'Naples'], ['BLQ', 'Bologna'], ['CTA', 'Catania']],
  Sweden: [['ARN', 'Stockholm Arlanda'], ['GOT', 'Gothenburg']],
  Denmark: [['CPH', 'Copenhagen'], ['BLL', 'Billund']],
  Finland: [['HEL', 'Helsinki']],
  Norway: [['OSL', 'Oslo'], ['BGO', 'Bergen']],
  Austria: [['VIE', 'Vienna']],
  Switzerland: [['ZRH', 'Zurich'], ['GVA', 'Geneva'], ['BSL', 'Basel']],
  Czechia: [['PRG', 'Prague']],
  Portugal: [['LIS', 'Lisbon'], ['OPO', 'Porto'], ['FAO', 'Faro']],
  Greece: [['ATH', 'Athens'], ['SKG', 'Thessaloniki']],
  Hungary: [['BUD', 'Budapest']],
  Romania: [['OTP', 'Bucharest'], ['CLJ', 'Cluj-Napoca']],
  Bulgaria: [['SOF', 'Sofia']],
  Croatia: [['ZAG', 'Zagreb'], ['SPU', 'Split']],
  Slovakia: [['BTS', 'Bratislava']],
  Slovenia: [['LJU', 'Ljubljana']],
  Luxembourg: [['LUX', 'Luxembourg']],
  Cyprus: [['LCA', 'Larnaca'], ['PFO', 'Paphos']],
  Malta: [['MLA', 'Malta']],
};

export const COUNTRIES: string[] = Object.keys(BY_COUNTRY);

export const AIRPORTS: AirportRec[] = COUNTRIES.flatMap((country) =>
  (BY_COUNTRY[country] ?? []).map(([code, city]) => ({ code, city, country })),
);

export function airportsFor(country: string): AirportRec[] {
  return (BY_COUNTRY[country] ?? []).map(([code, city]) => ({ code, city, country }));
}

/** "Any airport" sentinel value for a country (lets a pilgrim leave the exact airport open). */
export const anyAirport = (country: string): string => `Any airport in ${country}`;

export function countryForAirport(label: string): string | undefined {
  const m = label.match(/^Any airport in (.+)$/);
  if (m) return m[1];
  return AIRPORTS.find((a) => airportLabel(a) === label)?.country;
}

// Combobox options: each country group is led by an "Any airport" entry, then its airports.
export const AIRPORT_COMBO_OPTIONS = COUNTRIES.flatMap((country) => [
  { value: anyAirport(country), label: 'Any airport', hint: 'ANY', group: country, search: `any all ${country}` },
  ...airportsFor(country).map((a) => ({ value: airportLabel(a), label: a.city, hint: a.code, group: country, search: `${a.city} ${a.code} ${a.country}` })),
]);
