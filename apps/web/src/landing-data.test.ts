import { describe, it, expect } from 'vitest';
import type { HotelOffer } from '@auj/contracts';
import { buildDeals, pairDeals } from './landing-data';
import { DEALS } from './content';

const hotel = (id: string, name: string, nightly: number): HotelOffer => ({
  id, name, city: 'MAKKAH', starRating: 5, nightlyNet: { amount: nightly, currency: 'EUR' }, nusukApproved: true,
});

describe('landing deals (connector seam → cards)', () => {
  it('pairDeals falls back to the curated DEALS when either side is empty', () => {
    expect(pairDeals([], [hotel('m', 'Anwar', 10000)])).toBe(DEALS);
    expect(pairDeals([hotel('k', 'Hilton', 10000)], [])).toBe(DEALS);
  });

  it('pairDeals builds 3 cards cheapest→premium with correct price math', () => {
    const makkah = [hotel('k2', 'Pricey', 20000), hotel('k1', 'Cheap', 10000)];
    const madinah = [hotel('d2', 'Pricey', 16000), hotel('d1', 'Cheap', 8000)];
    const deals = pairDeals(makkah, madinah);
    expect(deals).toHaveLength(3);
    // first plan = 6 Makkah + 3 Madinah nights + flight estimate, on the cheapest hotels
    expect(deals[0]!.makkahNights).toBe(6);
    expect(deals[0]!.madinahNights).toBe(3);
    expect(deals[0]!.makkahHotel).toBe('Cheap'); // sorted cheapest-first
    expect(deals[0]!.price.amount).toBe(10000 * 6 + 8000 * 3 + 28000);
    expect(deals[0]!.price.currency).toBe('EUR');
    expect(deals[0]!.days).toBe(6 + 3 + 1);
  });

  it('buildDeals returns 3 non-empty deal cards against the (mock) connector seam', async () => {
    const deals = await buildDeals();
    expect(deals.length).toBeGreaterThanOrEqual(3);
    expect(deals.every((d) => d.makkahHotel.trim() && d.price.amount > 0)).toBe(true);
  });
});
