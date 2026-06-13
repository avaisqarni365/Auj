import { randomFillSync } from 'node:crypto';

/**
 * Minimal time-ordered UUID v7 (per our ID convention). The first 48 bits are a
 * millisecond timestamp so IDs sort roughly by creation time; the rest is random.
 */
export function uuidv7(): string {
  const buf = Buffer.alloc(16);
  randomFillSync(buf);
  buf.writeUIntBE(Date.now(), 0, 6); // 48-bit timestamp
  buf[6] = (buf[6]! & 0x0f) | 0x70; // version 7
  buf[8] = (buf[8]! & 0x3f) | 0x80; // variant
  const h = buf.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** Human-shareable gift voucher code, e.g. AUJ-GIFT-3F9A2C1D. */
export function giftVoucherCode(): string {
  return `AUJ-GIFT-${uuidv7().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}
