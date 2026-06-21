import { describe, it, expect } from 'vitest';
import { getDashboardStore } from './dashboard-store';
import { EMPTY_PASSPORT } from './dashboard-types';

// No DATABASE_URL in tests → in-memory implementation.
describe('dashboard store (in-memory)', () => {
  it('always exposes a "me" member; family members add/remove and are owner-scoped', async () => {
    const s = await getDashboardStore();
    expect((await s.listMembers('owner-1')).map((m) => m.memberId)).toEqual(['me']);
    const fam = await s.addMember('owner-1', ' Amma', 'Family');
    expect((await s.listMembers('owner-1')).length).toBe(2);
    expect((await s.listMembers('owner-2')).length).toBe(1); // isolation
    await s.removeMember('owner-1', fam.memberId);
    expect((await s.listMembers('owner-1')).length).toBe(1);
  });

  it("never removes the 'me' member", async () => {
    const s = await getDashboardStore();
    await s.removeMember('owner-3', 'me');
    expect((await s.listMembers('owner-3')).map((m) => m.memberId)).toContain('me');
  });

  it('persists a passport scan (image key + fields) per member', async () => {
    const s = await getDashboardStore();
    expect(await s.getPassport('owner-4', 'me')).toBeUndefined();
    await s.savePassport('owner-4', 'me', {
      imageKey: 'owner-4/passport/me/x.jpg',
      extracted: { ...EMPTY_PASSPORT, passportNumber: 'PK1234567', nationality: 'PK' },
      status: 'confirmed',
    });
    const got = await s.getPassport('owner-4', 'me');
    expect(got?.status).toBe('confirmed');
    expect(got?.imageKey).toContain('owner-4/passport');
    expect(got?.extracted.passportNumber).toBe('PK1234567');
  });
});
