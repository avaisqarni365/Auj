import type { FlightOffer, HotelOffer, SearchCriteria } from '@auj/contracts';

/** A hotel supply source (a bedbank), already normalized to our domain types. */
export interface HotelSource {
  searchHotels(c: SearchCriteria & { country: string }): Promise<HotelOffer[]>;
}

/** A flight supply source (a GDS), already normalized to our domain types. */
export interface FlightSource {
  searchFlights(c: { from: string; to: string; date: string; pax: number }): Promise<FlightOffer[]>;
}
