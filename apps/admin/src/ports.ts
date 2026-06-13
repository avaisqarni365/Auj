import type { Currency } from '@auj/contracts';
import type { Booking, VisaCase } from '@auj/core-booking';
import type { JournalEntry } from '@auj/payments';
import type { SecurityCertificate } from '@auj/compliance';

/**
 * Back-office oversight surface. Read-mostly, plus a few operator actions
 * (cancel/refund a booking, GDPR export/erase). Talks only to the shared service
 * packages — no connector imports.
 */
export interface AdminApi {
  // bookings
  listBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  cancelBooking(id: string): Promise<Booking>;
  refundBooking(id: string): Promise<Booking>;
  // visa
  listVisaCases(): Promise<VisaCase[]>;
  // finance (the double-entry ledger is the source of truth)
  ledgerEntries(): JournalEntry[];
  accountBalance(account: string, currency: Currency): number;
  // compliance
  listCertificates(): SecurityCertificate[];
  exportSubject(customerId: string): { customerId: string; exportedAt: string; sources: Record<string, unknown>[] };
  deleteSubject(customerId: string): { customerId: string; erasedAt: string };
}
