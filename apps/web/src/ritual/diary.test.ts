import { describe, it, expect } from 'vitest';
import { duaDone, emptyEntry, naflTotal, quranPct } from './diary';

describe('diary helpers', () => {
  it('empty entry has sane defaults', () => {
    const e = emptyEntry('2026-06-21');
    expect(e.quranTarget).toBe(1);
    expect(naflTotal(e)).toBe(0);
    expect(duaDone(e)).toBe(0);
    expect(quranPct(e)).toBe(0);
  });

  it('aggregates nafl and duas; quran bar clamps to 100', () => {
    const e = { ...emptyEntry('2026-06-21'), quranTarget: 2, quranDone: 3, nafl: { tahajjud: 2, witr: 1 }, duas: { forgive: true, health: true } };
    expect(naflTotal(e)).toBe(3);
    expect(duaDone(e)).toBe(2);
    expect(quranPct(e)).toBe(100); // 3/2 → clamped
  });
});
