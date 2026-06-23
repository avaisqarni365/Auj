import { describe, it, expect } from 'vitest';
import { HOTEL_CITIES, cleanCity, hotelsForCity, isHotelCity } from './hotels-data';

describe('hotels data', () => {
  it('ships makkah + madinah, each with bands of named hotels', () => {
    expect(HOTEL_CITIES).toEqual(['makkah', 'madinah']);
    for (const slug of HOTEL_CITIES) {
      const city = hotelsForCity(slug);
      expect(city.slug).toBe(slug);
      expect(city.title.trim(), `${slug} title`).toBeTruthy();
      expect(city.mosque.trim(), `${slug} mosque`).toBeTruthy();
      expect(city.bands.length, `${slug} bands`).toBeGreaterThanOrEqual(4);
      for (const b of city.bands) {
        expect(b.short.trim() && b.walk.trim() && b.area.trim(), `${slug} band meta`).toBeTruthy();
        expect(b.hotels.length, `${slug}/${b.short} hotels`).toBeGreaterThanOrEqual(1);
        for (const h of b.hotels) {
          expect(h.name.trim(), `${slug} hotel name`).toBeTruthy();
          expect(h.stars.trim(), `${slug} hotel stars`).toBeTruthy();
        }
      }
    }
  });

  it('isHotelCity guards the route param', () => {
    expect(isHotelCity('makkah')).toBe(true);
    expect(isHotelCity('madinah')).toBe(true);
    expect(isHotelCity('jeddah')).toBe(false);
    expect(isHotelCity('')).toBe(false);
  });

  it('cleanCity forces the canonical slug + caps lists/strings (security)', () => {
    const dirty = {
      slug: 'madinah', // attacker tries to save under another slug — must be ignored
      title: 'x'.repeat(500),
      mosque: 'Masjid al-Haram',
      bands: Array.from({ length: 20 }, () => ({
        short: 'B', dist: '300m', walk: '5 min', area: 'Ajyad', name: 'Band',
        hotels: Array.from({ length: 50 }, () => ({ name: 'H', stars: '5★', note: 'n', dist: '120m' })),
      })),
    };
    const out = cleanCity('makkah', dirty);
    expect(out.slug).toBe('makkah'); // canonical wins
    expect(out.title.length).toBe(120); // capped
    expect(out.bands.length).toBe(12); // capped
    expect(out.bands[0]!.hotels.length).toBe(30); // capped
  });

  it('cleanCity tolerates malformed input', () => {
    const out = cleanCity('makkah', { bands: 'nope' } as unknown);
    expect(out.bands).toEqual([]);
    expect(out.slug).toBe('makkah');
  });
});
