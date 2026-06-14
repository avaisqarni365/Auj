import type { CateringOffer, FlightOffer, GroundOffer, HotelOffer, Money, PackageMode, RawdahPermit, RawdahSlot, SearchCriteria } from '@auj/contracts';
import type { Booking, CrmPilgrim, Customer, PackageItem, SpecialRequestCategory, SpecialRequestStatus, VisaCase } from '@auj/core-booking';

/**
 * The booking surface the B2C app talks to. The app NEVER imports a connector —
 * it depends on this port. The dev/test backend (backend/in-process.ts) is the one
 * composition root that wires core-booking + the env-selected connector.
 */
export interface BookingApi {
  searchHotels(c: SearchCriteria): Promise<HotelOffer[]>;
  searchFlights(c: { from: string; to: string; date: string; pax: number }): Promise<FlightOffer[]>;
  searchZiyarah(c: SearchCriteria): Promise<GroundOffer[]>;
  searchCatering(c: SearchCriteria): Promise<CateringOffer[]>;
  createCustomer(input: { fullName: string; email: string; phone?: string }): Promise<Customer>;
  addPilgrim(input: Omit<CrmPilgrim, 'id'>): Promise<CrmPilgrim>;
  createBooking(input: {
    customerId: string;
    channel: 'PILGRIMAGE' | 'TRAVEL';
    mode?: PackageMode;
    pilgrimIds: string[];
    items: PackageItem[];
    gift?: { recipientName: string; recipientEmail?: string; message?: string };
    specialRequests?: Array<{ category: SpecialRequestCategory; note?: string }>;
  }): Promise<Booking>;
  hold(bookingId: string): Promise<Booking>;
  confirm(bookingId: string, paymentRef: string): Promise<Booking>;
  startVisa(bookingId: string): Promise<{ booking: Booking; visaCase: VisaCase }>;
  refreshVisa(bookingId: string): Promise<VisaCase>;
  rawdahSlots(date: string): Promise<RawdahSlot[]>;
  bookRawdah(bookingId: string, slotId: string): Promise<RawdahPermit>;
  redeemGift(voucherCode: string): Promise<Booking>;
  setRequestStatus(bookingId: string, requestId: string, status: SpecialRequestStatus): Promise<Booking>;
  listBookings(): Promise<Booking[]>;
  /** Bookings belonging to the customer with this email (the logged-in user's account). */
  myBookings(email: string): Promise<Booking[]>;
  /** A single booking, only if it belongs to this email (ownership-checked). */
  myBooking(email: string, bookingId: string): Promise<Booking | undefined>;
  /** Pilgrims by id (for names + nationality on the detail view). */
  pilgrims(ids: string[]): Promise<CrmPilgrim[]>;
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
