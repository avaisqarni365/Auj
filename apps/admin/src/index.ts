// @auj/admin — the back office, framework-light. Oversight over the shared service
// packages: bookings (cancel/refund), visa cases, the payments ledger, and compliance
// (certificate registry + GDPR export/erase). Talks only to services, never connectors.
export * from './ports';
export * from './money';
export * from './usecases';
export * from './screens';
export { createInProcessBackend, type AdminBackend } from './backend/in-process';
