import { describe, it, expect } from 'vitest';
import { buildPackage, hotelItem, flightItem } from './package-builder';

describe('package builder', () => {
  it('composes offers and totals net per currency (no FX collapse)', () => {
    const pkg = buildPackage({
      name: 'Umrah + flight',
      channel: 'PILGRIMAGE',
      items: [
        hotelItem({ id: 'h1', name: 'Makkah Hotel', city: 'MAKKAH', starRating: 5, nightlyNet: { amount: 1000, currency: 'SAR' }, nusukApproved: true }),
        hotelItem({ id: 'h2', name: 'Madinah Hotel', city: 'MADINAH', starRating: 4, nightlyNet: { amount: 500, currency: 'SAR' }, nusukApproved: true }),
        flightItem({ id: 'f1', carrier: 'Saudia', depart: '2026-09-01T09:00:00Z', arrive: '2026-09-01T16:00:00Z', net: { amount: 2000, currency: 'EUR' } }),
      ],
    });
    expect(pkg.items).toHaveLength(3);
    expect(pkg.totals).toContainEqual({ amount: 1500, currency: 'SAR' });
    expect(pkg.totals).toContainEqual({ amount: 2000, currency: 'EUR' });
    expect(pkg.id).toMatch(/^[0-9a-f-]{36}$/);
  });
});
