// Client-safe landing CMS overrides (no pg/node). Admin-edited copy is layered OVER the i18n
// defaults per key + locale, so the catalog copy always remains as a fallback (additive editing).
export type LandingOverrides = Record<string, Record<string, string>>; // key → locale → value

/** Editable landing copy keys (surfaced in the Admin content editor). */
export const LANDING_CONTENT_KEYS = ['hero.title', 'hero.subtitle', 'hero.badge'] as const;
export type LandingContentKey = (typeof LANDING_CONTENT_KEYS)[number];

/** Effective copy: locale override → English override → code/i18n fallback. */
export function landingCopy(key: string, locale: string, fallback: string, ov: LandingOverrides = {}): string {
  return ov[key]?.[locale]?.trim() || ov[key]?.en?.trim() || fallback;
}
