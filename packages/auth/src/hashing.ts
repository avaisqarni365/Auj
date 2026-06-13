import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Password hashing with scrypt (built into Node — no external dependency, keeps the
// offline build gate green). Stored as "saltHex:hashHex".
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, KEYLEN);
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const derived = scryptSync(password, Buffer.from(saltHex, 'hex'), KEYLEN);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
