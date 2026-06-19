// Client-safe content-override types + merge (no pg/node imports). Admin-edited overrides are layered
// OVER the code defaults (ritual-content.ts / i18n.ts) per step + language, so the static content
// always remains as a fallback and editing is purely additive.
import type { RitualStep } from './ritual-content';
import { localizedTitle } from './i18n';

export interface StepOverride {
  title?: string;
  subtitle?: string;
  intro?: string;
}

/** stepKey → langCode → override fields. */
export type ContentOverrides = Record<string, Record<string, StepOverride>>;

export interface EffectiveContent {
  title: string;
  subtitle?: string;
  intro?: string;
  /** Whether the intro is in the selected language (override present) vs falling back to English. */
  introTranslated: boolean;
}

/** Merge an admin override over the static default for one step in one language. */
export function effectiveContent(step: RitualStep, lang: string, ov: ContentOverrides): EffectiveContent {
  const o = ov[step.key]?.[lang] ?? {};
  return {
    title: o.title?.trim() || localizedTitle(step, lang),
    subtitle: o.subtitle?.trim() || step.subtitle,
    intro: o.intro?.trim() || step.intro,
    introTranslated: lang === 'en' || !!o.intro?.trim(),
  };
}

/** Drop empty strings so a cleared field reverts to the default instead of overriding with "". */
export function cleanOverride(fields: StepOverride): StepOverride {
  const out: StepOverride = {};
  if (fields.title?.trim()) out.title = fields.title.trim();
  if (fields.subtitle?.trim()) out.subtitle = fields.subtitle.trim();
  if (fields.intro?.trim()) out.intro = fields.intro.trim();
  return out;
}
