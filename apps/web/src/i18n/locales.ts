export const LOCALES = ['en', 'lt', 'ur', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

// Arabic and Urdu render right-to-left.
const RTL: ReadonlySet<string> = new Set(['ar', 'ur']);
export const dirFor = (locale: string): 'rtl' | 'ltr' => (RTL.has(locale) ? 'rtl' : 'ltr');
export const isLocale = (v: string | undefined): v is Locale => v != null && (LOCALES as readonly string[]).includes(v);

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  lt: 'Lietuvių',
  ur: 'اردو',
  ar: 'العربية',
};
