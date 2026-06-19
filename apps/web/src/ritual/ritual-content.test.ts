import { describe, it, expect } from 'vitest';
import { RITUAL_STEPS, ZIYARAT } from './ritual-content';
import { ritualImage } from './ritual-images';

describe('Umrah Guide content', () => {
  it('has the 15 ordered screens ending at the Ziyarat guide', () => {
    expect(RITUAL_STEPS).toHaveLength(15);
    expect(RITUAL_STEPS[0].key).toBe('welcome');
    expect(RITUAL_STEPS.at(-1)?.key).toBe('ziyarat');
    expect(RITUAL_STEPS.map((s) => s.key)).toContain('complete');
  });

  it('keys are unique and every step has a title, image and next label', () => {
    const keys = RITUAL_STEPS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const s of RITUAL_STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.next.length).toBeGreaterThan(0);
      // every image key resolves to a real src (never empty / broken)
      expect(ritualImage(s.image).src).toMatch(/\/img\/ritual\//);
      expect(ritualImage(s.image).fallbackSrc.length).toBeGreaterThan(0);
    }
  });

  it('Tawaf and Sa‘i counters both total 7', () => {
    const counters = RITUAL_STEPS.filter((s) => s.counter).map((s) => s.counter!);
    expect(counters.map((c) => c.kind).sort()).toEqual(['sai', 'tawaf']);
    for (const c of counters) expect(c.total).toBe(7);
  });

  it('every dua carries Arabic, transliteration, translation and a source', () => {
    for (const s of RITUAL_STEPS) {
      if (!s.dua) continue;
      expect(s.dua.arabic.trim().length).toBeGreaterThan(0);
      expect(s.dua.translit.trim().length).toBeGreaterThan(0);
      expect(s.dua.translation.trim().length).toBeGreaterThan(0);
      expect(s.dua.source.trim().length).toBeGreaterThan(0);
    }
  });

  it('lists Makkah and Madinah ziyarat places with unique slugs', () => {
    expect(ZIYARAT.makkah.length).toBeGreaterThanOrEqual(11);
    expect(ZIYARAT.madinah.length).toBeGreaterThanOrEqual(8);
    const slugs = [...ZIYARAT.makkah, ...ZIYARAT.madinah].map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
