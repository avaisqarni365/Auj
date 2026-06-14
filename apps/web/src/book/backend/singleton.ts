import { createBackend } from './in-process';
import type { Backend } from '../ports';

// One booking backend per process, cached on globalThis so the in-memory store (bookings,
// customers) is shared across server actions / pages and survives Next dev HMR.
const globalForBackend = globalThis as unknown as { __aujBookingBackend?: Promise<Backend> };

export function getBookingBackend(): Promise<Backend> {
  globalForBackend.__aujBookingBackend ??= createBackend();
  return globalForBackend.__aujBookingBackend;
}
