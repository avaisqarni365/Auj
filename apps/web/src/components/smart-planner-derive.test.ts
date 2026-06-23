import { describe, it, expect } from 'vitest';
import { airportCode, bookHref, visaRoute } from './smart-planner-derive';

describe('smart planner derivations', () => {
  it('airportCode extracts the IATA from a label, falls back to the input', () => {
    expect(airportCode('Vilnius (VNO)')).toBe('VNO');
    expect(airportCode('Any airport')).toBe('Any airport');
    expect(airportCode('Karachi (KHI)')).toBe('KHI');
  });

  it('visaRoute maps the group passports to the right channel', () => {
    expect(visaRoute('All EU / EEA passports')).toEqual({ key: 'evisa', kind: 'success' });
    expect(visaRoute('All Pakistani passports')).toEqual({ key: 'agent', kind: 'info' });
    expect(visaRoute('Mixed (EU + Pakistani)')).toEqual({ key: 'mixed', kind: 'info' });
    expect(visaRoute('Other nationality')).toEqual({ key: 'agent', kind: 'info' });
  });

  it('bookHref carries the plan into the /book funnel (origin code, group, stay)', () => {
    const href = bookHref({ journey: 'Umrah', pilgrims: 4, rooms: 2, nights: 14, airport: 'Vilnius (VNO)', stars: '5★' });
    const url = new URL(href, 'https://x.test');
    expect(url.pathname).toBe('/book');
    expect(url.searchParams.get('city')).toBe('MAKKAH');
    expect(url.searchParams.get('journey')).toBe('Umrah');
    expect(url.searchParams.get('pax')).toBe('4');
    expect(url.searchParams.get('rooms')).toBe('2');
    expect(url.searchParams.get('nights')).toBe('14');
    expect(url.searchParams.get('from')).toBe('VNO'); // extracted from the label
    expect(url.searchParams.get('stars')).toBe('5'); // ★ stripped
  });
});
