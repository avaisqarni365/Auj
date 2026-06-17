import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, IBM_Plex_Serif } from 'next/font/google';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { DEFAULT_LOCALE, LOCALE_COOKIE, dirFor, isLocale, type Locale } from '../src/i18n/locales';
import en from '../messages/en.json';
import lt from '../messages/lt.json';
import ur from '../messages/ur.json';
import ar from '../messages/ar.json';
import './globals.css';

// Messages are imported statically and passed straight to the provider here, rather than via
// next-intl's getMessages()/request config — the request-config path returned empty messages in
// the standalone production server (MISSING_MESSAGE 500), even though the catalogs were bundled.
// Static import + direct prop is bulletproof: the catalog is in the server bundle and reaches
// every client component through the provider.
const MESSAGES = { en, lt, ur, ar } as unknown as Record<Locale, AbstractIntlMessages>;

// Self-hosted via next/font (no external @import, no FOUT). Exposed as CSS variables
// that Tailwind's font-sans/serif/mono/arabic map onto.
const sans = IBM_Plex_Sans({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });
const serif = IBM_Plex_Serif({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-serif', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });
const arabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'], variable: '--font-arabic', display: 'swap' });

export const metadata = {
  title: 'AUJ — Pilgrimage & travel',
  description: 'Umrah, Hajj & Ziyarat for the EU and the Pakistani diaspora — one cart, e-Visa guidance, EUR/PKR pricing.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookie = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie) ? cookie : DEFAULT_LOCALE;
  const messages = MESSAGES[locale];
  return (
    <html lang={locale} dir={dirFor(locale)} className={`${sans.variable} ${serif.variable} ${mono.variable} ${arabic.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
