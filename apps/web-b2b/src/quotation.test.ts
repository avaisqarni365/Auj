import { describe, it, expect } from 'vitest';
import { MarkupEngine } from './markup';
import { QuotationService } from './quotation';

describe('QuotationService', () => {
  it('totals lines, applies markup, and tracks status', () => {
    const engine = new MarkupEngine([{ id: 'g', tier: 'GOLD', kind: 'PERCENT', value: 10, enabled: true }]);
    const svc = new QuotationService(engine, () => '2026-06-13T00:00:00.000Z');

    const quote = svc.create({
      agentId: 'a1',
      tier: 'GOLD',
      kind: 'HOTEL',
      validUntil: '2026-07-01',
      lines: [
        { label: 'Makkah hotel x5', net: { amount: 80000, currency: 'EUR' } },
        { label: 'Transfers', net: { amount: 20000, currency: 'EUR' } },
      ],
    });

    expect(quote.netTotal).toEqual({ amount: 100000, currency: 'EUR' });
    expect(quote.markup).toEqual({ amount: 10000, currency: 'EUR' });
    expect(quote.sell).toEqual({ amount: 110000, currency: 'EUR' });
    expect(quote.status).toBe('DRAFT');

    expect(svc.send(quote.id).status).toBe('SENT');
    expect(svc.markConverted(quote.id).status).toBe('CONVERTED');
  });
});
