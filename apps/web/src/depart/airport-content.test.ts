import { describe, it, expect } from 'vitest';
import { DEPART_AIRPORTS, DEPART_CODES, DEPART_REGIONS, cleanMedia, departAirport, safeMediaUrl } from './airport-content';

// Content invariants for the per-airport "Departing from your city" hubs. These guard the
// acceptance criteria: 18 airports across the four regions, each fully populated, valid routes.
describe('departure airport content', () => {
  it('has 18 airports with unique IATA codes', () => {
    expect(DEPART_AIRPORTS).toHaveLength(18);
    const codes = DEPART_AIRPORTS.map((a) => a.code);
    expect(new Set(codes).size).toBe(18);
    expect(codes.every((c) => /^[A-Z]{3}$/.test(c))).toBe(true);
    expect(DEPART_CODES).toEqual(codes);
  });

  it('includes the Pakistan airports (diaspora origin)', () => {
    for (const c of ['KHI', 'LHE', 'ISB', 'PEW', 'MUX', 'SKT']) expect(DEPART_CODES).toContain(c);
  });

  it('every airport is fully populated (blurb, 5 check-in steps, both destinations, arrivals)', () => {
    for (const a of DEPART_AIRPORTS) {
      expect(DEPART_REGIONS, `${a.code} region`).toContain(a.region);
      expect(a.city.trim(), `${a.code} city`).toBeTruthy();
      expect(a.country.trim(), `${a.code} country`).toBeTruthy();
      expect(a.blurb.trim().length, `${a.code} blurb`).toBeGreaterThan(10);
      expect(a.checkInSteps, `${a.code} steps`).toHaveLength(5);
      expect(a.checkInSteps.every((s) => s.trim().length > 0), `${a.code} step text`).toBe(true);
      expect(a.toMakkah.length, `${a.code} →Makkah`).toBeGreaterThanOrEqual(1);
      expect(a.toMadinah.length, `${a.code} →Madinah`).toBeGreaterThanOrEqual(1);
      expect(a.arrivalsNote.trim(), `${a.code} arrivals`).toBeTruthy();
    }
  });

  it('routes carry the right hub + at least one airline, frequency and duration', () => {
    for (const a of DEPART_AIRPORTS) {
      for (const r of a.toMakkah) {
        expect(r.dest, `${a.code} Makkah dest`).toBe('Makkah');
        expect(r.hub, `${a.code} Makkah hub`).toBe('JED');
        expect(r.airlines.length, `${a.code} Makkah airlines`).toBeGreaterThanOrEqual(1);
        expect(r.frequency.trim() && r.durationText.trim(), `${a.code} Makkah freq/dur`).toBeTruthy();
      }
      for (const r of a.toMadinah) {
        expect(r.dest, `${a.code} Madinah dest`).toBe('Madinah');
        expect(r.hub, `${a.code} Madinah hub`).toBe('MED');
        expect(r.airlines.length, `${a.code} Madinah airlines`).toBeGreaterThanOrEqual(1);
        expect(r.frequency.trim() && r.durationText.trim(), `${a.code} Madinah freq/dur`).toBeTruthy();
      }
    }
  });

  it('departAirport() is case-insensitive and rejects unknown codes', () => {
    expect(departAirport('vno')?.code).toBe('VNO');
    expect(departAirport('KHI')?.city).toBeTruthy();
    expect(departAirport('ZZZ')).toBeUndefined();
  });

  it('safeMediaUrl accepts http(s) + our media path, rejects javascript:/data:', () => {
    expect(safeMediaUrl('https://airport.example/clip.mp4')).toBe('https://airport.example/clip.mp4');
    expect(safeMediaUrl('/api/airport-media/depart/VNO/x.mp4')).toBe('/api/airport-media/depart/VNO/x.mp4');
    expect(safeMediaUrl('javascript:alert(1)')).toBe('');
    expect(safeMediaUrl('data:text/html,<script>')).toBe('');
    expect(safeMediaUrl('not a url')).toBe('');
  });

  it('cleanMedia validates type/source, strips unsafe urls, caps count', () => {
    const out = cleanMedia([
      { type: 'video', source: 'link', url: 'https://a.example/v.mp4', title: 'Walkthrough' },
      { type: 'image', source: 'upload', url: '/api/airport-media/depart/KHI/p.jpg' },
      { type: 'video', source: 'link', url: 'javascript:bad()' }, // dropped (unsafe)
      { type: 'bogus', source: 'x', url: 'https://a.example/ok.mp4' }, // coerced to video/link
    ]);
    expect(out).toHaveLength(3);
    expect(out[0]).toMatchObject({ type: 'video', source: 'link', title: 'Walkthrough' });
    expect(out[2]).toMatchObject({ type: 'video', source: 'link' });
    expect(cleanMedia(Array.from({ length: 20 }, () => ({ type: 'image', source: 'link', url: 'https://a.example/x.png' })))).toHaveLength(12);
  });
});
