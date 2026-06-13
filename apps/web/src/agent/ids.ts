import { randomFillSync } from 'node:crypto';

/** Time-ordered UUID v7 (per our ID convention). */
export function uuidv7(): string {
  const buf = Buffer.alloc(16);
  randomFillSync(buf);
  buf.writeUIntBE(Date.now(), 0, 6);
  buf[6] = (buf[6]! & 0x0f) | 0x70;
  buf[8] = (buf[8]! & 0x3f) | 0x80;
  const h = buf.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
