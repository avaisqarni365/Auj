import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './locales';
import en from '../../messages/en.json';
import lt from '../../messages/lt.json';
import ur from '../../messages/ur.json';
import ar from '../../messages/ar.json';

// Cookie-driven locale (no /[locale] URL routing): the whole app re-renders in the chosen
// language + direction. Catalogs are STATICALLY imported (not a dynamic `import(path)`) so
// they're bundled into the standalone production server — a dynamic template import isn't
// traced into the standalone output and left messages empty in prod (MISSING_MESSAGE).
const MESSAGES = { en, lt, ur, ar } as unknown as Record<Locale, AbstractIntlMessages>;

export default getRequestConfig(async () => {
  const cookie = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie) ? cookie : DEFAULT_LOCALE;
  return { locale, messages: MESSAGES[locale] };
});
