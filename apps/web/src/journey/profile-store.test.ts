import { describe, it, expect } from 'vitest';
import { getProfileStore } from './profile-store';
import type { ProfileInput } from './profile-types';

// No DATABASE_URL in tests → in-memory implementation.
const input: ProfileInput = {
  city: 'Vilnius',
  country: 'Lithuania',
  email: 'p@example.com',
  phone: '+370600',
  languages: ['English', 'Urdu'],
  tier: 'Gold',
  preferences: ['Near the Haram', 'Halal full board'],
  history: [{ title: 'Umrah', year: '2025', detail: '10 nights', stars: '5★' }],
};

describe('pilgrim profile store (in-memory)', () => {
  it('returns undefined for an unsaved pilgrim', async () => {
    const s = await getProfileStore();
    expect(await s.get('nobody-xyz')).toBeUndefined();
  });

  it('saves + round-trips a profile, keyed by pilgrim id', async () => {
    const s = await getProfileStore();
    const saved = await s.save('pilgrim-1', input);
    expect(saved.pilgrimId).toBe('pilgrim-1');
    expect(saved.preferences).toEqual(input.preferences);

    const got = await s.get('pilgrim-1');
    expect(got?.tier).toBe('Gold');
    expect(got?.history?.[0]?.title).toBe('Umrah');
    // scoped per user — another id is unaffected
    expect(await s.get('pilgrim-2')).toBeUndefined();
  });

  it('save overwrites the prior profile for the same id', async () => {
    const s = await getProfileStore();
    await s.save('pilgrim-3', input);
    await s.save('pilgrim-3', { ...input, tier: 'Platinum', preferences: [] });
    const got = await s.get('pilgrim-3');
    expect(got?.tier).toBe('Platinum');
    expect(got?.preferences).toEqual([]);
  });
});
