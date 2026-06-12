import { describe, it, expect } from 'vitest';
import { FlightOfferSchema } from '@auj/contracts';
import { AmadeusFlightSource, SandboxFlightClient, mapAmadeusFlight } from './flights';

describe('flight adapter', () => {
  it('maps a multi-segment offer to first-departure / last-arrival', () => {
    const offer = mapAmadeusFlight({
      id: '9',
      validatingAirlineCodes: ['TK'],
      itineraries: [
        { segments: [
          { departure: { iataCode: 'VNO', at: '2026-09-01T10:00:00' }, arrival: { iataCode: 'IST', at: '2026-09-01T13:00:00' } },
          { departure: { iataCode: 'IST', at: '2026-09-01T15:00:00' }, arrival: { iataCode: 'JED', at: '2026-09-01T19:00:00' } },
        ] },
      ],
      price: { total: '298.40', currency: 'EUR' },
    });
    expect(offer.carrier).toBe('TK');
    expect(offer.depart).toBe('2026-09-01T10:00:00');
    expect(offer.arrive).toBe('2026-09-01T19:00:00');
    expect(offer.net).toEqual({ amount: 29840, currency: 'EUR' });
    FlightOfferSchema.parse(offer);
  });

  it('searches via the injected client and returns schema-valid offers', async () => {
    const source = new AmadeusFlightSource(new SandboxFlightClient());
    const offers = await source.searchFlights({ from: 'VNO', to: 'JED', date: '2026-09-01', pax: 1 });
    expect(offers.length).toBeGreaterThan(0);
    for (const o of offers) FlightOfferSchema.parse(o);
  });
});
