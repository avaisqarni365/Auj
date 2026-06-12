import type { Money, Pilgrim as ContractsPilgrim, VisaRoute, VisaStatus } from '@auj/contracts';

export type BookingChannel = 'PILGRIMAGE' | 'TRAVEL';

/** DRAFT -> HELD -> CONFIRMED -> VISA_IN_PROGRESS/TICKETED -> COMPLETED (+ CANCELLED, REFUNDED). */
export type BookingStatus =
  | 'DRAFT'
  | 'HELD'
  | 'CONFIRMED'
  | 'VISA_IN_PROGRESS'
  | 'TICKETED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export type ItemKind = 'HOTEL' | 'TRANSPORT' | 'GROUND' | 'FLIGHT';

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
}

/** A pilgrim as stored in our CRM (links to a Customer). Superset of the contracts Pilgrim. */
export interface CrmPilgrim {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string; // ISO-3166
  residenceCountry?: string;
  residencePermit?: boolean;
  dob: string;
  gender: 'M' | 'F';
  mahramPilgrimId?: string;
}

/** Strip CRM-only fields to hand a pilgrim to a connector (which speaks the contracts type). */
export function toContractsPilgrim(p: CrmPilgrim): ContractsPilgrim {
  const { customerId: _customerId, ...rest } = p;
  return rest;
}

export interface PackageItem {
  kind: ItemKind;
  offerId: string;
  title: string;
  net: Money;
}

export interface Package {
  id: string;
  name: string;
  channel: BookingChannel;
  items: PackageItem[];
  totals: Money[]; // net subtotal per currency
}

export interface BookingItem extends PackageItem {
  /** Booking Reference Number assigned by the connector on confirm. */
  brn?: string;
}

export type DocumentType = 'PASSPORT' | 'PHOTO' | 'VISA' | 'VOUCHER' | 'OTHER';

export interface Document {
  id: string;
  pilgrimId: string;
  type: DocumentType;
  fileRef: string; // object-store key
  verified: boolean;
  uploadedAt: string;
  mrz?: string; // optional passport-OCR result
}

export interface VisaCase {
  id: string;
  bookingId: string;
  visaRef: string;
  route: VisaRoute;
  status: VisaStatus;
  perPilgrim: Array<{ pilgrimId: string; route: VisaRoute; warnings: string[] }>;
}

export interface Booking {
  id: string;
  customerId: string;
  channel: BookingChannel;
  status: BookingStatus;
  pilgrimIds: string[];
  items: BookingItem[];
  holdId?: string;
  holdExpiresAt?: string;
  bookingRef?: string;
  visaCaseId?: string;
  refund?: Money;
  createdAt: string;
  updatedAt: string;
}
