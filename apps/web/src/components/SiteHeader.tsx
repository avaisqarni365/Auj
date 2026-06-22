'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { PublicUser } from '@auj/auth';
import { AccountMenu } from '../auth/AccountMenu';
import { LocaleSwitcher } from '../i18n/LocaleSwitcher';

// Shared site chrome used across every public/account page (landing, book, journey,
// bookings, support, login, signup, redeem) so the header is identical everywhere.
// Nav matches AUJ Landing Cinematic.dc.html: a Packages dropdown + Umrah + Ziyarat with icons.
// Links target the landing's sections via absolute /#anchor so they work off-home too.
const PACKAGES_MENU: { label: string; href: string }[] = [
  { label: 'How it works', href: '/#how' },
  { label: 'Visa help', href: '/#visa' },
  { label: 'For agents', href: '/agent' },
  { label: 'Support', href: '/#support' },
];

const navLinkCls =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-[14.5px] font-medium text-sand-700 transition-colors duration-fast hover:bg-sand-100 hover:text-green-800 focus-visible:outline-none focus-visible:shadow-focus';

// icon paths ported from the prototype nav (20×20, currentColor stroke)
const ICON_PACKAGES = 'M10 2.6l6.5 3v6.8l-6.5 3-6.5-3V5.6z M3.7 5.8l6.3 3 6.3-3M10 8.8V18';
const ICON_UMRAH = 'M5 6.5h10v9H5z M3.5 6.5h13M5 9.5h10';
const ICON_ZIYARAT = 'M10 2.6a5 5 0 0 1 5 5c0 3.5-5 9.4-5 9.4S5 11.1 5 7.6a5 5 0 0 1 5-5z M10 5.6a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4z';

const NavIcon = ({ d }: { d: string }) => (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
    <path d={d} />
  </svg>
);

export function SiteHeader({ user }: { user?: PublicUser }) {
  const t = useTranslations('common');
  const locale = useLocale();
  return (
    <header className="sticky top-0 z-50 border-b border-sand-200 bg-sand-50/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-[clamp(16px,4vw,32px)] py-2.5">
        {/* Logo overflows above/below the compact header bar, per the prototype */}
        <Link
          href="/"
          aria-label="AUJ Travelers — home"
          className="relative inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:shadow-focus"
          style={{ height: 'clamp(54px,7vw,70px)' }}
        >
          <img
            src="/img/brand/auj-logo-simple.webp"
            alt="AUJ Travelers"
            width={240}
            height={240}
            className="w-auto object-contain"
            style={{ height: 'clamp(164px,22vw,232px)', margin: 'clamp(-84px,-10.5vw,-62px) 0', filter: 'drop-shadow(0 6px 14px rgba(42,38,32,0.18))' }}
          />
        </Link>
        <nav className="hidden flex-wrap items-center gap-0.5 md:flex">
          {/* Packages — dropdown (opens on hover / keyboard focus) */}
          <div className="group relative">
            <a href="/#packages" className={navLinkCls}>
              <NavIcon d={ICON_PACKAGES} />
              Packages
              <span className="text-[11px] text-sand-500" aria-hidden>▾</span>
            </a>
            <div className="invisible absolute left-0 top-full z-50 pt-2.5 opacity-0 transition-[opacity,visibility] duration-fast group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="min-w-[212px] rounded-2xl border border-sand-200 bg-white p-2 shadow-lg">
                {PACKAGES_MENU.map((m) => (
                  <a
                    key={m.label}
                    href={m.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-sand-700 transition-colors duration-fast hover:bg-sand-100 hover:text-green-800 focus-visible:outline-none focus-visible:shadow-focus"
                  >
                    {m.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <a href="/#search" className={navLinkCls}>
            <NavIcon d={ICON_UMRAH} />
            Umrah
          </a>
          <a href="/#search" className={navLinkCls}>
            <NavIcon d={ICON_ZIYARAT} />
            Ziyarat
          </a>
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
