import type {
  SearchCriteria,
  HotelOffer,
  TransportOffer,
  GroundOffer,
  FlightOffer,
  HoldRef,
  BookingResult,
  VisaApplication,
  VisaStatus,
  Pilgrim,
  Cancellation,
  RawdahSlot,
  RawdahPermit,
  CateringOffer,
} from './domain';

/**
 * The single seam between product modules and the regulated Saudi pipe
 * (Maqam GDS / Nusuk Masar). Implemented by connector-mock (default) and
 * connector-saudi (gated). Product modules import THIS, never a concrete adapter.
 */
export interface SaudiConnector {
  searchHotels(c: SearchCriteria): Promise<HotelOffer[]>;
  searchTransport(c: SearchCriteria): Promise<TransportOffer[]>;
  searchGroundServices(c: SearchCriteria): Promise<GroundOffer[]>;
  /** Curated ziyarah (heritage-visit) bundles for the city (Nusuk parity). */
  searchZiyarah(c: SearchCriteria): Promise<GroundOffer[]>;
  /** Meal/catering plans for the city (Nusuk parity). */
  searchCatering(c: SearchCriteria): Promise<CateringOffer[]>;
  hold(offerIds: string[], pilgrims: Pilgrim[]): Promise<HoldRef>;
  /** Confirms a hold against a payment reference and returns BRNs. */
  confirm(holdId: string, payment: { ref: string }): Promise<BookingResult>;
  createVisaApplication(bookingRef: string, pilgrims: Pilgrim[]): Promise<VisaApplication>;
  getVisaStatus(visaRef: string): Promise<VisaStatus>;
  /** Rawdah (Riyadh ul-Jannah) permit slots in Madinah for a date (Nusuk parity). */
  searchRawdahSlots(date: string): Promise<RawdahSlot[]>;
  bookRawdah(slotId: string, pilgrims: Pilgrim[]): Promise<RawdahPermit>;
  cancel(bookingRef: string): Promise<Cancellation>;
}

/**
 * General (non-pilgrimage) travel supply via open APIs (bedbanks + flight GDS).
 * Zero Saudi dependency — powers the first launchable revenue leg.
 */
export interface TravelSupplier {
  searchHotels(c: SearchCriteria & { country: string }): Promise<HotelOffer[]>;
  searchFlights(c: { from: string; to: string; date: string; pax: number }): Promise<FlightOffer[]>;
  book(offerIds: string[], travellers: Pilgrim[]): Promise<BookingResult>;
  cancel(bookingRef: string): Promise<Cancellation>;
}

/** Names of the env-selectable connector/supplier implementations. */
export type ConnectorKind = 'mock' | 'saudi';
export type SupplierKind = 'mock' | 'live';
