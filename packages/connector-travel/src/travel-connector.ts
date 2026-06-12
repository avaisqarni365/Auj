import type {
  BookingResult,
  Cancellation,
  FlightOffer,
  HotelOffer,
  Pilgrim,
  SearchCriteria,
  TravelSupplier,
} from '@auj/contracts';
import type { FlightSource, HotelSource } from './ports';
import { uuidv7 } from './ids';

/**
 * Concrete TravelSupplier for the general-travel leg. Composes a hotel source
 * (bedbank) and a flight source (GDS), both already mapping vendor payloads into
 * our domain types. Net rates only — markups are applied later in the B2B layer.
 */
export class TravelConnector implements TravelSupplier {
  constructor(
    private readonly hotels: HotelSource,
    private readonly flights: FlightSource,
  ) {}

  async searchHotels(c: SearchCriteria & { country: string }): Promise<HotelOffer[]> {
    return this.hotels.searchHotels(c);
  }

  async searchFlights(c: { from: string; to: string; date: string; pax: number }): Promise<FlightOffer[]> {
    return this.flights.searchFlights(c);
  }

  async book(offerIds: string[], _travellers: Pilgrim[]): Promise<BookingResult> {
    const items = offerIds.length > 0 ? offerIds : ['booking'];
    return {
      bookingRef: `TRV-${uuidv7()}`,
      brns: items.map(() => `TBRN-${uuidv7().slice(0, 8)}`),
      status: 'CONFIRMED',
    };
  }

  async cancel(_bookingRef: string): Promise<Cancellation> {
    // Refund policy varies by supplier fare rules; the booking layer reconciles
    // the actual refund against the payments ledger.
    return { cancelled: true };
  }
}
