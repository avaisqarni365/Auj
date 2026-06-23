import { describe, it, expect } from 'vitest';
import { getTourVideoStore } from './tour-video-store';

// No DATABASE_URL in tests → in-memory. Personal tour clips MUST stay scoped per user.
describe('per-user tour-video store (in-memory)', () => {
  it('attaches, replaces and removes a per-scene clip', async () => {
    const s = await getTourVideoStore();
    expect(await s.listForUser('u1')).toEqual({});

    await s.set('u1', 'kaaba', 'https://youtu.be/aaa');
    await s.set('u1', 'zamzam', 'https://vimeo.com/1');
    expect(await s.listForUser('u1')).toEqual({ kaaba: 'https://youtu.be/aaa', zamzam: 'https://vimeo.com/1' });

    await s.set('u1', 'kaaba', 'https://youtu.be/bbb'); // replace
    expect((await s.listForUser('u1')).kaaba).toBe('https://youtu.be/bbb');

    await s.remove('u1', 'kaaba');
    expect(await s.listForUser('u1')).toEqual({ zamzam: 'https://vimeo.com/1' });
  });

  it('clips are scoped per user — no cross-account leak', async () => {
    const s = await getTourVideoStore();
    await s.set('alice', 'safa-marwa', 'https://youtu.be/alice');
    expect(await s.listForUser('bob')).toEqual({}); // bob never sees alice's clips
    expect((await s.listForUser('alice'))['safa-marwa']).toBe('https://youtu.be/alice');
  });
});
