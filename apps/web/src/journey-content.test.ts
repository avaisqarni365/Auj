import { describe, it, expect } from 'vitest';
import { routeFor } from '@auj/visa-router';
import { BOOKING, STAGES, TIMELINE, PILGRIM_VISAS, TRANSACTIONS } from './journey-content';

describe('journey content', () => {
  it('booking is priced in EUR with a valid 0..4 stage', () => {
    expect(BOOKING.total.currency).toBe('EUR');
    expect(BOOKING.stageIndex).toBeGreaterThanOrEqual(0);
    expect(BOOKING.stageIndex).toBeLessThan(STAGES.length);
  });

  it('paid never exceeds total (balance is non-negative)', () => {
    expect(BOOKING.total.amount - BOOKING.paid.amount).toBeGreaterThanOrEqual(0);
  });

  it('timeline has a step matching the current stage', () => {
    expect(TIMELINE.length).toBe(STAGES.length);
  });

  it('per-pilgrim visa routes reflect a mixed EU/PK group', () => {
    const routes = PILGRIM_VISAS.map((p) => routeFor({ id: 'x', firstName: 'A', lastName: 'B', passportNumber: 'X', nationality: p.nationality, dob: '1990-01-01', gender: 'M' }).route);
    expect(routes).toContain('AGENT_CHANNEL'); // PK
    expect(routes).toContain('EVISA_DIRECT'); // LT
  });

  it('transactions sum to the paid amount', () => {
    const sum = TRANSACTIONS.reduce((s, t) => s + t.amount.amount, 0);
    expect(sum).toBe(BOOKING.paid.amount);
  });
});
