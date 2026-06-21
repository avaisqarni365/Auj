import { describe, it, expect } from 'vitest';
import { getObjectStore } from './document-store';

// No OBJECT_STORE_* / DATABASE_URL in tests → in-memory implementation.
describe('object store (in-memory)', () => {
  it('round-trips bytes + content type', async () => {
    const store = await getObjectStore();
    expect(store.backend).toBe('memory');
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);
    await store.put('user-1/passport/abc.png', bytes, 'image/png');
    const got = await store.get('user-1/passport/abc.png');
    expect(got?.contentType).toBe('image/png');
    expect(Array.from(got?.bytes ?? [])).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns undefined for a missing key', async () => {
    const store = await getObjectStore();
    expect(await store.get('nope/missing.png')).toBeUndefined();
  });
});
