import { describe, it, expect } from 'vitest';
import { forecast, clampPax, type ForecastInput } from './predict';
import { toCents } from './calc';

const input: ForecastInput = {
  flightEachCents: toCents(500),
  hotelNightCents: toCents(100),
  nights: 10,
  roomShare: 4,
  transportCents: toCents(2000),
  visaEachCents: toCents(120),
  ziyaratEachCents: toCents(50),
  foodDayCents: toCents(20),
};
const dials = { bufferPct: 5, markupPct: 12, feePct: 2 };

describe('predictive forecast', () => {
  it('grand total = sum of line groups; per-pax = grand / pax', () => {
    const f = forecast(input, 80, 'normal', dials);
    expect(f.grandCents).toBe(f.lines.reduce((s, l) => s + l.groupCents, 0));
    expect(f.perPaxCents).toBe(Math.round(f.grandCents / 80));
  });

  it('scenario scales supply lines (flights, hotels, transport); flat per-pax (visa/food) unchanged', () => {
    const base = forecast(input, 80, 'normal', dials);
    const ram = forecast(input, 80, 'ramadan', dials);
    const g = (f: typeof base, k: string): number => f.lines.find((l) => l.key === k)!.groupCents;
    expect(g(ram, 'flights')).toBeGreaterThan(g(base, 'flights'));
    expect(g(ram, 'hotels')).toBeGreaterThan(g(base, 'hotels'));
    expect(g(ram, 'transport')).toBeGreaterThan(g(base, 'transport'));
    expect(g(ram, 'transport')).toBe(Math.round(g(base, 'transport') * 1.55));
    expect(g(ram, 'visa')).toBe(g(base, 'visa'));
    expect(g(ram, 'food')).toBe(g(base, 'food'));
  });

  it('any pax 1–500 recomputes; pax clamps', () => {
    expect(clampPax(0)).toBe(1);
    expect(clampPax(999)).toBe(500);
    expect(forecast(input, 1, 'normal', dials).grandCents).toBeGreaterThan(0);
    expect(forecast(input, 120, 'peak', dials).perPaxCents).toBeGreaterThan(0);
  });

  it('suggested sell/profit come from the shared finance calc (profit == markup)', () => {
    const f = forecast(input, 80, 'peak', dials);
    expect(f.assessment.profitCents).toBe(f.assessment.markupCents);
    expect(f.assessment.sellingCents).toBeGreaterThan(f.grandCents);
  });
});
