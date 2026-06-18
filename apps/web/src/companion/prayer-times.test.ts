import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchPrayerTimes } from './prayer-times';

const sample = {
  data: {
    timings: { Fajr: '05:12 (+03)', Sunrise: '06:30', Dhuhr: '12:20', Asr: '15:40', Maghrib: '18:10', Isha: '19:40' },
    date: { readable: '18 Jun 2026', hijri: { day: '2', month: { en: 'Muharram' }, year: '1448' } },
  },
};

afterEach(() => vi.unstubAllGlobals());

describe('fetchPrayerTimes (Umm al-Qura)', () => {
  it('parses timings and strips the timezone suffix', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => sample })));
    const d = await fetchPrayerTimes('Makkah');
    expect(d?.city).toBe('Makkah');
    expect(d?.timings.Fajr).toBe('05:12'); // "(+03)" stripped
    expect(d?.timings.Isha).toBe('19:40');
    expect(d?.hijri).toContain('Muharram');
  });

  it('returns null on network/HTTP failure (graceful degrade)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    expect(await fetchPrayerTimes('Madinah')).toBeNull();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })));
    expect(await fetchPrayerTimes('Makkah')).toBeNull();
  });
});
