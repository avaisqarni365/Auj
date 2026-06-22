// Typed, client-safe departure-airport content for the per-airport
// "Departing from your city" hub. Pure data + pure helpers only.
// No imports that pull in pg / node — this module is safe to ship to the client.

export type DepartRegion = 'Baltics' | 'Central Europe' | 'Western Europe';

export interface DepartRoute {
  dest: 'Makkah' | 'Madinah';
  hub: string;        // the entry airport, 'JED' (Jeddah, for Makkah) or 'MED' (Madinah)
  airlines: string[]; // realistic carriers that actually serve this routing
  via: string;        // typical connecting hub, e.g. 'via Istanbul', 'via Doha', 'Direct (seasonal)'
  frequency: string;  // e.g. 'Daily', '4×/week', 'Seasonal · Ramadan & peak'
  durationText: string; // e.g. '~7h 30m incl. layover'
}

export interface DepartAirport {
  code: string;       // IATA
  city: string;
  country: string;
  region: DepartRegion;
  blurb: string;      // one calm sentence about flying Umrah from here
  checkInSteps: string[];   // 5 short, practical check-in/airport steps for THIS airport
  toMakkah: DepartRoute[];  // routings to JED (1-3 options)
  toMadinah: DepartRoute[]; // routings to MED (1-3 options)
  arrivalsNote: string;     // one line about return flights ARRIVING from Jeddah/Madinah back to this city
}

