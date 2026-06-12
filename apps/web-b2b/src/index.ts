// @auj/web-b2b — the agent portal, framework-light. Agents, markups, multi-pax
// bookings, wallet, quotations, statements as tested logic + @auj/ui screens.
// Talks only to the booking + payments(wallet) APIs via ports.
export * from './domain';
export * from './ports';
export * from './money';
export * from './agents';
export * from './markup';
export * from './multipax';
export * from './quotation';
export * from './statements';
export * from './screens';
export { uuidv7 } from './ids';
export { createInProcessBackend } from './backend/in-process';
