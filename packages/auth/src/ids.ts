import { randomBytes, randomUUID } from 'node:crypto';

export const newId = (): string => randomUUID();
/** Opaque, unguessable session token. */
export const newToken = (): string => randomBytes(32).toString('hex');
