import { describe, it, expect } from 'vitest';
import { formatMoney, pkrIndicative, FX_EUR_TO_PKR } from './currency';
import { SEARCH_COUNT, PACKAGES, LOCALES, FAQS } from './content';

describe('landing currency', () => {
  it('formats EUR without silent conversion', () => {
    expect(formatMoney({ amount: 248000, currency: 'EUR' })).toBe('€2,480');
  });
  it('shows an indicative PKR figure at the FX rate', () => {
    expect(FX_EUR_TO_PKR).toBe(310.8);
    expect(pkrIndicative({ amount: 248000, currency: 'EUR' })).toContain('₨');
  });
});

describe('landing content', () => {
  it('has a package count per search tab', () => {
    expect(SEARCH_COUNT.Umrah).toBeGreaterThan(0);
  });
  it('packages carry a visa route and EUR price', () => {
    expect(PACKAGES.every((p) => p.price.currency === 'EUR')).toBe(true);
    expect(PACKAGES.some((p) => p.visa === 'Agent')).toBe(true);
  });
  it('ships the four locales with RTL flags for AR/UR', () => {
    expect(LOCALES.map((l) => l.code)).toEqual(['en', 'lt', 'ur', 'ar']);
    expect(LOCALES.find((l) => l.code === 'ar')?.rtl).toBe(true);
    expect(LOCALES.find((l) => l.code === 'en')?.rtl).toBe(false);
  });
  it('has FAQs', () => {
    expect(FAQS.length).toBeGreaterThanOrEqual(4);
  });
});
