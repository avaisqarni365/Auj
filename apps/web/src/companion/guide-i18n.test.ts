import { describe, it, expect } from 'vitest';
import { GUIDES, GUIDE_SLUGS } from './guide-data';
import { GUIDE_I18N } from './guide-i18n';
import { WIZARDS, WIZARD_SLUGS } from '../ritual/wizard-steps';
import { WIZARD_I18N } from '../ritual/wizard-steps-i18n';

describe('LT/TR localisation overlays', () => {
  it('every guide has lt + tr overlays covering its category keys', () => {
    for (const slug of GUIDE_SLUGS) {
      for (const loc of ['lt', 'tr'] as const) {
        const tx = GUIDE_I18N[slug]?.[loc];
        expect(tx, `${slug}.${loc}`).toBeTruthy();
        // every category key present across either city has a translated name
        const keys = new Set([...GUIDES[slug].cities.makkah, ...GUIDES[slug].cities.madinah].map((c) => c.key));
        for (const k of keys) expect(tx.cat[k]?.name, `${slug}.${loc}.${k}`).toBeTruthy();
      }
    }
  });

  it('every wizard overlay is index-aligned to its step count with lt + tr titles', () => {
    for (const slug of WIZARD_SLUGS) {
      const steps = WIZARDS[slug].steps;
      const overlay = WIZARD_I18N[slug];
      expect(overlay).toHaveLength(steps.length);
      for (let i = 0; i < steps.length; i += 1) {
        expect(overlay[i]?.lt?.t, `${slug}[${i}].lt`).toBeTruthy();
        expect(overlay[i]?.tr?.t, `${slug}[${i}].tr`).toBeTruthy();
      }
    }
  });
});
