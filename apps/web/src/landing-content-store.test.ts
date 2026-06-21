import { describe, it, expect } from 'vitest';
import { getLandingContentStore } from './landing-content-store';
import { landingCopy } from './landing-content';

// No DATABASE_URL in tests → in-memory implementation.
describe('landing content CMS (in-memory)', () => {
  it('stores per key+locale and layers over the i18n fallback', async () => {
    const store = await getLandingContentStore();
    await store.setOverride('hero.title', 'lt', 'Pradėkite šventą kelionę');
    await store.setOverride('hero.title', 'en', 'Begin a sacred journey');
    const ov = await store.getOverrides();

    expect(landingCopy('hero.title', 'lt', 'FALLBACK', ov)).toBe('Pradėkite šventą kelionę');
    // missing locale → English override → fallback
    expect(landingCopy('hero.title', 'ar', 'FALLBACK', ov)).toBe('Begin a sacred journey');
    expect(landingCopy('hero.subtitle', 'lt', 'FALLBACK', ov)).toBe('FALLBACK');
  });
});
