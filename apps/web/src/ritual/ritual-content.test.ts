import { describe, it, expect } from 'vitest';
import { RITUAL_STEPS, ZIYARAT } from './ritual-content';
import { ritualImage } from './ritual-images';

describe('Umrah Guide content', () => {
  it('has ordered screens from Niyyah → … → Umrah complete with sequential step numbers', () => {
    expect(RITUAL_STEPS.length).toBeGreaterThanOrEqual(15);
    expect(RITUAL_STEPS[0]?.key).toBe('niyyah');
    expect(RITUAL_STEPS.at(-1)?.key).toBe('umrah-complete');
    expect(RITUAL_STEPS.map((s) => s.step)).toEqual(RITUAL_STEPS.map((_, i) => i + 1));
    // Talbiyah and the Masjid al-Haram arrival are their own screens (from the detailed designs).
    expect(RITUAL_STEPS.map((s) => s.key)).toEqual(expect.arrayContaining(['talbiyah', 'enter-haram']));
  });

  it('keys are unique and every step has a title, image and next label', () => {
    const keys = RITUAL_STEPS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const s of RITUAL_STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.next.length).toBeGreaterThan(0);
      expect(ritualImage(s.image).src).toMatch(/\/img\/ritual\//);
      expect(ritualImage(s.image).fallbackSrc.length).toBeGreaterThan(0);
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
      const codes = d.translations.map((t) => t.code);
      expect(codes).toEqual(['en', 'ur', 'fr', 'id', 'tr', 'bn']);
      for (const t of d.translations) expect(t.text.trim().length).toBeGreaterThan(0);
    }
  });

  it('ziyarat steps reference real city lists with unique slugs', () => {
    const cities = RITUAL_STEPS.filter((s) => s.ziyarat).map((s) => s.ziyarat);
    expect(cities.sort()).toEqual(['madinah', 'makkah']);
    const slugs = [...ZIYARAT.makkah, ...ZIYARAT.madinah].map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(ZIYARAT.makkah.length).toBeGreaterThanOrEqual(11);
    expect(ZIYARAT.madinah.length).toBeGreaterThanOrEqual(8);
  });
});
