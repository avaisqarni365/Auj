import { describe, it, expect } from 'vitest';
import { RITUAL_STEPS, ZIYARAT } from './ritual-content';
import { stepDesignImage } from './ritual-images';

describe('Umrah Guide content', () => {
  it('has the canonical 15-step flow with sequential step numbers', () => {
    expect(RITUAL_STEPS).toHaveLength(15);
    expect(RITUAL_STEPS[0]?.key).toBe('niyyah');
    expect(RITUAL_STEPS.at(-1)?.key).toBe('visit-madinah');
    expect(RITUAL_STEPS.map((s) => s.step)).toEqual(RITUAL_STEPS.map((_, i) => i + 1));
    expect(RITUAL_STEPS.map((s) => s.key)).toEqual(
      expect.arrayContaining(['talbiyah', 'enter-haram', 'tawaf-start', 'sai-start', 'umrah-complete']),
    );
  });

  it('keys are unique, and every step maps to a designed image', () => {
    const keys = RITUAL_STEPS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const s of RITUAL_STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.next.length).toBeGreaterThan(0);
      expect(stepDesignImage(s.key)).toMatch(/\/img\/scenes\//);
    }
  });

  it('Tawaf and Sa‘i counters both total 7', () => {
    const counters = RITUAL_STEPS.filter((s) => s.counter).map((s) => s.counter!);
    expect(counters.map((c) => c.kind).sort()).toEqual(['sai', 'tawaf']);
    for (const c of counters) expect(c.total).toBe(7);
  });

  it('every dua has Arabic, transliteration, a source, and per-language meanings (6 languages)', () => {
    const duas = RITUAL_STEPS.flatMap((s) => s.duas ?? []);
    expect(duas.length).toBeGreaterThanOrEqual(3);
    for (const d of duas) {
      expect(d.arabic.trim().length).toBeGreaterThan(0);
      expect(d.translit.trim().length).toBeGreaterThan(0);
      expect(d.source.trim().length).toBeGreaterThan(0);
      expect(d.translations.map((t) => t.code)).toEqual(['en', 'ur', 'fr', 'id', 'tr', 'bn']);
    }
  });

  it('ziyarat steps reference real city lists with unique slugs', () => {
    const cities = RITUAL_STEPS.filter((s) => s.ziyarat).map((s) => s.ziyarat);
    expect(cities.sort()).toEqual(['madinah', 'makkah']);
    const slugs = [...ZIYARAT.makkah, ...ZIYARAT.madinah].map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
