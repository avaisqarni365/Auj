import { describe, it, expect } from 'vitest';
import { routeFor } from '@auj/visa-router';
import { ADMIN_KPIS, PILGRIMS, STAGES, USERS } from './admin-content';

describe('admin content', () => {
  it('has KPIs and a CRM list', () => {
    expect(ADMIN_KPIS).toHaveLength(4);
    expect(PILGRIMS.length).toBeGreaterThan(0);
  });

  it('every pilgrim has a valid 0..4 timeline stage', () => {
    for (const p of PILGRIMS) {
      expect(p.stage).toBeGreaterThanOrEqual(0);
      expect(p.stage).toBeLessThan(STAGES.length);
    }
  });

  it('visa-route rule applies per nationality (PK -> agent, LT -> e-visa)', () => {
    const pk = PILGRIMS.find((p) => p.nationality === 'PK')!;
    const lt = PILGRIMS.find((p) => p.nationality === 'LT')!;
    expect(routeFor({ id: 'x', firstName: 'A', lastName: 'B', passportNumber: 'X', nationality: pk.nationality, dob: '1990-01-01', gender: 'M' }).route).toBe('AGENT_CHANNEL');
    expect(routeFor({ id: 'x', firstName: 'A', lastName: 'B', passportNumber: 'X', nationality: lt.nationality, dob: '1990-01-01', gender: 'M' }).route).toBe('EVISA_DIRECT');
  });

  it('has users with roles', () => {
    expect(USERS.some((u) => u.role === 'Admin')).toBe(true);
    expect(USERS.some((u) => u.role === 'Agent')).toBe(true);
  });
});
