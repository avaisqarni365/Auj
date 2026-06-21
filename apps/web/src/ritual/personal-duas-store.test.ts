import { describe, it, expect } from 'vitest';
import { InMemoryDuas } from './personal-duas-store';

const U = 'user-1';

describe('personal duas store (in-memory, per-user)', () => {
  it('creates, lists by step, ignores empty, scopes to the user', async () => {
    const s = new InMemoryDuas();
    expect(await s.save(U, { stepKey: 'niyyah', text: '   ', lang: 'en' })).toBeNull();
    const a = await s.save(U, { stepKey: 'niyyah', text: 'O Allah accept my Umrah', lang: 'en' });
    expect(a?.id).toBeTruthy();
    await s.save(U, { stepKey: 'tawaf-start', text: 'For my parents', lang: 'ur' });
    expect(await s.list(U, 'niyyah')).toHaveLength(1);
    expect(await s.list(U)).toHaveLength(2);
    expect(await s.list('other-user')).toHaveLength(0); // per-user isolation
  });

  it('updates by id (translit/meaning/note), pins to top, deletes', async () => {
    const s = new InMemoryDuas();
    const a = (await s.save(U, { stepKey: 'niyyah', text: 'first', lang: 'en' }))!;
    const b = (await s.save(U, { stepKey: 'niyyah', text: 'second', lang: 'en' }))!;
    const up = await s.save(U, { id: a.id, stepKey: 'niyyah', text: 'first edited', lang: 'fr', translit: 'x', meaning: 'y', note: 'z' });
    expect(up?.text).toBe('first edited');
    expect(up?.translit).toBe('x');
    expect(up?.meaning).toBe('y');
    expect(up?.note).toBe('z');

    await s.togglePin(U, a.id);
    expect((await s.list(U, 'niyyah'))[0]?.id).toBe(a.id); // pinned floats to top

    await s.remove(U, b.id);
    expect((await s.list(U, 'niyyah')).map((d) => d.id)).toEqual([a.id]);
  });
});
