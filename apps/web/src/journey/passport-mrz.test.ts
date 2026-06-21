import { describe, it, expect } from 'vitest';
import { parseMrz } from './passport-mrz';

// Canonical ICAO TD3 specimen (ERIKSSON / ANNA MARIA, UTO).
const L1 = 'P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<';
const L2 = 'L898902C36UTO7408122F1204159ZE184226B<<<<<10';

describe('parseMrz (TD3)', () => {
  it('extracts the core fields from two lines', () => {
    const f = parseMrz(`${L1}\n${L2}`)!;
    expect(f.passportNumber).toBe('L898902C3');
    expect(f.nationality).toBe('UTO');
    expect(f.surname).toBe('ERIKSSON');
    expect(f.givenNames).toBe('ANNA MARIA');
    expect(f.sex).toBe('F');
    expect(f.dob).toBe('1974-08-12'); // future-year guard → last century
    expect(f.expiry).toBe('2012-04-15');
  });

  it('accepts a single 88-char blob', () => {
    const f = parseMrz(L1 + L2)!;
    expect(f.nationality).toBe('UTO');
    expect(f.surname).toBe('ERIKSSON');
  });

  it('returns null for non-MRZ text', () => {
    expect(parseMrz('just some words here that are long enough but not a passport')).toBeNull();
  });
});
