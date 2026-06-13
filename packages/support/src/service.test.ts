import { describe, it, expect } from 'vitest';
import { SupportService, SupportError } from './service';
import { createInMemoryTicketRepository } from './in-memory';

function make(): SupportService {
  let n = 0;
  return new SupportService({ tickets: createInMemoryTicketRepository(), now: () => `2026-06-13T00:00:${String(n++).padStart(2, '0')}.000Z` });
}
const user = { id: 'u1', email: 'aisha@auj.example', name: 'Aisha' };

describe('SupportService', () => {
  it('opens a ticket OPEN with a ref and the first user message', async () => {
    const s = make();
    const t = await s.open(user, { subject: 'Visa question', category: 'VISA', body: 'When will my e-Visa arrive?' });
    expect(t.status).toBe('OPEN');
    expect(t.ref).toMatch(/^AUJ-T-[0-9A-F]{6}$/);
    expect(t.messages).toHaveLength(1);
    expect(t.messages[0]).toMatchObject({ author: 'USER', body: 'When will my e-Visa arrive?' });
  });

  it('validates the open input', async () => {
    const s = make();
    await expect(s.open(user, { subject: 'x', category: 'GENERAL', body: 'hi' })).rejects.toThrow(); // subject too short
    await expect(s.open(user, { subject: 'Valid subject', category: 'GENERAL', body: '' })).rejects.toThrow();
  });

  it('threads replies and transitions status (staff→PENDING, user→OPEN)', async () => {
    const s = make();
    const t = await s.open(user, { subject: 'Hotel change', category: 'BOOKING', body: 'Can I upgrade?' });
    const afterStaff = await s.reply(t.id, 'STAFF', 'Omar (AUJ)', 'Yes — which dates?');
    expect(afterStaff.status).toBe('PENDING');
    expect(afterStaff.messages).toHaveLength(2);
    const afterUser = await s.reply(t.id, 'USER', 'Aisha', '12–26 Sep');
    expect(afterUser.status).toBe('OPEN');
    expect(afterUser.messages).toHaveLength(3);
    await expect(s.reply(t.id, 'USER', 'Aisha', '   ')).rejects.toThrow(SupportError);
  });

  it('lists a user’s own tickets and lets staff resolve', async () => {
    const s = make();
    const t = await s.open(user, { subject: 'Refund', category: 'PAYMENT', body: 'Please refund' });
    await s.open({ id: 'u2', email: 'x@y.z', name: 'Other' }, { subject: 'Other', category: 'GENERAL', body: 'hi there' });
    expect(await s.listByUser('u1')).toHaveLength(1);
    expect(await s.listAll()).toHaveLength(2);
    const resolved = await s.setStatus(t.id, 'RESOLVED');
    expect(resolved.status).toBe('RESOLVED');
    // a reply on a resolved ticket does not silently re-open it
    expect((await s.reply(t.id, 'STAFF', 'Omar', 'Done')).status).toBe('RESOLVED');
    await expect(s.setStatus('nope', 'CLOSED')).rejects.toThrow(/Unknown ticket/);
  });
});
