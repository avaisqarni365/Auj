import { randomUUID } from 'node:crypto';

export const newId = (): string => randomUUID();

/** Human-shareable ticket reference, e.g. AUJ-T-3F9A2C. */
export const newTicketRef = (): string => `AUJ-T-${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`;
