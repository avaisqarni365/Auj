import type { ReactNode } from 'react';
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, IBM_Plex_Serif } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { dirFor } from '../src/i18n/locales';
import './globals.css';

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
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} dir={dirFor(locale)} className={`${sans.variable} ${serif.variable} ${mono.variable} ${arabic.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
