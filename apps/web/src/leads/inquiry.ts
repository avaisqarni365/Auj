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

type Store = Map<string, Inquiry>;
const KEY = Symbol.for('auj.leads.store');
const g = globalThis as unknown as { [KEY]?: Store };
const store: Store = (g[KEY] ??= new Map());

const rid = (): string => {
  const u = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.round(Math.random() * 1e6)}`).replace(/-/g, '');
  return u.slice(0, 8);
};

export function createInquiry(input: InquiryInput, now: string): Inquiry {
  const id = rid();
  const inquiry: Inquiry = { ...input, id, ref: `INQ-${id.slice(0, 4).toUpperCase()}`, createdAt: now, status: 'NEW' };
  store.set(id, inquiry);
  return inquiry;
}

export function listInquiries(): Inquiry[] {
  return [...store.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function setInquiryStatus(id: string, status: InquiryStatus): Inquiry | undefined {
  const i = store.get(id);
  if (!i) return undefined;
  i.status = status;
  store.set(id, i);
  return i;
}
