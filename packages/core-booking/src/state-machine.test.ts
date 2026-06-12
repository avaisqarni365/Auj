import { describe, it, expect } from 'vitest';
import { canTransition, assertTransition, InvalidTransitionError } from './state-machine';

describe('booking state machine', () => {
  it('allows the happy-path pilgrimage transitions', () => {
    expect(canTransition('DRAFT', 'HELD')).toBe(true);
    expect(canTransition('HELD', 'CONFIRMED')).toBe(true);
    expect(canTransition('CONFIRMED', 'VISA_IN_PROGRESS')).toBe(true);
    expect(canTransition('VISA_IN_PROGRESS', 'TICKETED')).toBe(true);
    expect(canTransition('TICKETED', 'COMPLETED')).toBe(true);
  });

  it('allows one-step travel (DRAFT -> CONFIRMED) and refund after cancel', () => {
    expect(canTransition('DRAFT', 'CONFIRMED')).toBe(true);
    expect(canTransition('CANCELLED', 'REFUNDED')).toBe(true);
  });

  it('rejects illegal transitions', () => {
    expect(canTransition('DRAFT', 'COMPLETED')).toBe(false);
    expect(canTransition('COMPLETED', 'DRAFT')).toBe(false);
    expect(canTransition('REFUNDED', 'CONFIRMED')).toBe(false);
    expect(() => assertTransition('DRAFT', 'COMPLETED')).toThrow(InvalidTransitionError);
  });
});
