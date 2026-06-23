import { describe, it, expect } from 'vitest';
import { getStepVideoStore } from './step-video-store';

// No DATABASE_URL in tests → in-memory implementation. Personal clips MUST stay scoped per user.
describe('per-pilgrim step-video store (in-memory)', () => {
  it('attaches, replaces and removes a per-step clip', async () => {
    const s = await getStepVideoStore();
    expect(await s.listByWizard('u1', 'airport')).toEqual({});

    await s.set('u1', 'airport', 0, 'https://youtu.be/aaa');
    await s.set('u1', 'airport', 2, 'https://vimeo.com/123');
    expect(await s.listByWizard('u1', 'airport')).toEqual({ 0: 'https://youtu.be/aaa', 2: 'https://vimeo.com/123' });

    await s.set('u1', 'airport', 0, 'https://youtu.be/bbb'); // replace
    expect((await s.listByWizard('u1', 'airport'))[0]).toBe('https://youtu.be/bbb');

    await s.remove('u1', 'airport', 0);
    expect(await s.listByWizard('u1', 'airport')).toEqual({ 2: 'https://vimeo.com/123' });
  });

  it('clips are scoped per user AND per wizard — no cross-account leak', async () => {
    const s = await getStepVideoStore();
    await s.set('alice', 'luggage', 1, 'https://youtu.be/alice');
    expect(await s.listByWizard('bob', 'luggage')).toEqual({}); // bob sees nothing of alice's
    expect(await s.listByWizard('alice', 'makkah-ziyarat')).toEqual({}); // separate wizard, separate clips
    expect((await s.listByWizard('alice', 'luggage'))[1]).toBe('https://youtu.be/alice');
  });
});