export const DEPART_AIRPORTS: DepartAirport[] = [
  // ----------------------------- Baltics -----------------------------
  {
    code: 'VNO',
    city: 'Vilnius',
    country: 'Lithuania',
    region: 'Baltics',
    blurb: 'From Vilnius your Umrah almost always begins with one easy connection through Istanbul, Doha or Warsaw.',
    checkInSteps: [
      'Arrive at Vilnius Airport (VNO) about 2.5 hours before your flight; there is a single compact terminal.',
      'Drop your bags at the Turkish, LOT or Qatar desk and confirm your bags are tagged through to JED or MED.',
      'Clear the EU passport and security check early — queues build before the morning connecting waves.',
      'Pack your Ihram and essentials in your cabin bag in case you need them before reaching the kingdom.',
      'Track your onward gate at your connecting hub; layovers in Istanbul or Doha are short to medium.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: 'Daily',
        durationText: '~9h 30m incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Qatar Airways'],
        via: 'via Doha',
        frequency: '5×/week',
        durationText: '~12h incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['LOT Polish Airlines', 'Saudia'],
        via: 'via Warsaw',
        frequency: '4×/week',
        durationText: '~10h incl. layover',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '4×/week',
        durationText: '~10h incl. layover',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['flydubai', 'Emirates'],
        via: 'via Dubai',
        frequency: '3×/week',
        durationText: '~13h incl. layover',
      },
    ],
    arrivalsNote: 'Return flights from Jeddah or Madinah land back at VNO via the same Istanbul, Doha or Warsaw hubs, usually in the morning.',
  },
  {
    code: 'RIX',
    city: 'Riga',
    country: 'Latvia',
    region: 'Baltics',
    blurb: 'Riga is the Baltic hub for airBaltic feeds, with smooth single-stop Umrah routings via Istanbul, Doha or Dubai.',
    checkInSteps: [
      'Reach Riga Airport (RIX) roughly 2.5 hours ahead; it is the largest airport in the Baltics but easy to navigate.',
      'Check in at the airBaltic, Turkish or Qatar desk and ask for boarding passes for both legs.',
      'Pass the EU exit passport control and security in the main departures hall.',
      'Use the airside cafes and prayer-friendly quiet corners before your connecting flight.',
      'Recheck your onward gate on arrival at the connecting hub, as gates can change at short notice.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: 'Daily',
        durationText: '~9h 45m incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Qatar Airways', 'airBaltic'],
        via: 'via Doha',
        frequency: '5×/week',
        durationText: '~12h incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['flydubai', 'Emirates'],
        via: 'via Dubai',
        frequency: '4×/week',
        durationText: '~13h incl. layover',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '4×/week',
        durationText: '~10h 15m incl. layover',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Saudia', 'LOT Polish Airlines'],
        via: 'via Warsaw',
        frequency: '3×/week',
        durationText: '~11h incl. layover',
      },
    ],
    arrivalsNote: 'Return services to RIX arrive from Jeddah and Madinah through Istanbul, Doha or Dubai, often with a same-day final leg.',
  },
  {
    code: 'TLL',
    city: 'Tallinn',
    country: 'Estonia',
    region: 'Baltics',
    blurb: 'From compact, calm Tallinn your Umrah connects neatly through Istanbul, Warsaw or Dubai.',
    checkInSteps: [
      'Arrive at Tallinn Airport (TLL) about 2 hours early; it is small, modern and quick to move through.',
      'Drop bags at the Turkish, LOT or flydubai desk and confirm through-tagging to JED or MED.',
      'Clear the EU passport check and the single security line in the main hall.',
      'Relax in the famously cosy lounges and reading nooks before your gate is called.',
      'Confirm your connecting gate after landing at your hub, especially for short layovers in Istanbul.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: 'Daily',
        durationText: '~10h incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['LOT Polish Airlines', 'Saudia'],
        via: 'via Warsaw',
        frequency: '4×/week',
        durationText: '~10h 30m incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['flydubai', 'Emirates'],
        via: 'via Dubai',
        frequency: '3×/week',
        durationText: '~13h 30m incl. layover',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '4×/week',
        durationText: '~10h 30m incl. layover',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['flydubai'],
        via: 'via Dubai',
        frequency: '2×/week',
        durationText: '~14h incl. layover',
      },
    ],
    arrivalsNote: 'Flights back to TLL arrive from Jeddah and Madinah via Istanbul, Warsaw or Dubai, typically landing in the afternoon.',
  },
  {
    code: 'KUN',
    city: 'Kaunas',
    country: 'Lithuania',
    region: 'Baltics',
    blurb: 'Kaunas leans on low-cost feeds, so most Umrah journeys self-connect or route through Istanbul and Warsaw.',
    checkInSteps: [
      'Get to Kaunas Airport (KUN) about 2.5 hours early; it is a small low-cost base, so allow time at peak waves.',
      'Check in at the Ryanair, Wizz Air or Turkish desk; on separate low-cost tickets you may need to re-drop bags at the hub.',
      'Clear the EU passport and security check in the single departures area.',
      'Keep your Ihram and key documents in your cabin bag, as self-connections leave less buffer.',
      'At your connecting hub, collect and re-check bags if you are on separate low-cost tickets.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '5×/week',
        durationText: '~10h 30m incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Wizz Air', 'Pegasus'],
        via: 'via Istanbul (self-connect)',
        frequency: '4×/week',
        durationText: '~11h incl. self-connect',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Ryanair', 'LOT Polish Airlines'],
        via: 'via Warsaw',
        frequency: '3×/week',
        durationText: '~11h incl. self-connect',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Pegasus'],
        via: 'via Istanbul Sabiha (self-connect)',
        frequency: '3×/week',
        durationText: '~12h incl. self-connect',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '2×/week',
        durationText: '~11h 30m incl. layover',
      },
    ],
    arrivalsNote: 'Return flights to KUN arrive from Jeddah and Madinah via Istanbul or Warsaw; on low-cost legs plan a comfortable connection buffer.',
  },

  // -------------------------- Central Europe --------------------------
  {
    code: 'WAW',
    city: 'Warsaw',
    country: 'Poland',
    region: 'Central Europe',
    blurb: 'Warsaw is itself a major connecting hub, with LOT and Saudia offering some of the shortest one-stop Umrah routings for the region.',
    checkInSteps: [
      'Arrive at Warsaw Chopin Airport (WAW) about 3 hours early; LOT and most long-haul desks are in Terminal A.',
      'Check in at the LOT, Saudia, Turkish or Qatar desk and confirm bags are tagged through to JED or MED.',
      'Clear the Schengen exit passport control and security in the departures level.',
      'Use the airside prayer room and lounges before boarding your onward flight.',
      'If connecting onward, note that LOT keeps transfers in one terminal for quick gate-to-gate moves.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['LOT Polish Airlines', 'Saudia'],
        via: 'Direct (seasonal) / via Warsaw base',
        frequency: 'Seasonal · Ramadan & peak',
        durationText: '~6h 15m direct',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: 'Daily',
        durationText: '~9h incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Qatar Airways'],
        via: 'via Doha',
        frequency: 'Daily',
        durationText: '~11h incl. layover',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['LOT Polish Airlines', 'Saudia'],
        via: 'Direct (seasonal)',
        frequency: 'Seasonal · Ramadan & peak',
        durationText: '~6h direct',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '5×/week',
        durationText: '~9h 30m incl. layover',
      },
    ],
    arrivalsNote: 'Return flights land at WAW either direct from Jeddah and Madinah in peak season or via Istanbul and Doha year-round.',
  },
  {
    code: 'BER',
    city: 'Berlin',
    country: 'Germany',
    region: 'Central Europe',
    blurb: 'From Berlin Brandenburg you reach Makkah and Madinah with a single comfortable stop in Istanbul, Doha or Dubai.',
    checkInSteps: [
      'Arrive at Berlin Brandenburg Airport (BER) about 3 hours early; long-haul carriers use Terminal 1.',
      'Check in at the Turkish, Qatar or flydubai desk and confirm through-tagged bags to JED or MED.',
      'Clear the Schengen exit passport control and the central security checkpoint.',
      'Use the quiet rooms and airside services in Terminal 1 before boarding.',
      'On arrival at your hub, follow transfer signage to your onward gate for Jeddah or Madinah.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: 'Daily',
        durationText: '~8h 45m incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Qatar Airways'],
        via: 'via Doha',
        frequency: 'Daily',
        durationText: '~11h incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['flydubai', 'Emirates'],
        via: 'via Dubai',
        frequency: '5×/week',
        durationText: '~12h 30m incl. layover',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '5×/week',
        durationText: '~9h 15m incl. layover',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Saudia'],
        via: 'via Jeddah',
        frequency: '3×/week',
        durationText: '~10h incl. layover',
      },
    ],
    arrivalsNote: 'Return flights to BER arrive from Jeddah and Madinah via Istanbul, Doha or Dubai, with most morning and evening landings.',
  },
  {
    code: 'VIE',
    city: 'Vienna',
    country: 'Austria',
    region: 'Central Europe',
    blurb: 'Vienna offers a seasonal Saudia link plus reliable one-stop Umrah routings through Istanbul and Doha.',
    checkInSteps: [
      'Arrive at Vienna International Airport (VIE) about 3 hours early; check the FIDS for your check-in island.',
      'Drop bags at the Austrian, Saudia, Turkish or Qatar desk and confirm tagging to JED or MED.',
      'Clear the Schengen exit passport control and security at the main checkpoint.',
      'Use the airside multi-faith prayer room before your flight is called.',
      'Connecting passengers transfer airside; follow the gate signage to your onward flight.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Saudia'],
        via: 'Direct (seasonal)',
        frequency: 'Seasonal · Ramadan & peak',
        durationText: '~5h 45m direct',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: 'Daily',
        durationText: '~8h 30m incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Qatar Airways'],
        via: 'via Doha',
        frequency: 'Daily',
        durationText: '~10h 45m incl. layover',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '5×/week',
        durationText: '~9h incl. layover',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['flydubai', 'Emirates'],
        via: 'via Dubai',
        frequency: '3×/week',
        durationText: '~12h incl. layover',
      },
    ],
    arrivalsNote: 'Return services to VIE arrive direct from Jeddah in peak season or via Istanbul and Doha throughout the year.',
  },
  {
    code: 'PRG',
    city: 'Prague',
    country: 'Czech Republic',
    region: 'Central Europe',
    blurb: 'From Prague your Umrah connects smoothly via Istanbul, Doha or nearby Warsaw on a single stop.',
    checkInSteps: [
      'Arrive at Prague Vaclav Havel Airport (PRG) about 3 hours early; long-haul carriers use Terminal 1.',
      'Check in at the Turkish, Qatar or LOT desk and confirm bags are tagged through to JED or MED.',
      'Clear the Schengen exit passport control before security in Terminal 1.',
      'Use the airside quiet areas and refreshments before boarding.',
      'At your connecting hub, watch the screens and move promptly to your onward gate.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: 'Daily',
        durationText: '~8h 45m incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Qatar Airways'],
        via: 'via Doha',
        frequency: '6×/week',
        durationText: '~11h incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['LOT Polish Airlines', 'Saudia'],
        via: 'via Warsaw',
        frequency: '4×/week',
        durationText: '~9h 30m incl. layover',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '4×/week',
        durationText: '~9h 15m incl. layover',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['flydubai', 'Emirates'],
        via: 'via Dubai',
        frequency: '2×/week',
        durationText: '~12h 30m incl. layover',
      },
    ],
    arrivalsNote: 'Return flights to PRG arrive from Jeddah and Madinah via Istanbul, Doha or Warsaw, typically with a single same-day connection.',
  },

  // -------------------------- Western Europe --------------------------
  {
    code: 'DUB',
    city: 'Dublin',
    country: 'Ireland',
    region: 'Western Europe',
    blurb: 'From Dublin your Umrah routes east with one stop in Istanbul, Doha, Dubai or Paris.',
    checkInSteps: [
      'Arrive at Dublin Airport (DUB) about 3 hours early; most long-haul departures use Terminal 2.',
      'Check in at the Turkish, Qatar, Emirates or Air France desk and confirm tagging to JED or MED.',
      'Clear security, then proceed through the standard departures; non-Schengen exit checks are at the gate hubs.',
      'Use the prayer room and lounges in Terminal 2 before boarding.',
      'On arrival at your connecting hub, follow the transfer signage straight to your onward gate.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: 'Daily',
        durationText: '~10h 30m incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Qatar Airways'],
        via: 'via Doha',
        frequency: 'Daily',
        durationText: '~12h 30m incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Emirates', 'flydubai'],
        via: 'via Dubai',
        frequency: 'Daily',
        durationText: '~13h incl. layover',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '5×/week',
        durationText: '~11h incl. layover',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Saudia', 'Air France'],
        via: 'via Paris',
        frequency: '3×/week',
        durationText: '~11h 30m incl. layover',
      },
    ],
    arrivalsNote: 'Return flights to DUB arrive from Jeddah and Madinah via Istanbul, Doha, Dubai or Paris, mostly landing in the late afternoon.',
  },
  {
    code: 'AMS',
    city: 'Amsterdam',
    country: 'Netherlands',
    region: 'Western Europe',
    blurb: 'Amsterdam Schiphol offers a seasonal Saudia direct plus dependable one-stop routings via Istanbul and Doha.',
    checkInSteps: [
      'Arrive at Amsterdam Schiphol (AMS) about 3 hours early; it is a single large terminal with many check-in rows.',
      'Drop bags at the Saudia, KLM, Turkish or Qatar desk and confirm through-tagging to JED or MED.',
      'Clear the Schengen exit passport control and the central security filter.',
      'Use the airside meditation centre and quiet areas before your flight.',
      'Connecting passengers stay airside; follow the lettered pier signage to your onward gate.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Saudia'],
        via: 'Direct (seasonal)',
        frequency: 'Seasonal · Ramadan & peak',
        durationText: '~6h 15m direct',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: 'Daily',
        durationText: '~9h incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Qatar Airways'],
        via: 'via Doha',
        frequency: 'Daily',
        durationText: '~11h incl. layover',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Saudia'],
        via: 'Direct (seasonal)',
        frequency: 'Seasonal · Ramadan & peak',
        durationText: '~6h direct',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '5×/week',
        durationText: '~9h 30m incl. layover',
      },
    ],
    arrivalsNote: 'Return flights to AMS arrive direct from Jeddah and Madinah in peak season or via Istanbul and Doha all year round.',
  },
  {
    code: 'BRU',
    city: 'Brussels',
    country: 'Belgium',
    region: 'Western Europe',
    blurb: 'From Brussels your Umrah connects through Istanbul, Doha or nearby Paris on a single comfortable stop.',
    checkInSteps: [
      'Arrive at Brussels Airport (BRU) about 3 hours early; check-in is across rows 1 to 12 on the departures level.',
      'Drop bags at the Turkish, Qatar or Air France desk and confirm tagging to JED or MED.',
      'Clear the Schengen exit passport control before the central security checkpoint.',
      'Use the airside prayer room and lounges in the connector pier before boarding.',
      'On arrival at your hub, follow the transfer signage straight to your onward Jeddah or Madinah gate.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: 'Daily',
        durationText: '~9h incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Qatar Airways'],
        via: 'via Doha',
        frequency: 'Daily',
        durationText: '~11h incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Saudia', 'Air France'],
        via: 'via Paris',
        frequency: '4×/week',
        durationText: '~9h 30m incl. layover',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '4×/week',
        durationText: '~9h 30m incl. layover',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['flydubai', 'Emirates'],
        via: 'via Dubai',
        frequency: '3×/week',
        durationText: '~12h incl. layover',
      },
    ],
    arrivalsNote: 'Return flights to BRU arrive from Jeddah and Madinah via Istanbul, Doha or Paris, usually with one same-day connection.',
  },
  {
    code: 'CDG',
    city: 'Paris',
    country: 'France',
    region: 'Western Europe',
    blurb: 'Paris Charles de Gaulle is a Saudia and Air France hub, with frequent direct flights to Jeddah and Madinah.',
    checkInSteps: [
      'Arrive at Paris Charles de Gaulle (CDG) about 3.5 hours early; confirm whether you depart from Terminal 1 or 2.',
      'Check in at the Saudia, Air France, Turkish or Qatar desk and confirm bags tagged to JED or MED.',
      'Clear the Schengen exit passport control and security in your assigned terminal.',
      'Use the airside prayer rooms and lounges; allow time to move between CDG terminals if connecting.',
      'For direct flights, head to your gate early as long-haul boarding starts well ahead.',
    ],
    toMakkah: [
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Saudia', 'Air France'],
        via: 'Direct',
        frequency: 'Daily',
        durationText: '~6h 30m direct',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: 'Daily',
        durationText: '~9h incl. layover',
      },
      {
        dest: 'Makkah',
        hub: 'JED',
        airlines: ['Qatar Airways'],
        via: 'via Doha',
        frequency: 'Daily',
        durationText: '~11h incl. layover',
      },
    ],
    toMadinah: [
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Saudia'],
        via: 'Direct',
        frequency: '4×/week',
        durationText: '~6h 15m direct',
      },
      {
        dest: 'Madinah',
        hub: 'MED',
        airlines: ['Turkish Airlines'],
        via: 'via Istanbul',
        frequency: '5×/week',
        durationText: '~9h 30m incl. layover',
      },
    ],
    arrivalsNote: 'Return flights to CDG arrive direct from Jeddah and Madinah on Saudia and Air France, or via Istanbul and Doha.',
  },
];

export const DEPART_REGIONS: DepartRegion[] = ['Baltics', 'Central Europe', 'Western Europe'];

export function departAirport(code: string): DepartAirport | undefined {
  return DEPART_AIRPORTS.find((a) => a.code === code);
}

export const DEPART_CODES = DEPART_AIRPORTS.map((a) => a.code);
