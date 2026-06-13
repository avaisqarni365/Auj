import type { Currency } from '@auj/contracts';
import type {
  Booking,
  BookingChannel,
  BookingItem,
  BookingStatus,
  CrmPilgrim,
  Customer,
  Document,
  DocumentType,
  ItemKind,
  Package,
  VisaCase,
} from '../domain';

// Row shapes returned by pg (snake_case). Pure mappers row -> domain, unit-tested offline.

export interface CustomerRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}
export function rowToCustomer(r: CustomerRow): Customer {
  return { id: r.id, fullName: r.full_name, email: r.email, createdAt: r.created_at, ...(r.phone != null ? { phone: r.phone } : {}) };
}

export interface PilgrimRow {
  id: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  passport_number: string;
  nationality: string;
  residence_country: string | null;
  residence_permit: boolean | null;
  dob: string;
  gender: string;
  mahram_pilgrim_id: string | null;
}
export function rowToPilgrim(r: PilgrimRow): CrmPilgrim {
  return {
    id: r.id,
    customerId: r.customer_id,
    firstName: r.first_name,
    lastName: r.last_name,
    passportNumber: r.passport_number,
    nationality: r.nationality,
    dob: r.dob,
    gender: r.gender === 'F' ? 'F' : 'M',
    ...(r.residence_country != null ? { residenceCountry: r.residence_country } : {}),
    ...(r.residence_permit != null ? { residencePermit: r.residence_permit } : {}),
    ...(r.mahram_pilgrim_id != null ? { mahramPilgrimId: r.mahram_pilgrim_id } : {}),
  };
}

export interface BookingRow {
  id: string;
  customer_id: string;
  channel: string;
  status: string;
  pilgrim_ids: string[]; // jsonb -> array
  hold_id: string | null;
  hold_expires_at: string | null;
  booking_ref: string | null;
  visa_case_id: string | null;
  refund_amount: number | null;
  refund_currency: string | null;
  created_at: string;
  updated_at: string;
}
export interface BookingItemRow {
  booking_id: string;
  position: number;
  kind: string;
  offer_id: string;
  title: string;
  net_amount: number;
  net_currency: string;
  brn: string | null;
}
export function rowToBooking(b: BookingRow, itemRows: BookingItemRow[]): Booking {
  const items: BookingItem[] = [...itemRows]
    .sort((x, y) => x.position - y.position)
    .map((r) => ({
      kind: r.kind as ItemKind,
      offerId: r.offer_id,
      title: r.title,
      net: { amount: r.net_amount, currency: r.net_currency as Currency },
      ...(r.brn != null ? { brn: r.brn } : {}),
    }));
  return {
    id: b.id,
    customerId: b.customer_id,
    channel: b.channel as BookingChannel,
    status: b.status as BookingStatus,
    pilgrimIds: b.pilgrim_ids,
    items,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
    ...(b.hold_id != null ? { holdId: b.hold_id } : {}),
    ...(b.hold_expires_at != null ? { holdExpiresAt: b.hold_expires_at } : {}),
    ...(b.booking_ref != null ? { bookingRef: b.booking_ref } : {}),
    ...(b.visa_case_id != null ? { visaCaseId: b.visa_case_id } : {}),
    ...(b.refund_amount != null && b.refund_currency != null
      ? { refund: { amount: b.refund_amount, currency: b.refund_currency as Currency } }
      : {}),
  };
}

export interface DocumentRow {
  id: string;
  pilgrim_id: string;
  type: string;
  file_ref: string;
  verified: boolean;
  uploaded_at: string;
  mrz: string | null;
}
export function rowToDocument(r: DocumentRow): Document {
  return {
    id: r.id,
    pilgrimId: r.pilgrim_id,
    type: r.type as DocumentType,
    fileRef: r.file_ref,
    verified: r.verified,
    uploadedAt: r.uploaded_at,
    ...(r.mrz != null ? { mrz: r.mrz } : {}),
  };
}

export interface VisaCaseRow {
  id: string;
  booking_id: string;
  visa_ref: string;
  route: string;
  status: string;
  per_pilgrim: VisaCase['perPilgrim']; // jsonb
}
export function rowToVisaCase(r: VisaCaseRow): VisaCase {
  return {
    id: r.id,
    bookingId: r.booking_id,
    visaRef: r.visa_ref,
    route: r.route as VisaCase['route'],
    status: r.status as VisaCase['status'],
    perPilgrim: r.per_pilgrim,
  };
}

export interface PackageRow {
  id: string;
  name: string;
  channel: string;
  items: Package['items']; // jsonb
  totals: Package['totals']; // jsonb
}
export function rowToPackage(r: PackageRow): Package {
  return { id: r.id, name: r.name, channel: r.channel as BookingChannel, items: r.items, totals: r.totals };
}
