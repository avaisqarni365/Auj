import { describe, it, expect } from 'vitest';
import { MarkupEngine, applyMarkup } from './markup';
import type { MarkupRule } from './domain';

const net = { amount: 100000, currency: 'EUR' as const };

describe('applyMarkup', () => {
  it('applies a percentage', () => {
    const rule: MarkupRule = { id: '1', kind: 'PERCENT', value: 12, enabled: true };
    expect(applyMarkup(net, rule)).toEqual({ amount: 112000, currency: 'EUR' });
  });
  it('applies a fixed amount (minor units)', () => {
    const rule: MarkupRule = { id: '2', kind: 'FIXED', value: 5000, enabled: true };
    expect(applyMarkup(net, rule)).toEqual({ amount: 105000, currency: 'EUR' });
  });
});

describe('MarkupEngine', () => {
  it('picks the most specific enabled rule (tier+kind > tier > any)', () => {
    const engine = new MarkupEngine();
    engine.addRule({ kind: 'PERCENT', value: 5, enabled: true }); // any
    engine.addRule({ tier: 'GOLD', kind: 'PERCENT', value: 8, enabled: true }); // tier
    engine.addRule({ tier: 'GOLD', productKind: 'HOTEL', kind: 'PERCENT', value: 10, enabled: true }); // tier+kind

    const result = engine.price(net, { tier: 'GOLD', kind: 'HOTEL' });
    expect(result.markup.amount).toBe(10000); // 10%
    expect(result.sell.amount).toBe(110000);
  });

  it('ignores disabled rules and falls back to no markup', () => {
    const engine = new MarkupEngine();
    const r = engine.addRule({ kind: 'PERCENT', value: 20, enabled: true });
    engine.toggle(r.id, false);
    const result = engine.price(net, { tier: 'BRONZE', kind: 'FLIGHT' });
    expect(result.markup.amount).toBe(0);
    expect(result.sell).toEqual(net);
  });

  it('applies a tier rule but not for the wrong tier', () => {
    const engine = new MarkupEngine([{ id: 'g', tier: 'GOLD', kind: 'PERCENT', value: 8, enabled: true }]);
    expect(engine.price(net, { tier: 'BRONZE', kind: 'HOTEL' }).markup.amount).toBe(0);
    expect(engine.price(net, { tier: 'GOLD', kind: 'HOTEL' }).markup.amount).toBe(8000);
  });
});
