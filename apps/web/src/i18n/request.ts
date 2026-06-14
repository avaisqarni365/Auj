import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from './locales';

// Cookie-driven locale (no /[locale] URL routing): the whole app re-renders in the
// chosen language + direction. Messages are loaded per request from messages/<locale>.json.
export default getRequestConfig(async () => {
  const cookie = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie) ? cookie : DEFAULT_LOCALE;
  const { default: messages } = await import(`../../messages/${locale}.json`);
  return { locale, messages };
});
