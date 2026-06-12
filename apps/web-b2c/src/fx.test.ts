import { describe, it, expect } from 'vitest';
import { eurToPkrMinor, formatMoney, formatWithPkr, FX_EUR_TO_PKR } from './fx';

describe('fx', () => {
  it('converts EUR minor units to indicative PKR minor units', () => {
    expect(eurToPkrMinor(100000)).toBe(Math.round(100000 * FX_EUR_TO_PKR));
  });

  it('formats money per currency', () => {
    expect(formatMoney({ amount: 120000, currency: 'EUR' })).toBe('€1,200.00');
    expect(formatMoney({ amount: 5000, currency: 'PKR' })).toBe('₨50.00');
  });

  it('shows the PKR equivalent for an EUR amount', () => {
    expect(formatWithPkr({ amount: 100000, currency: 'EUR' })).toContain('≈ ₨');
  });
});
