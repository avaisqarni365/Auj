import { describe, it, expect } from 'vitest';
import { WIZARDS, WIZARD_SLUGS } from './wizard-steps';

describe('step-video wizard seed', () => {
  it('defines all 4 wizards with the expected step counts and an English block', () => {
    expect(WIZARD_SLUGS).toEqual(['airport', 'luggage', 'makkah-ziyarat', 'madina-ziyarat']);
    const counts = { airport: 7, luggage: 8, 'makkah-ziyarat': 16, 'madina-ziyarat': 14 } as const;
    for (const slug of WIZARD_SLUGS) {
      const def = WIZARDS[slug];
      expect(def.slug).toBe(slug);
      expect(def.steps).toHaveLength(counts[slug]);
      for (const step of def.steps) {
        expect(step.short.length).toBeGreaterThan(0);
        // every step has at least an English title
        expect(step.text.en?.t.length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  it('luggage items are customs rules with a valid status', () => {
    const rules = WIZARDS.luggage.steps.flatMap((s) => s.items).filter((it) => typeof it !== 'string');
    expect(rules.length).toBeGreaterThan(0);
    for (const r of rules) {
      expect(['ok', 'permit', 'prohibited']).toContain((r as { status: string }).status);
    }
  });
});
