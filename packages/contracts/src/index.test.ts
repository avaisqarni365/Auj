import { describe, it, expect } from 'vitest';
import { CONTRACTS_VERSION, type Money } from './index';

describe('@auj/contracts', () => {
  it('exposes a version', () => {
    expect(typeof CONTRACTS_VERSION).toBe('string');
  });
  it('models Money as minor units + currency', () => {
    const m: Money = { amount: 1000, currency: 'EUR' };
    expect(m.amount).toBe(1000);
    expect(m.currency).toBe('EUR');
  });
});
