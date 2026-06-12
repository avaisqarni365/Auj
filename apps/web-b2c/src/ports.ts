import type { FlightOffer, HotelOffer, Money, SearchCriteria } from '@auj/contracts';
import type { Booking, CrmPilgrim, Customer, PackageItem, VisaCase } from '@auj/core-booking';

/**
 * The booking surface the B2C app talks to. The app NEVER imports a connector —
 * it depends on this port. The dev/test backend (backend/in-process.ts) is the one
 * composition root that wires core-booking + the env-selected connector.
 */
export interface BookingApi {
  searchHotels(c: SearchCriteria): Promise<HotelOffer[]>;
  searchFlights(c: { from: string; to: string; date: string; pax: number }): Promise<FlightOffer[]>;
  createCustomer(input: { fullName: string; email: string; phone?: string }): Promise<Customer>;
  addPilgrim(input: Omit<CrmPilgrim, 'id'>): Promise<CrmPilgrim>;
  createBooking(input: {
    customerId: string;
    channel: 'PILGRIMAGE' | 'TRAVEL';
    pilgrimIds: string[];
    items: PackageItem[];
  }): Promise<Booking>;
  hold(bookingId: string): Promise<Booking>;
  confirm(bookingId: string, paymentRef: string): Promise<Booking>;
  startVisa(bookingId: string): Promise<{ booking: Booking; visaCase: VisaCase }>;
  refreshVisa(bookingId: string): Promise<VisaCase>;
  getBooking(bookingId: string): Promise<Booking | undefined>;
}

export type PaymentMethod = 'CARD' | 'SEPA' | 'WALLET';

export interface PaymentsApi {
  pay(input: {
    amount: Money;
    bookingRef: string;
    idempotencyKey: string;
    method?: PaymentMethod;
  }): Promise<{ paymentRef: string }>;
}

export interface Backend {
  booking: BookingApi;
  payments: PaymentsApi;
}
