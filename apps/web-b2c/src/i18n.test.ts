import { describe, it, expect } from 'vitest';
import { LOCALES, dir, t } from './i18n';

describe('i18n', () => {
  it('marks Arabic and Urdu as RTL, others LTR', () => {
    expect(dir('ar')).toBe('rtl');
    expect(dir('ur')).toBe('rtl');
    expect(dir('en')).toBe('ltr');
    expect(dir('lt')).toBe('ltr');
  });

  it('translates a key in every locale', () => {
    for (const locale of LOCALES) {
      expect(t(locale, 'search').length).toBeGreaterThan(0);
    }
    expect(t('en', 'visa_evisa')).toBe('e-Visa');
    expect(t('ar', 'brand')).toBe('أوج');
  });
});
