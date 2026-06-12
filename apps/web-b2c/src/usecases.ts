import type { Money } from '@auj/contracts';
import type { Booking, PackageItem, VisaCase } from '@auj/core-booking';
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
}

export interface PlacedBooking {
  booking: Booking;
  visaCase: VisaCase;
}

/**
 * The full pilgrimage funnel end state: create customer + pilgrims, draft the
 * booking, hold, take payment, confirm (BRNs), then open the visa case.
 * Payments and booking are separate APIs — the app stitches them, the modules don't.
 */
export async function placePilgrimageBooking(
  backend: Backend,
  input: PlaceBookingInput,
): Promise<PlacedBooking> {
  const { booking: api, payments } = backend;

  const customer = await api.createCustomer(input.customer);
  const pilgrims = await Promise.all(
    input.pilgrims.map((p) => api.addPilgrim({ ...p, customerId: customer.id })),
  );

  const draft = await api.createBooking({
    customerId: customer.id,
    channel: 'PILGRIMAGE',
    pilgrimIds: pilgrims.map((p) => p.id),
    items: input.items,
  });

  await api.hold(draft.id);
  const { paymentRef } = await payments.pay({
    amount: input.total,
    bookingRef: draft.id,
    idempotencyKey: `${draft.id}:pay`,
    method: input.method,
  });
  const confirmed = await api.confirm(draft.id, paymentRef);
  const { visaCase } = await api.startVisa(confirmed.id);

  return { booking: confirmed, visaCase };
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
