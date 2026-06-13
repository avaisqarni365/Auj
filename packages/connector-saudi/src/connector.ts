import type {
  BookingResult,
  Cancellation,
  CateringOffer,
  Currency,
  GroundOffer,
  HoldRef,
  HotelOffer,
  Pilgrim,
  RawdahPermit,
  RawdahSlot,
  SaudiConnector,
  SearchCriteria,
  TransportOffer,
  VisaApplication,
  VisaStatus,
} from '@auj/contracts';
import type { SaudiPartnerClient } from './client';
import { SandboxSaudiPartnerClient } from './client';
import { mapBookingState, mapCatering, mapGround, mapHotel, mapRawdahSlot, mapRawdahState, mapRoute, mapTransport, mapVisaState, mapZiyarah, toCityCode } from './mappers';

/** Partner connection config (token auth, per-agent codes). The sandbox ignores it. */
export interface SaudiPartnerConfig {
  baseUrl?: string;
  agentCode?: string;
  token?: string;
}

/** Visa issuance requires a Nusuk-approved hotel booking (2025 rule). */
export class NusukApprovalError extends Error {
  constructor(bookingRef: string) {
    super(`Visa flow blocked: booking ${bookingRef} has no Nusuk-approved hotel`);
    this.name = 'NusukApprovalError';
  }
}

/** Retry transient failures on idempotent reads. */
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/**
 * Real-shaped SaudiConnector backed by the partner client. Drop-in for connector-mock,
 * selected by env (CONNECTOR=saudi). Maps vendor payloads -> domain, keeps BRNs verbatim,
 * and enforces the Nusuk-approved-hotel rule on visa flows.
 */
export class SaudiPartnerConnector implements SaudiConnector {
  private readonly hotelApproval = new Map<string, boolean>(); // offerId -> nusukApproved (from search)
  private readonly holds = new Map<string, string[]>(); // holdId -> offerIds
  private readonly bookingApproved = new Map<string, boolean>(); // bookingRef -> had an approved hotel

  constructor(
    private readonly client: SaudiPartnerClient = new SandboxSaudiPartnerClient(),
    private readonly config: SaudiPartnerConfig = {},
  ) {
    void this.config; // used by a real HTTP client; held for parity
  }

  async searchHotels(c: SearchCriteria): Promise<HotelOffer[]> {
    const raw = await withRetry(() =>
      this.client.searchHotels({ cityCode: toCityCode(c.city), checkIn: c.checkIn, checkOut: c.checkOut, pax: c.pax }),
    );
    const offers = raw.map(mapHotel);
    for (const o of offers) this.hotelApproval.set(o.id, o.nusukApproved);
    return offers;
  }

  async searchTransport(c: SearchCriteria): Promise<TransportOffer[]> {
    const raw = await withRetry(() => this.client.searchTransport({ cityCode: toCityCode(c.city), checkIn: c.checkIn, checkOut: c.checkOut, pax: c.pax }));
    return raw.map(mapTransport);
  }

  async searchGroundServices(c: SearchCriteria): Promise<GroundOffer[]> {
    const raw = await withRetry(() => this.client.searchGround({ cityCode: toCityCode(c.city), checkIn: c.checkIn, checkOut: c.checkOut, pax: c.pax }));
    return raw.map(mapGround);
  }

  async searchZiyarah(c: SearchCriteria): Promise<GroundOffer[]> {
    const raw = await withRetry(() => this.client.searchZiyarah({ cityCode: toCityCode(c.city), checkIn: c.checkIn, checkOut: c.checkOut, pax: c.pax }));
    return raw.map(mapZiyarah);
  }

  async searchCatering(c: SearchCriteria): Promise<CateringOffer[]> {
    const raw = await withRetry(() => this.client.searchCatering({ cityCode: toCityCode(c.city), checkIn: c.checkIn, checkOut: c.checkOut, pax: c.pax }));
    return raw.map(mapCatering);
  }

  async hold(offerIds: string[], pilgrims: Pilgrim[]): Promise<HoldRef> {
    const res = await this.client.hold({ offerIds, paxCount: pilgrims.length });
    this.holds.set(res.reservationId, offerIds);
    return { holdId: res.reservationId, expiresAt: new Date(Date.now() + res.ttlSeconds * 1000).toISOString() };
  }

  async confirm(holdId: string, payment: { ref: string }): Promise<BookingResult> {
    const res = await this.client.confirm({ reservationId: holdId, paymentRef: payment.ref });
    const status = mapBookingState(res.state);
    if (status === 'CONFIRMED') {
      const offerIds = this.holds.get(holdId) ?? [];
      this.bookingApproved.set(res.reference, offerIds.some((id) => this.hotelApproval.get(id) === true));
    }
    return { bookingRef: res.reference, brns: res.brnList, status }; // BRNs verbatim
  }

  async createVisaApplication(bookingRef: string, pilgrims: Pilgrim[]): Promise<VisaApplication> {
    // Enforce only when we know this booking's hotels and none is approved.
    if (this.bookingApproved.get(bookingRef) === false) throw new NusukApprovalError(bookingRef);
    const res = await this.client.createVisa({ reference: bookingRef, paxCount: pilgrims.length });
    return { visaRef: res.applicationId, route: mapRoute(res.channel), status: mapVisaState(res.state) };
  }

  async getVisaStatus(visaRef: string): Promise<VisaStatus> {
    const res = await withRetry(() => this.client.visaStatus(visaRef));
    return mapVisaState(res.state);
  }

  async searchRawdahSlots(date: string): Promise<RawdahSlot[]> {
    const raw = await withRetry(() => this.client.rawdahSlots(date));
    return raw.map(mapRawdahSlot);
  }

  async bookRawdah(slotId: string, pilgrims: Pilgrim[]): Promise<RawdahPermit> {
    const res = await this.client.bookRawdah({ slot: slotId, paxCount: pilgrims.length });
    return {
      permitRef: res.permitId,
      slotId: res.slot,
      startsAt: res.at,
      pilgrimIds: pilgrims.map((p) => p.id),
      status: mapRawdahState(res.state),
    };
  }

  async cancel(bookingRef: string): Promise<Cancellation> {
    const res = await this.client.cancel(bookingRef);
    return {
      cancelled: res.cancelled,
      ...(res.refundMinor != null && res.refundCurrency != null
        ? { refund: { amount: res.refundMinor, currency: res.refundCurrency as Currency } }
        : {}),
    };
  }
}
