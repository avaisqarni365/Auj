import { describe, it, expect } from 'vitest';
import { computeFinance, toCents, defaultInputs, type CostItem, type FinanceInputs } from './calc';

const item = (label: string, dec: number, basis: 'per_person' | 'total'): CostItem => ({
  id: label,
  label,
  cents: toCents(dec),
  basis,
});

const base = (over: Partial<FinanceInputs>): FinanceInputs => ({ ...defaultInputs(), ...over });

describe('umrah finance calculator', () => {
  it('economy: one traveller, exact breakdown', () => {
    const b = computeFinance(
      base({
        adults: 1,
        children: 0,
        infants: 0,
        items: [
          item('Flights', 480, 'per_person'),
          item('Visa', 120, 'per_person'),
          item('Makkah hotel', 600, 'total'),
          item('Madinah hotel', 300, 'total'),
        ],
        bufferPercent: 5,
        markupPercent: 10,
        fixedMarkupCents: 0,
        paymentFeePercent: 2,
        agentCommissionPercent: 0,
        taxPercent: 0,
        discountCents: 0,
        depositCents: 0,
      }),
    );
    expect(b.baseCostCents).toBe(150000); // €1,500.00
    expect(b.bufferCents).toBe(7500);
    expect(b.markupCents).toBe(15750);
    expect(b.paymentFeeCents).toBe(3465);
    expect(b.netCostCents).toBe(160965);
    expect(b.sellingPriceCents).toBe(176715);
    expect(b.profitCents).toBe(15750); // profit == markup when no discount
    expect(b.perPersonCents).toBe(176715);
    expect(b.balanceDueCents).toBe(176715);
  });

  it('family: per-person costs scale with traveller count; per-person price = selling / travellers', () => {
    const b = computeFinance(
      base({
        adults: 2,
        children: 2,
        infants: 0,
        items: [item('Flights', 500, 'per_person'), item('Hotels', 2000, 'total')],
        bufferPercent: 0,
        markupPercent: 10,
        paymentFeePercent: 0,
        taxPercent: 0,
      }),
    );
    expect(b.travellers).toBe(4);
    expect(b.baseCostCents).toBe(toCents(500) * 4 + toCents(2000)); // 200000 + 200000
    expect(b.perPersonCents).toBe(Math.round(b.sellingPriceCents / 4));
  });

  it('premium: profit == markup − discount, and balance == selling − deposit', () => {
    const b = computeFinance(
      base({
        adults: 2,
        items: [item('Flights', 900, 'per_person'), item('Hotels', 3000, 'total')],
        bufferPercent: 6,
        markupPercent: 15,
        fixedMarkupCents: toCents(100),
        agentCommissionPercent: 5,
        agentCommissionFixedCents: 0,
        paymentFeePercent: 2.5,
        taxPercent: 5,
        discountCents: toCents(150),
        depositCents: toCents(500),
      }),
    );
    expect(b.profitCents).toBe(b.markupCents - b.discountCents);
    expect(b.balanceDueCents).toBe(b.sellingPriceCents - b.depositCents);
    expect(b.sellingPriceCents).toBe(
      b.priceBeforeFeesCents + b.agentCommissionCents + b.paymentFeeCents + b.taxCents - b.discountCents,
    );
    expect(b.marginPct).toBeGreaterThan(0);
  });

  it('toCents is money-safe (no float drift)', () => {
    expect(toCents('480.5')).toBe(48050);
    expect(toCents('0.1')).toBe(10);
    expect(toCents('')).toBe(0);
  });
});
