// Server-side landing data. Builds the "This week's deals" cards from REAL connector
// offers (the env-selected SaudiConnector — mock today, Maqam/Nusuk when CONNECTOR=saudi),
// so the landing reflects live supply instead of hard-coded cards. Falls back to the
// static DEALS if the connector returns nothing (keeps the section non-empty offline).
import type { HotelOffer } from '@auj/contracts';
import { getBookingBackend } from './book/backend/singleton';
import { DEALS, type Deal } from './content';

const DEPARTURES = ['Vilnius (VNO)', 'Warsaw (WAW)', 'Dublin (DUB)'];
const FLIGHT_ESTIMATE = 28000; // indicative return airfare in minor units (EUR), per pilgrim
const SEARCH = { checkIn: '2026-09-12', checkOut: '2026-09-26', pax: 4 } as const;

const cheapestFirst = (a: HotelOffer, b: HotelOffer): number => a.nightlyNet.amount - b.nightlyNet.amount;

const PLANS = [
  { makkahNights: 6, madinahNights: 3 },
  { makkahNights: 9, madinahNights: 4 },
  { makkahNights: 7, madinahNights: 4 },
];

/** Pure: pair Makkah + Madinah offers into 3 deal cards (cheapest → premium). Falls back to the
 *  curated static DEALS when either side is empty, so the section is never blank. */
export function pairDeals(makkah: HotelOffer[], madinah: HotelOffer[]): Deal[] {
  if (makkah.length === 0 || madinah.length === 0) return DEALS;
  const mk = [...makkah].sort(cheapestFirst);
  const md = [...madinah].sort(cheapestFirst);
  return PLANS.map((p, i) => {
    const m = mk[Math.min(i, mk.length - 1)]!;
    const d = md[Math.min(i, md.length - 1)]!;
    const price = m.nightlyNet.amount * p.makkahNights + d.nightlyNet.amount * p.madinahNights + FLIGHT_ESTIMATE;
    return {
      id: `${m.id}-${d.id}`,
      days: p.makkahNights + p.madinahNights + 1,
      makkahHotel: m.name,
      makkahNights: p.makkahNights,
      madinahHotel: d.name,
      madinahNights: p.madinahNights,
      from: DEPARTURES[i] ?? DEPARTURES[0]!,
      price: { amount: price, currency: 'EUR' as const },
      scene: i === 1 ? 'madinah' : 'makkah',
    };
  });
}

/** Pull live Makkah + Madinah offers (env-selected connector seam) and pair them into deal cards. */
export async function buildDeals(): Promise<Deal[]> {
  try {
    const backend = await getBookingBackend();
    const [makkah, madinah] = await Promise.all([
      backend.booking.searchHotels({ city: 'MAKKAH', ...SEARCH }),
      backend.booking.searchHotels({ city: 'MADINAH', ...SEARCH }),
    ]);
    return pairDeals(makkah, madinah);
  } catch {
    return DEALS; // connector unavailable → curated fallback
  }
}
