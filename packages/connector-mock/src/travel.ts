import type {
  TravelSupplier,
  SearchCriteria,
  HotelOffer,
  FlightOffer,
  BookingResult,
  Pilgrim,
  Cancellation,
} from '@auj/contracts';
import { TRAVEL_HOTELS, FLIGHTS } from './catalog';

/** In-memory TravelSupplier for the general-travel leg (zero Saudi dependency). */
export class MockTravelSupplier implements TravelSupplier {
  private seq = 0;

  private id(prefix: string): string {
    this.seq += 1;
    return `${prefix}_${this.seq.toString().padStart(4, '0')}`;
  }

  async searchHotels(_c: SearchCriteria & { country: string }): Promise<HotelOffer[]> {
    return TRAVEL_HOTELS;
  }

  async searchFlights(_c: {
    from: string;
    to: string;
    date: string;
    pax: number;
  }): Promise<FlightOffer[]> {
    return FLIGHTS;
  }

  async book(offerIds: string[], _travellers: Pilgrim[]): Promise<BookingResult> {
    const items = offerIds.length > 0 ? offerIds : ['booking'];
    return {
      bookingRef: this.id('TBK'),
      brns: items.map(() => this.id('BRN')),
      status: 'CONFIRMED',
    };
  }

  async cancel(_bookingRef: string): Promise<Cancellation> {
    return { cancelled: true, refund: { amount: 20000, currency: 'EUR' } };
  }
}
