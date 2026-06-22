// Curated hotel directory by distance band, from AUJ Makkah Hotels.dc.html / AUJ Madina Hotels.dc.html.
// Server-side reference data (no client import of anything pg-bearing). Distances are walking
// bands from the holy mosque; EUR is the charged currency — pricing happens in the booking funnel.

export type Hotel = { name: string; stars: string; note: string; dist: string };
export type HotelBand = { short: string; dist: string; walk: string; area: string; name: string; hotels: Hotel[] };
export type HotelCity = 'makkah' | 'madinah';
export type CityHotels = { slug: HotelCity; title: string; mosque: string; bands: HotelBand[] };

export const HOTEL_CITIES: HotelCity[] = ['makkah', 'madinah'];
export const isHotelCity = (s: string): s is HotelCity => (HOTEL_CITIES as string[]).includes(s);

const MAKKAH: CityHotels = {
  slug: 'makkah',
  title: 'Makkah hotels',
  mosque: 'Masjid al-Haram',
  bands: [
    {
      short: '0–250 m', dist: '0 – 250 m', walk: '2–4 min walk', area: 'Haram-front · Abraj Al Bait (Clock Tower) complex', name: 'HARAM-FRONT',
      hotels: [
        { name: 'Makkah Clock Royal Tower, Fairmont', stars: '5★', note: 'Abraj Al Bait · Haram view', dist: 'at Haram' },
        { name: 'Raffles Makkah Palace', stars: '5★', note: 'Clock Tower complex', dist: '~120 m' },
        { name: 'Pullman ZamZam Makkah', stars: '5★', note: 'Abraj Al Bait', dist: '~160 m' },
        { name: 'Swissôtel Makkah', stars: '5★', note: 'Abraj Al Bait', dist: '~190 m' },
        { name: 'Al Marwa Rayhaan by Rotana', stars: '5★', note: 'Abraj Al Bait', dist: '~210 m' },
        { name: 'Mövenpick Hotel Hajar Tower Makkah', stars: '5★', note: 'Abraj Al Bait', dist: '~230 m' },
        { name: 'Anjum Hotel Makkah', stars: '4★', note: 'Abraj Al Bait', dist: '~240 m' },
      ],
    },
    {
      short: '250–500 m', dist: '250 – 500 m', walk: '5–7 min walk', area: 'Jabal Omar district, west of the Haram', name: 'JABAL OMAR',
      hotels: [
        { name: 'Conrad Makkah', stars: '5★', note: 'Jabal Omar', dist: '~300 m' },
        { name: 'Hilton Makkah Convention Hotel', stars: '5★', note: 'Jabal Omar', dist: '~320 m' },
        { name: 'Jabal Omar Hyatt Regency Makkah', stars: '5★', note: 'Jabal Omar', dist: '~380 m' },
        { name: 'Makkah Marriott Hotel Jabal Omar', stars: '5★', note: 'Jabal Omar', dist: '~400 m' },
        { name: 'Address Jabal Omar Makkah', stars: '5★', note: 'Jabal Omar', dist: '~430 m' },
        { name: 'DoubleTree by Hilton Jabal Omar', stars: '4★', note: 'Jabal Omar', dist: '~460 m' },
        { name: 'Hilton Suites Makkah', stars: '5★', note: 'King Abdul Aziz Endowment', dist: '~480 m' },
      ],
    },
    {
      short: '500 m–1 km', dist: '500 m – 1 km', walk: '8–12 min walk', area: 'Ajyad & Misfalah, south of the Haram', name: 'AJYAD · MISFALAH',
      hotels: [
        { name: 'Dar Al Tawhid InterContinental Makkah', stars: '5★', note: 'Ibrahim Al Khalil Rd', dist: '~550 m' },
        { name: 'Sheraton Makkah Jabal Al Kaaba', stars: '5★', note: 'Jabal Al Kaaba', dist: '~650 m' },
        { name: 'Makkah Hotel (Elaf)', stars: '4★', note: 'Umm Al Qura Rd', dist: '~700 m' },
        { name: 'voco Makkah', stars: '4★', note: 'Ajyad', dist: '~800 m' },
        { name: 'M Hotel Makkah by Millennium', stars: '4★', note: 'Ajyad', dist: '~850 m' },
        { name: 'Makarem Ajyad Makkah', stars: '4★', note: 'Ajyad', dist: '~950 m' },
      ],
    },
    {
      short: '1–2 km', dist: '1 – 2 km', walk: 'Shuttle or 15–25 min', area: 'Misfalah, Shisha & Al Naseem', name: 'MISFALAH · AL NASEEM',
      hotels: [
        { name: 'Le Méridien Makkah', stars: '5★', note: 'Jabal Al Kaaba', dist: '~1.1 km' },
        { name: 'Elaf Kinda Hotel', stars: '4★', note: 'Ibrahim Al Khalil Rd', dist: '~1.2 km' },
        { name: 'Four Points by Sheraton Makkah Al Naseem', stars: '4★', note: 'Al Naseem · shuttle', dist: '~1.6 km' },
        { name: 'Holiday Inn Makkah Al Aziziah', stars: '4★', note: 'Aziziyah · shuttle', dist: '~1.8 km' },
        { name: 'Snood Ajyad Makkah', stars: '3★', note: 'Ajyad', dist: '~1.4 km' },
      ],
    },
    {
      short: 'Shuttle', dist: '3 – 6 km', walk: 'Free hotel shuttle bus', area: 'Aziziyah & Kudai — value stays with shuttle service', name: 'AZIZIYAH · KUDAI',
      hotels: [
        { name: 'Grand Plaza Gardenia Aziziah', stars: '4★', note: 'Aziziyah · shuttle', dist: '~3.5 km' },
        { name: 'ibis Styles Makkah', stars: '3★', note: 'Aziziyah · shuttle', dist: '~4 km' },
        { name: 'Boudl Al Aziziah', stars: '3★', note: 'Aziziyah · shuttle', dist: '~4.5 km' },
        { name: 'Aziziyah apartment hotels', stars: 'APT', note: 'Family suites · shuttle', dist: '3–6 km' },
      ],
    },
  ],
};

