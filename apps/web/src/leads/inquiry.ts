// Smart Visit lead (inquiry) — captured by the wizard, followed up by the AUJ team.
// NOT a Booking: no payment, no Saudi connector. Stored in-process (globalThis) so it works
// on the bare/in-memory deploy; swap in a Postgres store later behind the same shape.

export type PartyKind = 'SOLO' | 'FAMILY' | 'GROUP';
export type TransferMode = 'TRAIN' | 'BUS' | 'CAR' | 'FLEXIBLE';
export type ReturnFrom = 'MADINAH' | 'JEDDAH';
export type ContactChannel = 'EMAIL' | 'WHATSAPP' | 'CALL';
export type InquiryStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED' | 'CLOSED';
export const INQUIRY_STATUSES: InquiryStatus[] = ['NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'CLOSED'];

export interface InquiryInput {
  country: string;
  city?: string;
  departureAirport?: string;
  adults: number;
  children: number;
  infants: number;
  partyKind: PartyKind;
  makkahNights: number;
  makkahHotelBand: string; // e.g. '≤300m' | '≤800m' | '≤2km' | 'any'
  makkahZiyarah: string[];
  transferMode: TransferMode;
  transferPrivate: boolean;
  madinahNights: number;
  madinahHotelBand: string;
  rawdah: boolean;
  madinahZiyarah: string[];
  returnFrom: ReturnFrom;
  jeddahStopover: boolean;
  windowFrom?: string;
  windowTo?: string;
  trackerOptIn: boolean;
  // contact
  name: string;
  email: string;
  phone?: string;
  channel: ContactChannel;
  lang: string;
  consent: boolean;
}

export interface Inquiry extends InquiryInput {
  id: string;
  ref: string; // human-friendly e.g. INQ-7F3A
  createdAt: string;
  status: InquiryStatus;
}

const rid = (): string => {
  const u = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.round(Math.random() * 1e6)}`).replace(/-/g, '');
  return u.slice(0, 8);
};

/** Pure constructor — used by both the in-memory and Postgres leads stores (see store.ts). */
export function buildInquiry(input: InquiryInput, now: string): Inquiry {
  const id = rid();
  return { ...input, id, ref: `INQ-${id.slice(0, 4).toUpperCase()}`, createdAt: now, status: 'NEW' };
}
