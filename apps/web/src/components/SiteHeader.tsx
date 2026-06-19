'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { PublicUser } from '@auj/auth';
import { AccountMenu } from '../auth/AccountMenu';
import { LocaleSwitcher } from '../i18n/LocaleSwitcher';
import { NAV_LINKS } from '../content';

// Shared site chrome used across every public/account page (landing, book, journey,
// bookings, support, login, signup, redeem) so the header is identical everywhere.
// Nav links target the landing's sections via absolute /#anchor so they work off-home too.
const NAV_ANCHOR: Record<string, string> = {
  Umrah: '/#journeys',
  Hajj: '/#journeys',
  Ziyarat: '/#journeys',
  'How it works': '/#how',
  Packages: '/#packages',
  'Track booking': '/#track',
};

export function SiteHeader({ user }: { user?: PublicUser }) {
  const t = useTranslations('common');
  const locale = useLocale();
  return (
    <header className="sticky top-0 z-50 border-b border-sand-200 bg-sand-50/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-[clamp(16px,4vw,32px)] py-3">
        <Link href="/" className="flex items-center rounded-lg focus-visible:outline-none focus-visible:shadow-focus" aria-label="AUJ Travelers — home">
          <img
            src="/img/brand/auj-logo-simple.webp"
            alt="AUJ Travelers"
            width={64}
            height={64}
            className="h-16 w-auto object-contain"
          />
        </Link>
        <nav className="hidden flex-wrap items-center gap-0.5 md:flex">
          {NAV_LINKS.map((n) => (
            <a
              key={n}
              href={NAV_ANCHOR[n] ?? '/#search'}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-[14.5px] font-medium text-sand-700 transition-colors duration-fast hover:bg-sand-100 hover:text-green-800 focus-visible:outline-none focus-visible:shadow-focus"
            >
              {n}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher current={locale} />
          {user ? (
            <AccountMenu user={user} />
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap rounded-lg px-3 py-2 text-[14.5px] font-semibold text-sand-700 transition-colors duration-fast hover:bg-sand-100 focus-visible:outline-none focus-visible:shadow-focus"
            >
              {t('login')}
            </Link>
          )}
          <Link
            href={user ? '/book' : '/signup'}
            className="whitespace-nowrap rounded-[10px] bg-green-800 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(15,81,50,0.24)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
          >
            {user ? t('bookNow') : t('signup')}
          </Link>
        </div>
      </div>
    </header>
  );
}
