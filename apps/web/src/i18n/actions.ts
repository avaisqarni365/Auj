'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from './locales';

/** Persist the chosen locale in a cookie and re-render the whole app (layout) in it. */
export async function setLocaleAction(formData: FormData): Promise<void> {
  const raw = String(formData.get('locale') ?? '');
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  cookies().set(LOCALE_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  revalidatePath('/', 'layout');
}