const MADINAH: CityHotels = {
  slug: 'madinah',
  title: 'Madinah hotels',
  mosque: 'the Prophet’s Mosque',
  bands: [
    {
      short: '0–250 m', dist: '0 – 250 m', walk: '2–4 min walk', area: 'Central Piazza, facing the Prophet’s Mosque', name: 'CENTRAL · PIAZZA',
      hotels: [
        { name: 'The Oberoi Madina', stars: '5★', note: 'Central area · Haram view', dist: 'at Haram' },
        { name: 'Dar Al Taqwa Hotel', stars: '5★', note: 'Central Piazza', dist: '~120 m' },
        { name: 'Anwar Al Madinah Mövenpick', stars: '5★', note: 'Central Piazza', dist: '~150 m' },
        { name: 'Pullman Zamzam Madina', stars: '5★', note: 'Central Piazza', dist: '~180 m' },
        { name: 'InterContinental Dar Al Iman Madinah', stars: '5★', note: 'Central Piazza', dist: '~200 m' },
        { name: 'Madinah Hilton', stars: '5★', note: 'King Fahd Gate side', dist: '~220 m' },
        { name: 'Shaza Al Madina', stars: '5★', note: 'Central area', dist: '~240 m' },
      ],
    },
    {
      short: '250–500 m', dist: '250 – 500 m', walk: '5–7 min walk', area: 'Central ring around the mosque', name: 'CENTRAL RING',
      hotels: [
        { name: 'Crowne Plaza Madinah', stars: '5★', note: 'Central ring', dist: '~300 m' },
        { name: 'Millennium Al Aqeeq Hotel', stars: '5★', note: 'King Abdulaziz Rd', dist: '~340 m' },
        { name: 'Millennium Taiba Hotel', stars: '4★', note: 'Central ring', dist: '~380 m' },
        { name: 'Dallah Taibah Hotel', stars: '4★', note: 'Central ring', dist: '~420 m' },
        { name: 'Elaf Taibah Hotel', stars: '4★', note: 'Central ring', dist: '~450 m' },
        { name: 'Frontel Al Harithia', stars: '4★', note: 'Central ring', dist: '~480 m' },
      ],
    },
    {
      short: '500 m–1 km', dist: '500 m – 1 km', walk: '8–12 min walk', area: 'Outer ring · King Fahd & Sultanah roads', name: 'OUTER RING',
      hotels: [
        { name: 'Madinah Marriott Hotel', stars: '5★', note: 'King Abdulaziz Rd', dist: '~600 m' },
        { name: 'Courtyard by Marriott Madinah', stars: '4★', note: 'King Abdulaziz Rd', dist: '~700 m' },
        { name: 'Four Points by Sheraton Madinah', stars: '4★', note: 'Outer ring', dist: '~800 m' },
        { name: 'Saja Al Madinah Hotel', stars: '4★', note: 'Outer ring', dist: '~850 m' },
        { name: 'Grand Plaza Badr Al Maqam', stars: '4★', note: 'Outer ring', dist: '~950 m' },
      ],
    },
    {
      short: '1–2 km', dist: '1 – 2 km', walk: 'Shuttle or 15–20 min', area: 'Quba road & Sultanah districts', name: 'QUBA · SULTANAH',
      hotels: [
        { name: 'Durrat Al Eiman Hotel', stars: '4★', note: 'Sultanah · shuttle', dist: '~1.2 km' },
        { name: 'Coral Al Madinah Hotel', stars: '4★', note: 'Quba Rd · shuttle', dist: '~1.4 km' },
        { name: 'Wasel Al Salam Hotel', stars: '3★', note: 'Quba Rd · shuttle', dist: '~1.6 km' },
        { name: 'Rua Al Hijra Hotel', stars: '3★', note: 'Sultanah · shuttle', dist: '~1.9 km' },
      ],
    },
    {
      short: 'Shuttle', dist: '2 – 5 km', walk: 'Free hotel shuttle bus', area: 'Outer districts — value stays with shuttle service', name: 'OUTER DISTRICTS',
      hotels: [
        { name: 'Boudl Al Madinah', stars: '3★', note: 'Outer · shuttle', dist: '~2.5 km' },
        { name: 'Rawaq Al Madinah', stars: '3★', note: 'Outer · shuttle', dist: '~3 km' },
        { name: 'Madinah apartment hotels', stars: 'APT', note: 'Family suites · shuttle', dist: '2–5 km' },
      ],
    },
  ],
};

const CITIES: Record<HotelCity, CityHotels> = { makkah: MAKKAH, madinah: MADINAH };

export function hotelsForCity(city: HotelCity): CityHotels {
  return CITIES[city];
}
