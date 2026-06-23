import { describe, expect, it } from 'vitest';
import { bookingRef, greetNameOf, reachedStages, serialFromUserId } from './dashboard-derive';

describe('dashboard-derive', () => {
  it('serial is deterministic, stable and 5 digits', () => {
    const a = serialFromUserId('user-abc-123');
    expect(a).toMatch(/^\d{5}$/);
    expect(serialFromUserId('user-abc-123')).toBe(a); // stable across calls
    expect(serialFromUserId('user-abc-124')).not.toBe(a); // varies by id
  });

  it('bookingRef uses the creation year and a stable serial', () => {
    const ref = bookingRef('user-abc-123', '2027-03-04T10:00:00Z');
    expect(ref).toBe(`BRN-27-${serialFromUserId('user-abc-123')}`);
  });

  it('bookingRef falls back to 26 when no createdAt', () => {
    expect(bookingRef('x')).toBe(`BRN-26-${serialFromUserId('x')}`);
  });

  it('greetNameOf takes the first name and strips non-letters', () => {
    expect(greetNameOf('Ahmad Khan')).toBe('Ahmad');
    expect(greetNameOf('  Yusuf123  ')).toBe('Yusuf');
    expect(greetNameOf('')).toBe('');
    expect(greetNameOf(undefined)).toBe('');
  });

  it('reachedStages derives the timeline from real booking signals', () => {
    expect(reachedStages(null)).toEqual(['Registered']);
    expect(reachedStages({ passports: {}, depositPaid: false, bookingStep: null })).toEqual(['Registered']);
    expect(reachedStages({ passports: { me: {} } })).toEqual(['Registered', 'Passport']);
    expect(reachedStages({ depositPaid: true })).toEqual(['Registered', 'Deposit']);
    expect(reachedStages({ passports: { me: {} }, depositPaid: true, bookingStep: 'CONFIRMED' })).toEqual([
      'Registered', 'Passport', 'Deposit', 'Visa started', 'Info sent',
    ]);
  });
});
