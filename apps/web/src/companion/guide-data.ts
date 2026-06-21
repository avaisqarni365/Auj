// Companion-guide seed content (migration 10), transcribed from the prototypes.
export type GuideSlug = 'food' | 'transport' | 'connectivity' | 'gifts' | 'laundry' | 'hospitals' | 'helpline';
export type GuideCity = 'makkah' | 'madinah';

export interface GuideItem {
  name: string;
  note: string;
  tag: string;
  mark: string;
}
export interface GuideCategory {
  key: string;   // the `short` label, used as the rail key
  name: string;  // category heading
  desc: string;
  noun: string;  // e.g. 'places', 'numbers', 'apps'
  items: GuideItem[];
}
export interface GuideDef {
  slug: GuideSlug;
  title: string;     // e.g. 'Food guide'
  subtitle: string;  // one short line
  icon: string;      // single emoji
  cities: Record<GuideCity, GuideCategory[]>;
}

export const GUIDES: Record<GuideSlug, GuideDef> = {
  food: {
    slug: 'food',
    title: 'Food & dining',
    subtitle: 'Good eats & online orders',
    icon: '🍽️',
    cities: {
      makkah: [
        { key: 'Near Haram', name: 'Near the Haram', desc: 'Quick, reliable bites within minutes of Masjid al-Haram and inside the Clock Tower malls.', noun: 'places', items: [
          { name: 'Al Baik', note: 'Saudi fried chicken · legendary', tag: 'Budget', mark: 'AB' },
          { name: 'Abraj Al Bait Food Court', note: 'International · inside the towers', tag: 'Mall', mark: 'FC' },
          { name: 'Herfy', note: 'Saudi burgers & meals', tag: 'Budget', mark: 'HF' },
          { name: 'KUDU', note: 'Sandwiches & breakfast', tag: 'Budget', mark: 'KD' },
          { name: 'Zad Almusafer', note: 'Buffet near the Haram', tag: 'Buffet', mark: 'ZM' },
        ] },
        { key: 'Desi', name: 'Desi & Pakistani', desc: 'Biryani, karahi and grills loved by the South-Asian pilgrim community.', noun: 'places', items: [
          { name: 'Bundu Khan', note: 'Pakistani grills & karahi', tag: 'Mid', mark: 'BK' },
          { name: 'Lahore Karahi', note: 'Pakistani · karahi & naan', tag: 'Budget', mark: 'LK' },
          { name: 'Kabul Darbar', note: 'Afghan & Pakistani', tag: 'Budget', mark: 'KD' },
          { name: 'Al Khaima Biryani', note: 'Biryani & rice plates', tag: 'Budget', mark: 'KB' },
        ] },
        { key: 'Arab & Grills', name: 'Arab & Grills', desc: 'Traditional Saudi and Levantine grills, mandi and family platters.', noun: 'places', items: [
          { name: 'Al Tazaj', note: 'Charcoal grilled chicken', tag: 'Budget', mark: 'AT' },
          { name: 'Al Romansiah', note: 'Saudi traditional · kabsa', tag: 'Mid', mark: 'RM' },
          { name: 'Najd Village', note: 'Heritage Saudi dining', tag: 'Mid', mark: 'NV' },
          { name: 'Mataam Al Sharq', note: 'Arab grills & mezze', tag: 'Mid', mark: 'SH' },
        ] },
        { key: 'Turkish & Asian', name: 'Turkish & Asian', desc: 'Turkish kebabs and pide, Yemeni mandi, and East-Asian favourites.', noun: 'places', items: [
          { name: 'Istanbul Restaurant', note: 'Turkish kebab & pide', tag: 'Mid', mark: 'IS' },
          { name: 'Köfteci Yusuf', note: 'Turkish köfte', tag: 'Mid', mark: 'KY' },
          { name: 'Hadramout Mandi', note: 'Yemeni mandi & bukhari', tag: 'Budget', mark: 'HM' },
          { name: 'Asian Wok', note: 'Chinese & Thai', tag: 'Mid', mark: 'AW' },
        ] },
        { key: 'Cafés & Sweets', name: 'Cafés & Sweets', desc: 'Arabic coffee, kunafa, baklava and dessert houses for after taraweeh.', noun: 'places', items: [
          { name: 'Barn’s Café', note: 'Saudi coffee chain', tag: 'Café', mark: 'BR' },
          { name: 'Saadeddin', note: 'Arabic sweets & baklava', tag: 'Sweets', mark: 'SD' },
          { name: 'Al Baba Kunafa', note: 'Levantine kunafa', tag: 'Sweets', mark: 'KN' },
          { name: 'Dunkin / Starbucks', note: 'Coffee & quick bites', tag: 'Café', mark: 'CO' },
        ] },
        { key: 'Order online', name: 'Order online', desc: 'Deliver to your hotel from the apps used across Saudi Arabia. Pay by card or cash on delivery.', noun: 'apps', items: [
          { name: 'HungerStation', note: 'Largest food-delivery app in KSA', tag: 'App', mark: 'HS' },
          { name: 'Jahez', note: 'Wide restaurant choice · fast', tag: 'App', mark: 'JZ' },
          { name: 'ToYou', note: 'Food, groceries & pharmacy', tag: 'App', mark: 'TY' },
          { name: 'The Chefz', note: 'Premium restaurants & sweets', tag: 'App', mark: 'CH' },
          { name: 'Mrsool', note: 'Order anything by courier', tag: 'App', mark: 'MR' },
          { name: 'Careem Food', note: 'Within the Careem super-app', tag: 'App', mark: 'CF' },
        ] },
      ],
      madinah: [
        { key: 'Near Haram', name: 'Near the Haram', desc: 'Easy meals around the central Piazza, steps from Masjid an-Nabawi.', noun: 'places', items: [
          { name: 'Al Baik', note: 'Saudi fried chicken · legendary', tag: 'Budget', mark: 'AB' },
          { name: 'Zaatar w Zeit', note: 'Levantine manakish & wraps', tag: 'Mid', mark: 'ZZ' },
          { name: 'Herfy', note: 'Saudi burgers & meals', tag: 'Budget', mark: 'HF' },
          { name: 'Central Piazza Food Courts', note: 'International · around the mosque', tag: 'Mall', mark: 'FC' },
          { name: 'Al Sufra Buffet', note: 'Open buffet near the Haram', tag: 'Buffet', mark: 'SF' },
        ] },
        { key: 'Desi', name: 'Desi & Pakistani', desc: 'Biryani, karahi and desi breakfast for the South-Asian community.', noun: 'places', items: [
          { name: 'Bundu Khan', note: 'Pakistani grills & karahi', tag: 'Mid', mark: 'BK' },
          { name: 'Lahori Tarka', note: 'Pakistani · karahi & naan', tag: 'Budget', mark: 'LT' },
          { name: 'Kabul Restaurant', note: 'Afghan & Pakistani', tag: 'Budget', mark: 'KR' },
          { name: 'Madinah Biryani House', note: 'Biryani & rice plates', tag: 'Budget', mark: 'BH' },
        ] },
        { key: 'Arab & Grills', name: 'Arab & Grills', desc: 'Saudi heritage dining, grilled chicken and family mandi platters.', noun: 'places', items: [
          { name: 'Al Romansiah', note: 'Saudi traditional · kabsa', tag: 'Mid', mark: 'RM' },
          { name: 'Najd Village', note: 'Heritage Saudi dining', tag: 'Mid', mark: 'NV' },
          { name: 'Al Tazaj', note: 'Charcoal grilled chicken', tag: 'Budget', mark: 'AT' },
          { name: 'Abu Shakra', note: 'Grills & mezze', tag: 'Mid', mark: 'AS' },
        ] },
        { key: 'Turkish & Asian', name: 'Turkish & Asian', desc: 'Turkish ocakbasi, Yemeni mandi and East-Asian options.', noun: 'places', items: [
          { name: 'Köşk Turkish', note: 'Turkish grills & pide', tag: 'Mid', mark: 'KS' },
          { name: 'Saray Restaurant', note: 'Turkish & Ottoman', tag: 'Mid', mark: 'SR' },
          { name: 'Hadramout Mandi', note: 'Yemeni mandi & bukhari', tag: 'Budget', mark: 'HM' },
          { name: 'China Town', note: 'Chinese & Asian', tag: 'Mid', mark: 'CT' },
        ] },
        { key: 'Cafés & Sweets', name: 'Cafés & Sweets', desc: 'Coffee houses, date shops and Ajwa sweets to enjoy and gift.', noun: 'places', items: [
          { name: 'Barn’s Café', note: 'Saudi coffee chain', tag: 'Café', mark: 'BR' },
          { name: 'Saadeddin', note: 'Arabic sweets & baklava', tag: 'Sweets', mark: 'SD' },
          { name: 'Madinah Dates & Ajwa', note: 'Dates, chocolate & gifts', tag: 'Sweets', mark: 'AJ' },
          { name: 'Starbucks / Dunkin', note: 'Coffee & quick bites', tag: 'Café', mark: 'CO' },
        ] },
        { key: 'Order online', name: 'Order online', desc: 'Deliver to your hotel from the apps used across Saudi Arabia. Pay by card or cash on delivery.', noun: 'apps', items: [
          { name: 'HungerStation', note: 'Largest food-delivery app in KSA', tag: 'App', mark: 'HS' },
          { name: 'Jahez', note: 'Wide restaurant choice · fast', tag: 'App', mark: 'JZ' },
          { name: 'ToYou', note: 'Food, groceries & pharmacy', tag: 'App', mark: 'TY' },
          { name: 'The Chefz', note: 'Premium restaurants & sweets', tag: 'App', mark: 'CH' },
          { name: 'Mrsool', note: 'Order anything by courier', tag: 'App', mark: 'MR' },
          { name: 'Careem Food', note: 'Within the Careem super-app', tag: 'App', mark: 'CF' },
        ] },
      ],
    },
  },
  transport: {
    slug: 'transport',
    title: 'Transport guide',
    subtitle: 'Options · fares · companies',
    icon: '🚌',
    cities: {
      makkah: [
        { key: 'Rail', name: 'Haramain High-Speed Rail', desc: 'The high-speed train linking Jeddah airport, Makkah, KAEC and Madinah — the fastest way between the two holy cities.', noun: 'options', items: [
          { name: 'Makkah ↔ Madinah', note: '~2h 20m · several daily', tag: 'fr SAR 150', mark: 'HHR' },
          { name: 'Jeddah Airport ↔ Makkah', note: '~1 hour', tag: 'fr SAR 40', mark: 'HHR' },
          { name: 'Jeddah ↔ Madinah', note: '~2 hours', tag: 'fr SAR 120', mark: 'HHR' },
          { name: 'Economy & Business class', note: 'Reserved seats, luggage', tag: 'Class', mark: 'CLS' },
          { name: 'Book: sar.hhr.sa or app', note: 'Reserve early in peak season', tag: 'Online', mark: 'BK' },
        ] },
        { key: 'Airport', name: 'Airport transfers', desc: 'From Jeddah (JED) or Madinah (MED) airport to your hotel — by private car, rail or coach.', noun: 'options', items: [
          { name: 'AUJ private transfer', note: 'Included in most packages', tag: 'incl.', mark: 'AUJ' },
          { name: 'Careem / Uber (JED → Makkah)', note: '~1.5 hours', tag: 'SAR 180–250', mark: 'APP' },
          { name: 'Airport taxi (fixed fare)', note: 'Counter outside arrivals', tag: 'SAR 200+', mark: 'TAXI' },
          { name: 'Haramain Rail from JED', note: 'Station inside the airport', tag: 'fr SAR 40', mark: 'HHR' },
          { name: 'SAPTCO airport coach', note: 'Budget shared transfer', tag: 'fr SAR 25', mark: 'BUS' },
        ] },
        { key: 'Ride-hailing', name: 'Ride-hailing apps', desc: 'Book a car on your phone in seconds — the easiest way to move around both cities.', noun: 'options', items: [
          { name: 'Careem', note: 'Most popular · super-app', tag: 'App', mark: 'CRM' },
          { name: 'Uber', note: 'Widely available', tag: 'App', mark: 'UBR' },
          { name: 'Jeeny', note: 'Local alternative', tag: 'App', mark: 'JNY' },
          { name: 'City short hop', note: 'Within Makkah / Madinah', tag: 'SAR 15–40', mark: 'FARE' },
          { name: 'Airport ride (JED → Makkah)', note: '~1.5 hours', tag: 'SAR 180–250', mark: 'FARE' },
        ] },
        { key: 'Intercity bus', name: 'Intercity coaches', desc: 'Comfortable air-conditioned coaches between Makkah, Madinah and Jeddah.', noun: 'options', items: [
          { name: 'SAPTCO', note: 'National bus company', tag: 'SAR 80–120', mark: 'SAP' },
          { name: 'Makkah ↔ Madinah coach', note: '~6 hours', tag: 'fr SAR 90', mark: 'BUS' },
          { name: 'Jeddah ↔ Makkah', note: '~1.5 hours', tag: 'fr SAR 25', mark: 'BUS' },
          { name: 'Private VIP coach (groups)', note: 'Charter for your group', tag: 'Charter', mark: 'VIP' },
        ] },
        { key: 'Local', name: 'Local buses & shuttles', desc: 'Getting around within each city, including hotel and Haram shuttle services.', noun: 'options', items: [
          { name: 'Makkah Bus (city network)', note: 'Modern city routes', tag: 'SAR 3–5', mark: 'BUS' },
          { name: 'Madinah Bus', note: 'City network', tag: 'SAR 3–5', mark: 'BUS' },
          { name: 'Hotel shuttle (Aziziyah/outer)', note: 'To the Haram', tag: 'Free', mark: 'SHL' },
          { name: 'Haram area shuttles', note: 'Short hops', tag: 'Free/low', mark: 'SHL' },
        ] },
        { key: 'Taxi & car', name: 'Taxis & private cars', desc: 'Street taxis and pre-booked private cars with a driver, for ziyarat and intercity trips.', noun: 'options', items: [
          { name: 'White metered taxi', note: 'Street hail', tag: 'Meter', mark: 'TAXI' },
          { name: 'Private car + driver', note: 'By the hour or day', tag: 'SAR/hr', mark: 'CAR' },
          { name: 'Makkah ↔ Madinah private car', note: '~4–5h door to door', tag: 'SAR 400–600', mark: 'CAR' },
          { name: 'Ziyarat tour car (half day)', note: 'Guided sacred sites', tag: 'SAR 150–300', mark: 'TOUR' },
        ] },
      ],
      madinah: [
        { key: 'Rail', name: 'Haramain High-Speed Rail', desc: 'The high-speed train linking Jeddah airport, Makkah, KAEC and Madinah — the fastest way between the two holy cities.', noun: 'options', items: [
          { name: 'Makkah ↔ Madinah', note: '~2h 20m · several daily', tag: 'fr SAR 150', mark: 'HHR' },
          { name: 'Jeddah Airport ↔ Makkah', note: '~1 hour', tag: 'fr SAR 40', mark: 'HHR' },
          { name: 'Jeddah ↔ Madinah', note: '~2 hours', tag: 'fr SAR 120', mark: 'HHR' },
          { name: 'Economy & Business class', note: 'Reserved seats, luggage', tag: 'Class', mark: 'CLS' },
          { name: 'Book: sar.hhr.sa or app', note: 'Reserve early in peak season', tag: 'Online', mark: 'BK' },
        ] },
        { key: 'Airport', name: 'Airport transfers', desc: 'From Jeddah (JED) or Madinah (MED) airport to your hotel — by private car, rail or coach.', noun: 'options', items: [
          { name: 'AUJ private transfer', note: 'Included in most packages', tag: 'incl.', mark: 'AUJ' },
          { name: 'Careem / Uber (JED → Makkah)', note: '~1.5 hours', tag: 'SAR 180–250', mark: 'APP' },
          { name: 'Airport taxi (fixed fare)', note: 'Counter outside arrivals', tag: 'SAR 200+', mark: 'TAXI' },
          { name: 'Haramain Rail from JED', note: 'Station inside the airport', tag: 'fr SAR 40', mark: 'HHR' },
          { name: 'SAPTCO airport coach', note: 'Budget shared transfer', tag: 'fr SAR 25', mark: 'BUS' },
        ] },
        { key: 'Ride-hailing', name: 'Ride-hailing apps', desc: 'Book a car on your phone in seconds — the easiest way to move around both cities.', noun: 'options', items: [
          { name: 'Careem', note: 'Most popular · super-app', tag: 'App', mark: 'CRM' },
          { name: 'Uber', note: 'Widely available', tag: 'App', mark: 'UBR' },
          { name: 'Jeeny', note: 'Local alternative', tag: 'App', mark: 'JNY' },
          { name: 'City short hop', note: 'Within Makkah / Madinah', tag: 'SAR 15–40', mark: 'FARE' },
          { name: 'Airport ride (JED → Makkah)', note: '~1.5 hours', tag: 'SAR 180–250', mark: 'FARE' },
        ] },
        { key: 'Intercity bus', name: 'Intercity coaches', desc: 'Comfortable air-conditioned coaches between Makkah, Madinah and Jeddah.', noun: 'options', items: [
          { name: 'SAPTCO', note: 'National bus company', tag: 'SAR 80–120', mark: 'SAP' },
          { name: 'Makkah ↔ Madinah coach', note: '~6 hours', tag: 'fr SAR 90', mark: 'BUS' },
          { name: 'Jeddah ↔ Makkah', note: '~1.5 hours', tag: 'fr SAR 25', mark: 'BUS' },
          { name: 'Private VIP coach (groups)', note: 'Charter for your group', tag: 'Charter', mark: 'VIP' },
        ] },
        { key: 'Local', name: 'Local buses & shuttles', desc: 'Getting around within each city, including hotel and Haram shuttle services.', noun: 'options', items: [
          { name: 'Makkah Bus (city network)', note: 'Modern city routes', tag: 'SAR 3–5', mark: 'BUS' },
          { name: 'Madinah Bus', note: 'City network', tag: 'SAR 3–5', mark: 'BUS' },
          { name: 'Hotel shuttle (Aziziyah/outer)', note: 'To the Haram', tag: 'Free', mark: 'SHL' },
          { name: 'Haram area shuttles', note: 'Short hops', tag: 'Free/low', mark: 'SHL' },
        ] },
        { key: 'Taxi & car', name: 'Taxis & private cars', desc: 'Street taxis and pre-booked private cars with a driver, for ziyarat and intercity trips.', noun: 'options', items: [
          { name: 'White metered taxi', note: 'Street hail', tag: 'Meter', mark: 'TAXI' },
          { name: 'Private car + driver', note: 'By the hour or day', tag: 'SAR/hr', mark: 'CAR' },
          { name: 'Makkah ↔ Madinah private car', note: '~4–5h door to door', tag: 'SAR 400–600', mark: 'CAR' },
          { name: 'Ziyarat tour car (half day)', note: 'Guided sacred sites', tag: 'SAR 150–300', mark: 'TOUR' },
        ] },
      ],
    },
  },
  connectivity: {
    slug: 'connectivity',
    title: 'Connectivity guide',
    subtitle: 'SIM · internet · stay in touch',
    icon: '📶',
    cities: {
      makkah: [
        { key: 'SIM & eSIM', name: 'SIM & eSIM', desc: 'Get a local number the moment you land — a physical SIM at the airport, or an eSIM set up before you fly.', noun: 'options', items: [
          { name: 'STC', note: 'Largest network · best Haram coverage', tag: 'SIM', mark: 'STC' },
          { name: 'Mobily', note: 'Good-value data bundles', tag: 'SIM', mark: 'MOB' },
          { name: 'Zain', note: 'Tourist data packages', tag: 'SIM', mark: 'ZN' },
          { name: 'Airalo / Holafly (eSIM)', note: 'Set up before you land', tag: 'App', mark: 'eSIM' },
          { name: 'Airport SIM kiosks (JED/MED)', note: 'Passport needed to register', tag: 'Arrival', mark: 'JED' },
        ] },
        { key: 'Internet', name: 'Internet & data', desc: 'Mobile data and wifi to follow prayer times, maps and stay reachable everywhere.', noun: 'options', items: [
          { name: 'Tourist data bundle', note: '30–60 GB validity packs', tag: 'fr SAR 50', mark: 'GB' },
          { name: 'Hotel wifi', note: 'Free in most hotels', tag: 'Free', mark: 'WIFI' },
          { name: 'Haramain area wifi', note: 'Public hotspots near the mosques', tag: 'Free', mark: 'WIFI' },
          { name: 'Portable wifi (MiFi)', note: 'Share with your group', tag: 'Rental', mark: 'MIFI' },
        ] },
        { key: 'Stay in touch', name: 'Stay in touch', desc: 'Keep your guardian and family updated through the day — calls, voice notes and video.', noun: 'options', items: [
          { name: 'WhatsApp', note: 'Calls, video & voice notes', tag: 'App', mark: 'WA' },
          { name: 'Daily check-in time', note: 'Agree a time to message home', tag: 'Tip', mark: 'OK' },
          { name: 'Video call after prayers', note: 'Share the moment with family', tag: 'Tip', mark: 'VID' },
          { name: 'International calling pack', note: 'Add to your SIM bundle', tag: 'Add-on', mark: 'INTL' },
        ] },
        { key: 'Location', name: 'Location & safety', desc: 'Let your guardian see where you are — vital in the big crowds around the Haram.', noun: 'options', items: [
          { name: 'WhatsApp live location', note: 'Share for 1–8 hours', tag: 'Live', mark: 'WA' },
          { name: 'Google Maps location share', note: 'Real-time with family', tag: 'Live', mark: 'MAP' },
          { name: 'Find My / Find Hub', note: 'Track devices in the group', tag: 'Device', mark: 'FIND' },
          { name: 'ID bracelet / Nusuk card', note: 'Carry your address in Arabic', tag: 'Carry', mark: 'ID' },
          { name: 'Agree a meeting gate', note: 'Numbered gates at the Haram', tag: 'Plan', mark: 'GATE' },
        ] },
        { key: 'Official sites', name: 'Official websites & apps', desc: 'The official Saudi sites and apps every pilgrim should have on their phone.', noun: 'options', items: [
          { name: 'Nusuk · nusuk.sa', note: 'Permits, Rawdah, services', tag: 'Web/App', mark: 'NU' },
          { name: 'Haramain Rail · sar.hhr.sa', note: 'Book the high-speed train', tag: 'Web', mark: 'HHR' },
          { name: 'Saudi eVisa · visitsaudi.com', note: 'Apply & check your visa', tag: 'Web', mark: 'VISA' },
          { name: 'Tawakkalna / Absher', note: 'Digital ID & gov services', tag: 'App', mark: 'GOV' },
          { name: 'MoH 937 / Asefny', note: 'Health line & Red Crescent SOS', tag: 'Help', mark: '937' },
        ] },
      ],
      madinah: [
        { key: 'SIM & eSIM', name: 'SIM & eSIM', desc: 'Get a local number the moment you land — a physical SIM at the airport, or an eSIM set up before you fly.', noun: 'options', items: [
          { name: 'STC', note: 'Largest network · best Haram coverage', tag: 'SIM', mark: 'STC' },
          { name: 'Mobily', note: 'Good-value data bundles', tag: 'SIM', mark: 'MOB' },
          { name: 'Zain', note: 'Tourist data packages', tag: 'SIM', mark: 'ZN' },
          { name: 'Airalo / Holafly (eSIM)', note: 'Set up before you land', tag: 'App', mark: 'eSIM' },
          { name: 'Airport SIM kiosks (JED/MED)', note: 'Passport needed to register', tag: 'Arrival', mark: 'JED' },
        ] },
        { key: 'Internet', name: 'Internet & data', desc: 'Mobile data and wifi to follow prayer times, maps and stay reachable everywhere.', noun: 'options', items: [
          { name: 'Tourist data bundle', note: '30–60 GB validity packs', tag: 'fr SAR 50', mark: 'GB' },
          { name: 'Hotel wifi', note: 'Free in most hotels', tag: 'Free', mark: 'WIFI' },
          { name: 'Haramain area wifi', note: 'Public hotspots near the mosques', tag: 'Free', mark: 'WIFI' },
          { name: 'Portable wifi (MiFi)', note: 'Share with your group', tag: 'Rental', mark: 'MIFI' },
        ] },
        { key: 'Stay in touch', name: 'Stay in touch', desc: 'Keep your guardian and family updated through the day — calls, voice notes and video.', noun: 'options', items: [
          { name: 'WhatsApp', note: 'Calls, video & voice notes', tag: 'App', mark: 'WA' },
          { name: 'Daily check-in time', note: 'Agree a time to message home', tag: 'Tip', mark: 'OK' },
          { name: 'Video call after prayers', note: 'Share the moment with family', tag: 'Tip', mark: 'VID' },
          { name: 'International calling pack', note: 'Add to your SIM bundle', tag: 'Add-on', mark: 'INTL' },
        ] },
        { key: 'Location', name: 'Location & safety', desc: 'Let your guardian see where you are — vital in the big crowds around the Haram.', noun: 'options', items: [
          { name: 'WhatsApp live location', note: 'Share for 1–8 hours', tag: 'Live', mark: 'WA' },
          { name: 'Google Maps location share', note: 'Real-time with family', tag: 'Live', mark: 'MAP' },
          { name: 'Find My / Find Hub', note: 'Track devices in the group', tag: 'Device', mark: 'FIND' },
          { name: 'ID bracelet / Nusuk card', note: 'Carry your address in Arabic', tag: 'Carry', mark: 'ID' },
          { name: 'Agree a meeting gate', note: 'Numbered gates at the Haram', tag: 'Plan', mark: 'GATE' },
        ] },
        { key: 'Official sites', name: 'Official websites & apps', desc: 'The official Saudi sites and apps every pilgrim should have on their phone.', noun: 'options', items: [
          { name: 'Nusuk · nusuk.sa', note: 'Permits, Rawdah, services', tag: 'Web/App', mark: 'NU' },
          { name: 'Haramain Rail · sar.hhr.sa', note: 'Book the high-speed train', tag: 'Web', mark: 'HHR' },
          { name: 'Saudi eVisa · visitsaudi.com', note: 'Apply & check your visa', tag: 'Web', mark: 'VISA' },
          { name: 'Tawakkalna / Absher', note: 'Digital ID & gov services', tag: 'App', mark: 'GOV' },
          { name: 'MoH 937 / Asefny', note: 'Health line & Red Crescent SOS', tag: 'Help', mark: '937' },
        ] },
      ],
    },
  },
  gifts: {
    slug: 'gifts',
    title: 'Gifts & shopping',
    subtitle: 'Dates · Zamzam · gifts · souqs',
    icon: '🎁',
    cities: {
      makkah: [
        { key: 'Dates & Zamzam', name: 'Dates, Zamzam & Ajwa', desc: 'The classic gifts to carry home — sealed Zamzam and the best Makkah dates.', noun: 'options', items: [
          { name: 'Zamzam (sealed 5L / 10L)', note: 'Official outlets near the Haram', tag: 'Sealed', mark: 'ZM' },
          { name: 'Makkah date shops', note: 'Ajwa, Sukkari, Safawi', tag: 'per kg', mark: 'DT' },
          { name: 'Bin Dawood / Panda', note: 'Supermarket gift packs', tag: 'Packs', mark: 'BD' },
          { name: 'Chocolate-stuffed date boxes', note: 'Ready gift boxes', tag: 'Gift', mark: 'GB' },
        ] },
        { key: 'Gifts', name: 'Gifts & souvenirs', desc: 'Prayer mats, tasbeeh, attar, caps and frames around the Haram.', noun: 'options', items: [
          { name: 'Prayer mats & tasbeeh', note: 'Around the Haram', tag: 'SAR 10+', mark: 'PM' },
          { name: 'Attar & oud perfume', note: 'Alcohol-free fragrance', tag: 'Attar', mark: 'AT' },
          { name: 'Caps, abayas & scarves', note: 'Clothing & ihram bags', tag: 'Wear', mark: 'AB' },
          { name: 'Kaaba frames & decor', note: 'Souvenir art', tag: 'Decor', mark: 'FR' },
        ] },
        { key: 'Malls & souqs', name: 'Malls & souqs', desc: 'Browse it all under one roof or in the old markets.', noun: 'places', items: [
          { name: 'Abraj Al Bait Mall', note: 'Inside the Clock Tower', tag: 'Mall', mark: 'AB' },
          { name: 'Makkah Mall', note: 'Aziziyah · big brands', tag: 'Mall', mark: 'MM' },
          { name: 'Souq Al Hijaz / Al Diyafa', note: 'Gifts & souvenirs', tag: 'Souq', mark: 'SH' },
          { name: 'Street stalls near the Haram', note: 'Bargain souvenirs', tag: 'Bargain', mark: 'ST' },
        ] },
        { key: 'Online', name: 'Order online', desc: 'Buy gifts, dates and Zamzam online for delivery to your hotel or shipped home.', noun: 'options', items: [
          { name: 'HungerStation / ToYou', note: 'Groceries & gift delivery', tag: 'App', mark: 'HS' },
          { name: 'Bateel.com', note: 'Premium dates · ships abroad', tag: 'Web', mark: 'BT' },
          { name: 'Amazon.sa / Noon', note: 'Gifts & essentials', tag: 'Web', mark: 'AZ' },
          { name: 'Local date sellers (WhatsApp)', note: 'Many ship overseas', tag: 'Chat', mark: 'WA' },
        ] },
      ],
      madinah: [
        { key: 'Dates & Zamzam', name: 'Ajwa, dates & Zamzam', desc: 'Madinah is the home of Ajwa — the date praised by the Prophet ﷺ.', noun: 'options', items: [
          { name: 'Ajwa date market (near Quba)', note: 'The famous Madinah Ajwa', tag: 'per kg', mark: 'AJ' },
          { name: 'Tamr (date) Souq', note: 'Dozens of date sellers', tag: 'Souq', mark: 'DS' },
          { name: 'Zamzam (sealed)', note: 'Official outlets', tag: 'Sealed', mark: 'ZM' },
          { name: 'Sidr honey & gift boxes', note: 'Local Sidr honey, dates', tag: 'Gift', mark: 'HN' },
        ] },
        { key: 'Gifts', name: 'Gifts & souvenirs', desc: 'Prayer mats, tasbeeh, attar and clothing in the central area.', noun: 'options', items: [
          { name: 'Prayer mats & tasbeeh', note: 'Central area', tag: 'SAR 10+', mark: 'PM' },
          { name: 'Attar & oud perfume', note: 'Alcohol-free fragrance', tag: 'Attar', mark: 'AT' },
          { name: 'Caps, abayas & scarves', note: 'Clothing', tag: 'Wear', mark: 'AB' },
          { name: 'Frames & decor', note: 'Souvenir art', tag: 'Decor', mark: 'FR' },
        ] },
        { key: 'Malls & souqs', name: 'Malls & souqs', desc: 'Modern malls and markets around the Haram.', noun: 'places', items: [
          { name: 'Al Noor Mall', note: 'Big brands', tag: 'Mall', mark: 'NM' },
          { name: 'Al Rashid Mega Mall', note: 'Family mall', tag: 'Mall', mark: 'RM' },
          { name: 'Central area souqs', note: 'Around the Haram', tag: 'Souq', mark: 'CL' },
          { name: 'Quba Road shops', note: 'Dates & gifts', tag: 'Shops', mark: 'QB' },
        ] },
        { key: 'Online', name: 'Order online', desc: 'Buy gifts, dates and Zamzam online for delivery to your hotel or shipped home.', noun: 'options', items: [
          { name: 'HungerStation / ToYou', note: 'Groceries & gift delivery', tag: 'App', mark: 'HS' },
          { name: 'Bateel.com', note: 'Premium dates · ships abroad', tag: 'Web', mark: 'BT' },
          { name: 'Amazon.sa / Noon', note: 'Gifts & essentials', tag: 'Web', mark: 'AZ' },
          { name: 'Local date sellers (WhatsApp)', note: 'Many ship overseas', tag: 'Chat', mark: 'WA' },
        ] },
      ],
    },
  },
  laundry: {
    slug: 'laundry',
    title: 'Laundry guide',
    subtitle: 'Wash · iron · express · pickup',
    icon: '🧺',
    cities: {
      makkah: [
        { key: 'Near Haram', name: 'Laundries near the Haram', desc: 'Walk-in laundries in Ajyad, Misfalah and the streets around Masjid al-Haram.', noun: 'shops', items: [
          { name: 'Ajyad laundry shops', note: 'Wash & iron · per piece/kg', tag: 'SAR 3–6', mark: 'AJ' },
          { name: 'Misfalah laundries', note: 'Walk-in · quick', tag: 'SAR 3–6', mark: 'MF' },
          { name: 'Ibrahim Al Khalil Rd shops', note: 'Several options', tag: 'per pc', mark: 'IK' },
        ] },
        { key: 'Hotel', name: 'In-hotel laundry', desc: 'Same-day wash, dry and press through your hotel — the easiest, though priciest, option.', noun: 'options', items: [
          { name: '5-star hotel laundry', note: 'Same-day · charged per piece', tag: 'SAR 10–25', mark: 'HTL' },
          { name: 'Express (4-hour) service', note: 'Surcharge applies', tag: '+50%', mark: 'EXP' },
          { name: 'Room laundry-bag pickup', note: 'Leave bag, list on the form', tag: 'Daily', mark: 'BAG' },
        ] },
        { key: 'Express', name: 'Express & 24-hour', desc: 'Fast turnaround when you need a clean ihram or fresh clothes quickly.', noun: 'options', items: [
          { name: '1-hour express laundry', note: 'Select shops', tag: 'Premium', mark: '1H' },
          { name: '24-hour laundries', note: 'Central & Aziziyah areas', tag: 'Open 24h', mark: '24' },
          { name: 'Ihram wash & press', note: 'Handled with care', tag: 'SAR 5–10', mark: 'IHR' },
        ] },
        { key: 'Self-service', name: 'Self-service & coin', desc: 'App- or coin-operated machines for do-it-yourself washing.', noun: 'options', items: [
          { name: 'App-operated machines', note: 'Washy / Justclean kiosks', tag: 'App', mark: 'WS' },
          { name: 'Coin laundromats', note: 'Some malls & districts', tag: 'Coin', mark: 'CN' },
          { name: 'Apartment-hotel guest laundry', note: 'In-building machines', tag: 'Free/low', mark: 'GL' },
        ] },
        { key: 'Pickup apps', name: 'Pickup & delivery apps', desc: 'Schedule a pickup from your hotel and get clean clothes back, often next day.', noun: 'apps', items: [
          { name: 'Washy', note: 'Laundry pickup app · KSA', tag: 'App', mark: 'WS' },
          { name: 'Justclean', note: 'Laundry & dry-clean', tag: 'App', mark: 'JC' },
          { name: 'Uwasher', note: 'On-demand laundry', tag: 'App', mark: 'UW' },
          { name: 'ToYou / local couriers', note: 'Pickup & drop-off', tag: 'App', mark: 'TY' },
        ] },
      ],
      madinah: [
        { key: 'Near Haram', name: 'Laundries near the Haram', desc: 'Walk-in laundries around the central Piazza and along King Fahd and Sultanah roads.', noun: 'shops', items: [
          { name: 'Central area laundries', note: 'Around the Piazza · per piece', tag: 'SAR 3–6', mark: 'CA' },
          { name: 'King Fahd Rd shops', note: 'Walk-in · quick', tag: 'SAR 3–6', mark: 'KF' },
          { name: 'Sultanah district laundries', note: 'Several options', tag: 'per pc', mark: 'SL' },
        ] },
        { key: 'Hotel', name: 'In-hotel laundry', desc: 'Same-day wash, dry and press through your hotel — the easiest, though priciest, option.', noun: 'options', items: [
          { name: '5-star hotel laundry', note: 'Same-day · charged per piece', tag: 'SAR 10–25', mark: 'HTL' },
          { name: 'Express (4-hour) service', note: 'Surcharge applies', tag: '+50%', mark: 'EXP' },
          { name: 'Room laundry-bag pickup', note: 'Leave bag, list on the form', tag: 'Daily', mark: 'BAG' },
        ] },
        { key: 'Express', name: 'Express & 24-hour', desc: 'Fast turnaround when you need a clean ihram or fresh clothes quickly.', noun: 'options', items: [
          { name: '1-hour express laundry', note: 'Select shops', tag: 'Premium', mark: '1H' },
          { name: '24-hour laundries', note: 'Central & Aziziyah areas', tag: 'Open 24h', mark: '24' },
          { name: 'Ihram wash & press', note: 'Handled with care', tag: 'SAR 5–10', mark: 'IHR' },
        ] },
        { key: 'Self-service', name: 'Self-service & coin', desc: 'App- or coin-operated machines for do-it-yourself washing.', noun: 'options', items: [
          { name: 'App-operated machines', note: 'Washy / Justclean kiosks', tag: 'App', mark: 'WS' },
          { name: 'Coin laundromats', note: 'Some malls & districts', tag: 'Coin', mark: 'CN' },
          { name: 'Apartment-hotel guest laundry', note: 'In-building machines', tag: 'Free/low', mark: 'GL' },
        ] },
        { key: 'Pickup apps', name: 'Pickup & delivery apps', desc: 'Schedule a pickup from your hotel and get clean clothes back, often next day.', noun: 'apps', items: [
          { name: 'Washy', note: 'Laundry pickup app · KSA', tag: 'App', mark: 'WS' },
          { name: 'Justclean', note: 'Laundry & dry-clean', tag: 'App', mark: 'JC' },
          { name: 'Uwasher', note: 'On-demand laundry', tag: 'App', mark: 'UW' },
          { name: 'ToYou / local couriers', note: 'Pickup & drop-off', tag: 'App', mark: 'TY' },
        ] },
      ],
    },
  },
  hospitals: {
    slug: 'hospitals',
    title: 'Hospitals & care',
    subtitle: 'Hospitals, clinics & emergency',
    icon: '🏥',
    cities: {
      makkah: [
        { key: 'Emergency', name: 'Emergency & numbers', desc: 'Save these before you travel. Ambulance and emergency care are free for pilgrims.', noun: 'numbers', items: [
          { name: 'Red Crescent Ambulance', note: 'Emergency medical · free', tag: '997', mark: '+' },
          { name: 'Unified Emergency', note: 'All services', tag: '911', mark: '!' },
          { name: 'Police', note: 'General emergencies', tag: '999', mark: '!' },
          { name: 'MoH Hajj & Umrah Care', note: 'Ministry of Health help line', tag: '937', mark: '+' },
          { name: 'Traffic (Najm)', note: 'Road accidents', tag: '993', mark: '!' },
        ] },
        { key: 'Near Haram', name: 'Near the Haram', desc: 'Closest emergency care to Masjid al-Haram for quick help during your rites.', noun: 'facilities', items: [
          { name: 'Ajyad Emergency Hospital', note: 'Beside the Haram · emergency', tag: 'ER', mark: 'AJ' },
          { name: 'Al Haram Health Centres', note: 'First-aid points inside the mosque', tag: 'Aid', mark: 'HC' },
          { name: 'Jabal Omar Clinic', note: 'Walk-in · near the Haram', tag: 'Clinic', mark: 'JO' },
        ] },
        { key: 'Govt hospitals', name: 'Major government hospitals', desc: 'Large public hospitals with full emergency and specialist departments.', noun: 'hospitals', items: [
          { name: 'King Abdullah Medical City', note: 'Tertiary referral · cardiac & oncology', tag: 'KAMC', mark: 'KA' },
          { name: 'King Faisal Hospital', note: 'General · emergency', tag: 'Govt', mark: 'KF' },
          { name: 'Hera General Hospital', note: 'General · emergency', tag: 'Govt', mark: 'HG' },
          { name: 'King Abdulaziz Hospital', note: 'General · Zahir district', tag: 'Govt', mark: 'KZ' },
          { name: 'Al Noor Specialist Hospital', note: 'Specialist · emergency', tag: 'Govt', mark: 'NS' },
        ] },
        { key: 'Private', name: 'Private hospitals', desc: 'Private hospitals with international staff and faster outpatient service.', noun: 'hospitals', items: [
          { name: 'International Medical Center (clinics)', note: 'Private · outpatient', tag: 'Private', mark: 'IM' },
          { name: 'Dr. Erfan & Bagedo (branch)', note: 'Private · multi-specialty', tag: 'Private', mark: 'EB' },
          { name: 'Al Rawdah Medical Centres', note: 'Private clinics · walk-in', tag: 'Clinic', mark: 'RW' },
        ] },
        { key: 'Pharmacies', name: 'Pharmacies & clinics', desc: '24-hour pharmacy chains for medicine, basics and minor care.', noun: 'options', items: [
          { name: 'Al Nahdi Pharmacy', note: '24h · nationwide chain', tag: '24h', mark: 'NH' },
          { name: 'Al Dawaa Pharmacy', note: '24h · nationwide chain', tag: '24h', mark: 'DW' },
          { name: 'Whites Pharmacy', note: 'Pharmacy & basics', tag: 'Rx', mark: 'WH' },
          { name: 'Hotel doctor (on call)', note: 'Ask reception · many 5-star hotels', tag: 'Call', mark: 'HD' },
        ] },
      ],
      madinah: [
        { key: 'Emergency', name: 'Emergency & numbers', desc: 'Save these before you travel. Ambulance and emergency care are free for pilgrims.', noun: 'numbers', items: [
          { name: 'Red Crescent Ambulance', note: 'Emergency medical · free', tag: '997', mark: '+' },
          { name: 'Unified Emergency', note: 'All services', tag: '911', mark: '!' },
          { name: 'Police', note: 'General emergencies', tag: '999', mark: '!' },
          { name: 'MoH Hajj & Umrah Care', note: 'Ministry of Health help line', tag: '937', mark: '+' },
          { name: 'Traffic (Najm)', note: 'Road accidents', tag: '993', mark: '!' },
        ] },
        { key: 'Near Haram', name: 'Near the Haram', desc: 'Closest care to Masjid an-Nabawi and the central area.', noun: 'facilities', items: [
          { name: 'An-Nabawi Health Centres', note: 'First-aid points inside the mosque', tag: 'Aid', mark: 'HC' },
          { name: 'Central Area Clinics', note: 'Walk-in clinics around the Piazza', tag: 'Clinic', mark: 'CA' },
          { name: 'Miqat Hospital', note: 'General · close to centre', tag: 'ER', mark: 'MQ' },
        ] },
        { key: 'Govt hospitals', name: 'Major government hospitals', desc: 'Public hospitals with emergency and specialist departments.', noun: 'hospitals', items: [
          { name: 'King Salman bin Abdulaziz Medical City', note: 'Tertiary referral hub', tag: 'KSMC', mark: 'KS' },
          { name: 'King Fahd Hospital', note: 'General · emergency', tag: 'Govt', mark: 'KF' },
          { name: 'Ohud Hospital', note: 'General · emergency', tag: 'Govt', mark: 'OH' },
          { name: 'Prince Mohammed bin Abdulaziz Hospital', note: 'General · specialist', tag: 'Govt', mark: 'PM' },
          { name: 'Maternity & Children Hospital', note: 'Women & children', tag: 'Govt', mark: 'MC' },
        ] },
        { key: 'Private', name: 'Private hospitals', desc: 'Private hospitals with international staff and faster outpatient care.', noun: 'hospitals', items: [
          { name: 'Saudi German Hospital Madinah', note: 'Private · multi-specialty', tag: 'Private', mark: 'SG' },
          { name: 'Al Ansar Hospital', note: 'Private · general', tag: 'Private', mark: 'AN' },
          { name: 'Al Mowasat / Al Rahma clinics', note: 'Private clinics · walk-in', tag: 'Clinic', mark: 'MW' },
        ] },
        { key: 'Pharmacies', name: 'Pharmacies & clinics', desc: '24-hour pharmacy chains for medicine, basics and minor care.', noun: 'options', items: [
          { name: 'Al Nahdi Pharmacy', note: '24h · nationwide chain', tag: '24h', mark: 'NH' },
          { name: 'Al Dawaa Pharmacy', note: '24h · nationwide chain', tag: '24h', mark: 'DW' },
          { name: 'Whites Pharmacy', note: 'Pharmacy & basics', tag: 'Rx', mark: 'WH' },
          { name: 'Hotel doctor (on call)', note: 'Ask reception · many 5-star hotels', tag: 'Call', mark: 'HD' },
        ] },
      ],
    },
  },
  helpline: {
    slug: 'helpline',
    title: 'Helpline & SOS',
    subtitle: 'Numbers · register · embassy',
    icon: '🆘',
    cities: {
      makkah: [
        { key: 'Emergency', name: 'Emergency & numbers', desc: 'Save these before you travel. Ambulance and emergency care are free for pilgrims.', noun: 'numbers', items: [
          { name: 'Red Crescent Ambulance', note: 'Emergency medical · free', tag: '997', mark: '+' },
          { name: 'Unified Emergency', note: 'All services', tag: '911', mark: '!' },
          { name: 'Police', note: 'General emergencies', tag: '999', mark: '!' },
          { name: 'MoH Hajj & Umrah Care', note: 'Ministry of Health help line', tag: '937', mark: '+' },
          { name: 'Traffic (Najm)', note: 'Road accidents', tag: '993', mark: '!' },
        ] },
        { key: 'Register', name: 'Official apps to register', desc: 'Set these up on your phone before and during your trip — your visa, permits and ID live here.', noun: 'apps', items: [
          { name: 'Nusuk', note: 'Permits, Rawdah booking, services', tag: 'App', mark: 'NU' },
          { name: 'Tawakkalna', note: 'Digital ID & health status', tag: 'App', mark: 'TW' },
          { name: 'Absher', note: 'Government services & ID', tag: 'App', mark: 'AB' },
          { name: 'Asefny', note: 'Red Crescent emergency app', tag: 'SOS', mark: 'AS' },
        ] },
        { key: 'Embassy', name: 'Embassy & registration', desc: 'Register with your country before you fly, and keep consulate numbers saved.', noun: 'options', items: [
          { name: 'Register with your embassy', note: 'Before travel · online', tag: 'Do first', mark: 'EM' },
          { name: 'Consulates in Jeddah', note: 'Most consulates are in Jeddah', tag: 'JED', mark: 'CJ' },
          { name: 'Carry passport copies', note: 'Paper + photo on phone', tag: 'Docs', mark: 'DC' },
          { name: 'Group / agent contact', note: 'Save your AUJ rep number', tag: 'AUJ', mark: 'AJ' },
        ] },
        { key: 'Lost & found', name: 'Lost or separated', desc: 'If you lose your way or your group near Masjid al-Haram.', noun: 'options', items: [
          { name: 'Show your Nusuk / hotel card', note: 'Has your address in Arabic', tag: 'Tip', mark: 'CD' },
          { name: 'Haram lost & found', note: 'Ask any guard or service point', tag: 'Haram', mark: 'LF' },
          { name: 'Nearest police / 911', note: 'Officers help reunite groups', tag: '911', mark: 'PL' },
          { name: 'Wait at a fixed gate', note: 'Agree a meeting gate in advance', tag: 'Plan', mark: 'GT' },
        ] },
      ],
      madinah: [
        { key: 'Emergency', name: 'Emergency & numbers', desc: 'Save these before you travel. Ambulance and emergency care are free for pilgrims.', noun: 'numbers', items: [
          { name: 'Red Crescent Ambulance', note: 'Emergency medical · free', tag: '997', mark: '+' },
          { name: 'Unified Emergency', note: 'All services', tag: '911', mark: '!' },
          { name: 'Police', note: 'General emergencies', tag: '999', mark: '!' },
          { name: 'MoH Hajj & Umrah Care', note: 'Ministry of Health help line', tag: '937', mark: '+' },
          { name: 'Traffic (Najm)', note: 'Road accidents', tag: '993', mark: '!' },
        ] },
        { key: 'Register', name: 'Official apps to register', desc: 'Set these up on your phone — your visa, permits and Rawdah booking live here.', noun: 'apps', items: [
          { name: 'Nusuk', note: 'Permits, Rawdah booking, services', tag: 'App', mark: 'NU' },
          { name: 'Tawakkalna', note: 'Digital ID & health status', tag: 'App', mark: 'TW' },
          { name: 'Absher', note: 'Government services & ID', tag: 'App', mark: 'AB' },
          { name: 'Asefny', note: 'Red Crescent emergency app', tag: 'SOS', mark: 'AS' },
        ] },
        { key: 'Embassy', name: 'Embassy & registration', desc: 'Register with your country before you fly, and keep consulate numbers saved.', noun: 'options', items: [
          { name: 'Register with your embassy', note: 'Before travel · online', tag: 'Do first', mark: 'EM' },
          { name: 'Consulates in Jeddah', note: 'Most consulates are in Jeddah', tag: 'JED', mark: 'CJ' },
          { name: 'Carry passport copies', note: 'Paper + photo on phone', tag: 'Docs', mark: 'DC' },
          { name: 'Group / agent contact', note: 'Save your AUJ rep number', tag: 'AUJ', mark: 'AJ' },
        ] },
        { key: 'Lost & found', name: 'Lost or separated', desc: 'If you lose your way or your group near Masjid an-Nabawi.', noun: 'options', items: [
          { name: 'Show your Nusuk / hotel card', note: 'Has your address in Arabic', tag: 'Tip', mark: 'CD' },
          { name: 'Mosque lost & found', note: 'Ask any guard or service point', tag: 'Mosque', mark: 'LF' },
          { name: 'Nearest police / 911', note: 'Officers help reunite groups', tag: '911', mark: 'PL' },
          { name: 'Wait at a fixed gate', note: 'Agree a meeting gate in advance', tag: 'Plan', mark: 'GT' },
        ] },
      ],
    },
  },
};

export const GUIDE_SLUGS: GuideSlug[] = ['food', 'transport', 'connectivity', 'gifts', 'laundry', 'hospitals', 'helpline'];
