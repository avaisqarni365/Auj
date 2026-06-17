import type { Money, PackageMode, RawdahPermit } from '@auj/contracts';
import type { Booking, PackageItem, SpecialRequestCategory, VisaCase } from '@auj/core-booking';
import { routeFor, type VisaRouting } from '@auj/visa-router';
import type { Backend, PaymentMethod } from './ports';
import type { PilgrimDraft } from './funnel';

/** Visa-route preview shown on the pilgrim-capture screen (derives e-Visa vs agent channel). */
export function previewVisaRoute(p: PilgrimDraft): VisaRouting {
  return routeFor({
    id: 'preview',
    firstName: p.firstName,
    lastName: p.lastName,
    passportNumber: p.passportNumber,
    nationality: p.nationality,
    residenceCountry: p.residenceCountry,
    residencePermit: p.residencePermit,
    dob: p.dob,
    gender: p.gender,
  });
}

export interface PlaceBookingInput {
  customer: { fullName: string; email: string; phone?: string };
  pilgrims: PilgrimDraft[];
  items: PackageItem[];
  total: Money;
  method?: PaymentMethod;
  mode?: PackageMode;
  /** When set, book the first available Rawdah permit slot for this date. */
  rawdahDate?: string;
  /** When set, this booking is a gift for the named recipient (generates a voucher). */
  gift?: { recipientName: string; recipientEmail?: string; message?: string };
  /** Personalization: special requests captured at booking time. */
  specialRequests?: Array<{ category: SpecialRequestCategory; note?: string }>;
}

export interface PlacedBooking {
  booking: Booking;
  visaCase: VisaCase;
  rawdah?: RawdahPermit;
}

/**
 * Phase 1: create customer + pilgrims, draft the booking (gift/mode/requests baked in),
 * and HOLD it — everything up to but not including payment. Returns the held draft id so
 * the caller can authorize a payment against it.
 */
export async function createHeldBooking(
  backend: Backend,
  input: PlaceBookingInput,
): Promise<{ bookingId: string }> {
  const api = backend.booking;
  const customer = await api.createCustomer(input.customer);
  const pilgrims = await Promise.all(
    input.pilgrims.map((p) => api.addPilgrim({ ...p, customerId: customer.id })),
  );
  const draft = await api.createBooking({
    customerId: customer.id,
    channel: 'PILGRIMAGE',
    pilgrimIds: pilgrims.map((p) => p.id),
    items: input.items,
    ...(input.mode ? { mode: input.mode } : {}),
    ...(input.gift ? { gift: input.gift } : {}),
    ...(input.specialRequests && input.specialRequests.length > 0 ? { specialRequests: input.specialRequests } : {}),
  });
  await api.hold(draft.id);
  return { bookingId: draft.id };
}

/**
 * Phase 3: with payment captured, confirm the held booking (BRNs), open the visa case,
 * and book the optional Rawdah slot. Shared by the single-shot and the card flows.
 */
export async function confirmHeldBooking(
  backend: Backend,
  input: { bookingId: string; paymentRef: string; rawdahDate?: string },
): Promise<PlacedBooking> {
  const api = backend.booking;
  const confirmed = await api.confirm(input.bookingId, input.paymentRef);
  const { visaCase } = await api.startVisa(confirmed.id);

  let rawdah: RawdahPermit | undefined;
  if (input.rawdahDate) {
    const slots = await api.rawdahSlots(input.rawdahDate);
    if (slots[0]) rawdah = await api.bookRawdah(confirmed.id, slots[0].slotId);
  }
  return { booking: confirmed, visaCase, ...(rawdah ? { rawdah } : {}) };
}

/**
 * The full pilgrimage funnel end state in one call: create + hold → take payment →
 * confirm (BRNs) → open the visa case. Used by the single-shot path (offline sandbox,
 * server-only gateways). The card flow stitches the same three phases across the
 * browser's Stripe.js confirmation step instead.
 * Payments and booking are separate APIs — the app stitches them, the modules don't.
 */
export async function placePilgrimageBooking(
  backend: Backend,
  input: PlaceBookingInput,
): Promise<PlacedBooking> {
  const { bookingId } = await createHeldBooking(backend, input);
  const { paymentRef } = await backend.payments.pay({
    amount: input.total,
    bookingRef: bookingId,
    idempotencyKey: `${bookingId}:pay`,
    method: input.method,
  });
  return confirmHeldBooking(backend, {
    bookingId,
    paymentRef,
    ...(input.rawdahDate ? { rawdahDate: input.rawdahDate } : {}),
  });
}

/** Poll the visa case until issued (or a guard limit), for the live tracker. */
export async function pollVisaUntilIssued(
  backend: Backend,
  bookingId: string,
  maxPolls = 10,
): Promise<VisaCase> {
  let visaCase = await backend.booking.refreshVisa(bookingId);
  for (let i = 0; visaCase.status !== 'ISSUED' && visaCase.status !== 'REJECTED' && i < maxPolls; i += 1) {
    visaCase = await backend.booking.refreshVisa(bookingId);
  }
  return visaCase;
}
