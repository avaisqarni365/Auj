import { describe, it, expect } from 'vitest';
import { HotelOfferSchema } from '@auj/contracts';
import { BedbankHotelSource, SandboxBedbankClient, mapBedbankHotel } from './bedbank';

describe('bedbank adapter', () => {
  it('maps vendor major-units price into our minor-units Money', () => {
    const offer = mapBedbankHotel({
      HotelCode: 'X1',
      HotelName: 'Test Hotel',
      CityName: 'Dubai',
      StarRating: 4,
      Price: { RoomRateMajor: 120.5, CurrencyCode: 'EUR' },
    });
    expect(offer.nightlyNet).toEqual({ amount: 12050, currency: 'EUR' });
    expect(offer.id).toBe('tbo:X1');
    expect(offer.nusukApproved).toBe(false);
    expect(HotelOfferSchema.parse(offer)).toBeTruthy();
  });

  it('searches via the injected client and returns schema-valid offers', async () => {
    const source = new BedbankHotelSource(new SandboxBedbankClient());
    const offers = await source.searchHotels({ city: 'JEDDAH', country: 'AE', checkIn: '2026-10-01', checkOut: '2026-10-04', pax: 2 });
    expect(offers.length).toBeGreaterThan(0);
    for (const o of offers) HotelOfferSchema.parse(o);
  });
});
