'use server';

import { formatMoney } from '../currency';
import { getCurrentUser } from '../auth/session';
import { getBookingBackend } from '../book/backend/singleton';
import { getDepositStore } from './deposit-store';

const MIN_MINOR = 5_000; // €50 minimum deposit
const MAX_MINOR = 5_000_000; // €50,000 cap

export type DepositStart =
  | { status: 'done'; ref: string }
  | { status: 'requires_card'; ref: string; clientSecret: string; publishableKey: string; amountLabel: string }
  | { status: 'error'; error: string };

/** Authorize a deposit payment intent for the signed-in pilgrim (EUR, charged of record). */
export async function startDepositAction(amountMinor: number): Promise<DepositStart> {
  const user = await getCurrentUser();
  if (!user) return { status: 'error', error: 'Not signed in' };
  const amt = Math.round(amountMinor);
  if (!Number.isFinite(amt) || amt < MIN_MINOR || amt > MAX_MINOR) return { status: 'error', error: 'Enter a deposit between €50 and €50,000' };

  const ref = `deposit:${user.id}:${Date.now()}`;
  const backend = await getBookingBackend();
  const { intentId, clientSecret } = await backend.payments.authorize({
    amount: { amount: amt, currency: 'EUR' },
    bookingRef: ref,
    idempotencyKey: `${ref}:pay`,
    method: 'CARD',
  });

  const store = await getDepositStore();
  await store.create({ id: ref, pilgrimId: user.id, ref, amountMinor: amt, currency: 'EUR', intentId, status: 'pending' });

  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (clientSecret && publishableKey) {
    return { status: 'requires_card', ref, clientSecret, publishableKey, amountLabel: formatMoney({ amount: amt, currency: 'EUR' }) };
  }

  // No browser step (sandbox / offline gateway): capture immediately.
  await backend.payments.capture({ intentId, currency: 'EUR', bookingRef: ref, idempotencyKey: `${ref}:pay` });
  await store.markPaid(user.id, ref);
  return { status: 'done', ref };
}

/** Capture the authorized deposit intent after the browser confirmed the card. Owner-checked. */
export async function finalizeDepositAction(ref: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const store = await getDepositStore();
  const dep = await store.byRef(user.id, ref);
  if (!dep) return { ok: false };
  const backend = await getBookingBackend();
  await backend.payments.capture({ intentId: dep.intentId, currency: 'EUR', bookingRef: ref, idempotencyKey: `${ref}:pay` });
  await store.markPaid(user.id, ref);
  return { ok: true };
}

export async function depositPaidAction(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return (await (await getDepositStore()).listByPilgrim(user.id)).some((d) => d.status === 'paid');
}
