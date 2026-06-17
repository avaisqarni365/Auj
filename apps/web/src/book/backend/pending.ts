// Pending card authorizations, kept between phase 1 (authorize, returns a clientSecret to
// the browser) and phase 3 (capture after the card is confirmed). Keyed by the held
// booking id so finalize captures the SERVER-recorded intent — a client can never inject
// an intent id to capture. Stored on globalThis to survive Next dev HMR / module reloads.
//
// LIMITATION: in-process only. A single app instance is fine (our current deploy); a
// multi-instance rollout must move this to Redis/Postgres or drive capture off the
// Stripe webhook instead. The booking stays safely HELD until captured either way.
import type { PackageMode } from '@auj/contracts';

export interface PendingPayment {
  intentId: string;
  currency: 'EUR' | 'PKR';
  /** Carried so confirm can still book the requested Rawdah slot after capture. */
  rawdahDate?: string;
  mode?: PackageMode;
}

const KEY = Symbol.for('auj.book.pendingPayments');
type Store = Map<string, PendingPayment>;
const g = globalThis as unknown as { [KEY]?: Store };
const store: Store = (g[KEY] ??= new Map());

export function putPending(bookingId: string, p: PendingPayment): void {
  store.set(bookingId, p);
}

export function takePending(bookingId: string): PendingPayment | undefined {
  const p = store.get(bookingId);
  if (p) store.delete(bookingId);
  return p;
}
