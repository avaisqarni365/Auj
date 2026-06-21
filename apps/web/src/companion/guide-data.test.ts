import { describe, it, expect } from 'vitest';
import { GUIDES, GUIDE_SLUGS, type GuideCity } from './guide-data';

const CITIES: GuideCity[] = ['makkah', 'madinah'];

describe('companion guide seed', () => {
  it('defines all 7 guides with both cities and non-empty categories', () => {
    expect(GUIDE_SLUGS).toHaveLength(7);
    for (const slug of GUIDE_SLUGS) {
      const def = GUIDES[slug];
      expect(def.slug).toBe(slug);
      expect(def.title.length).toBeGreaterThan(0);
      expect(def.icon.length).toBeGreaterThan(0);
      for (const city of CITIES) {
        const cats = def.cities[city];
        expect(cats.length).toBeGreaterThan(0);
        for (const cat of cats) {
          expect(cat.key.length).toBeGreaterThan(0);
          expect(cat.items.length).toBeGreaterThan(0);
          for (const item of cat.items) {
            expect(item.name.length).toBeGreaterThan(0);
            expect(typeof item.mark).toBe('string');
          }
        }
      }
    }
  });

  it('category keys are unique within each guide/city', () => {
    for (const slug of GUIDE_SLUGS) {
      for (const city of CITIES) {
        const keys = GUIDES[slug].cities[city].map((c) => c.key);
        expect(new Set(keys).size).toBe(keys.length);
      }
    }
  });
});
