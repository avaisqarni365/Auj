import { uuidv7 } from './ids';

// --- Vendor (Maqam GDS / Nusuk Masar partner) payload shapes. Deliberately NOT our
// domain types; the connector maps these into the domain. Real shapes come from the
// partner sandbox (see docs/assumptions.md A1) — these are the assumed stand-in.

export type MaqamCity = 'MAK' | 'MAD' | 'JED';

export interface MaqamHotel {
  hotelId: string;
  name: string;
  cityCode: MaqamCity;
  rating: number;
  distanceMeters?: number;
  rateMinor: number;
  rateCurrency: string;
  nusukApproved: boolean;
}
export interface MaqamTransport {
  id: string;
  routeCode: string;
  vehicleType: string;
  priceMinor: number;
  priceCurrency: string;
}
export interface MaqamGround {
  serviceId: string;
  title: string;
  priceMinor: number;
  priceCurrency: string;
}
export interface MaqamHoldResponse {
  reservationId: string;
  ttlSeconds: number;
}
export interface MaqamConfirmResponse {
  reference: string;
  brnList: string[];
  state: 'OK' | 'PENDING' | 'FAIL';
}
export interface MaqamVisaResponse {
  applicationId: string;
  channel: 'EVISA' | 'AGENT';
  state: string;
}
export interface MaqamCancelResponse {
  cancelled: boolean;
  refundMinor?: number;
  refundCurrency?: string;
}
export interface MaqamRawdahSlot {
  slot: string;
  at: string;
  seatsLeft: number;
}
export interface MaqamRawdahResponse {
  permitId: string;
  slot: string;
  at: string;
  state: 'REQUESTED' | 'CONFIRMED' | 'REJECTED';
}

export interface SearchReq {
  cityCode: MaqamCity;
  checkIn: string;
  checkOut: string;
  pax: number;
}

/** The partner/ERP API surface the connector wraps. Implemented by a real HTTP client
 * (token auth, per-agent codes) or, for dev/test, the offline sandbox below. */
export interface SaudiPartnerClient {
  auth(): Promise<{ token: string }>;
  searchHotels(req: SearchReq): Promise<MaqamHotel[]>;
  searchTransport(req: SearchReq): Promise<MaqamTransport[]>;
  searchGround(req: SearchReq): Promise<MaqamGround[]>;
  hold(req: { offerIds: string[]; paxCount: number }): Promise<MaqamHoldResponse>;
  confirm(req: { reservationId: string; paymentRef: string }): Promise<MaqamConfirmResponse>;
  createVisa(req: { reference: string; paxCount: number }): Promise<MaqamVisaResponse>;
  visaStatus(applicationId: string): Promise<{ state: string }>;
  rawdahSlots(date: string): Promise<MaqamRawdahSlot[]>;
  bookRawdah(req: { slot: string; paxCount: number }): Promise<MaqamRawdahResponse>;
  cancel(reference: string): Promise<MaqamCancelResponse>;
}

const VISA_FLOW = ['DRAFT', 'SUBMITTED', 'PAID', 'ISSUED'];

/** Deterministic offline stand-in for the partner sandbox, in vendor payload shapes. */
export class SandboxSaudiPartnerClient implements SaudiPartnerClient {
  private readonly holds = new Map<string, { offerIds: string[] }>();
  private readonly visa = new Map<string, number>(); // applicationId -> progression index

  async auth(): Promise<{ token: string }> {
    return { token: `sandbox-${uuidv7().slice(0, 8)}` };
  }

  async searchHotels(req: SearchReq): Promise<MaqamHotel[]> {
    const all: MaqamHotel[] = [
      { hotelId: 'MAK-001', name: 'Swissotel Al Maqam', cityCode: 'MAK', rating: 5, distanceMeters: 100, rateMinor: 95000, rateCurrency: 'SAR', nusukApproved: true },
      { hotelId: 'MAK-014', name: 'Ajyad Crystal', cityCode: 'MAK', rating: 3, distanceMeters: 800, rateMinor: 28000, rateCurrency: 'SAR', nusukApproved: false },
      { hotelId: 'MAD-002', name: 'Anwar Al Madinah', cityCode: 'MAD', rating: 5, distanceMeters: 150, rateMinor: 70000, rateCurrency: 'SAR', nusukApproved: true },
    ];
    return all.filter((h) => req.cityCode === 'JED' || h.cityCode === req.cityCode);
  }

  async searchTransport(_req: SearchReq): Promise<MaqamTransport[]> {
    return [{ id: 'TRN-JED-MAK', routeCode: 'JED>MAK', vehicleType: 'GMC', priceMinor: 45000, priceCurrency: 'SAR' }];
  }

  async searchGround(_req: SearchReq): Promise<MaqamGround[]> {
    return [{ serviceId: 'GRD-ZIY-MAK', title: 'Makkah ziyarah', priceMinor: 12000, priceCurrency: 'SAR' }];
  }

  async hold(req: { offerIds: string[]; paxCount: number }): Promise<MaqamHoldResponse> {
    const reservationId = `RSV-${uuidv7().slice(0, 8)}`;
    this.holds.set(reservationId, { offerIds: req.offerIds });
    return { reservationId, ttlSeconds: 900 };
  }

  async confirm(req: { reservationId: string; paymentRef: string }): Promise<MaqamConfirmResponse> {
    const hold = this.holds.get(req.reservationId);
    const items = hold && hold.offerIds.length > 0 ? hold.offerIds : ['item'];
    return { reference: `BR-${uuidv7().slice(0, 8)}`, brnList: items.map(() => `BRN-${uuidv7().slice(0, 6)}`), state: 'OK' };
  }

  async createVisa(_req: { reference: string; paxCount: number }): Promise<MaqamVisaResponse> {
    const applicationId = `VISA-${uuidv7().slice(0, 8)}`;
    this.visa.set(applicationId, 0);
    return { applicationId, channel: 'AGENT', state: 'DRAFT' };
  }

  async visaStatus(applicationId: string): Promise<{ state: string }> {
    const idx = this.visa.get(applicationId);
    if (idx === undefined) return { state: 'REJECTED' };
    const next = Math.min(idx + 1, VISA_FLOW.length - 1);
    this.visa.set(applicationId, next);
    return { state: VISA_FLOW[next] as string };
  }

  async rawdahSlots(date: string): Promise<MaqamRawdahSlot[]> {
    return ['03:00', '11:30', '21:00'].map((t) => ({ slot: `${date}#${t}`, at: `${date}T${t}:00Z`, seatsLeft: 200 }));
  }

  async bookRawdah(req: { slot: string; paxCount: number }): Promise<MaqamRawdahResponse> {
    const at = req.slot.includes('#') ? `${req.slot.split('#')[0]}T${req.slot.split('#')[1]}:00Z` : new Date().toISOString();
    return { permitId: `RWD-${uuidv7().slice(0, 8)}`, slot: req.slot, at, state: 'CONFIRMED' };
  }

  async cancel(_reference: string): Promise<MaqamCancelResponse> {
    return { cancelled: true, refundMinor: 50000, refundCurrency: 'SAR' };
  }
}
