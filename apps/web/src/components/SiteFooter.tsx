'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AUJ_CONTACT, PAYMENT_METHODS, SOCIALS } from '../content';

// Shared site footer — identical on every page. AUJ's own identity (EU operator, insolvency
// protection — NOT UK ATOL). Company registration + registered address are intentionally
// left out until AUJ supplies verified details; contact values below are placeholders.
function Col({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[13px] font-bold text-white">{title}</div>
      <ul className="mt-3 grid gap-2 text-[13.5px]">{children}</ul>
    </div>
  );
}

function FLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="rounded text-green-100/75 transition-colors duration-fast hover:text-white focus-visible:outline-none focus-visible:shadow-focus">
        {children}
      </Link>
    </li>
  );
}

export function SiteFooter() {
  const t = useTranslations('footer');
  const c = useTranslations('common');
  return (
    <footer className="bg-green-950 text-green-100/80">
      <div className="mx-auto max-w-6xl px-[clamp(16px,4vw,32px)] py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
          {/* brand + protection + social */}
          <div>
            <Link href="/" className="inline-flex items-center rounded-xl focus-visible:outline-none focus-visible:shadow-focus" aria-label="AUJ Travelers — home">
              <img
                src="/img/brand/auj-logo-simple.webp"
                alt="AUJ Travelers"
                width={96}
                height={96}
                className="h-24 w-auto rounded-xl bg-white/95 object-contain p-1.5"
              />
            </Link>
            <p className="mt-3 max-w-[42ch] text-[13px] leading-relaxed">{t('tagline')}</p>
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3.5">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
                <span className="text-gold">★</span> {t('protectionTitle')}
              </div>
              <p className="mt-1 text-[12px] leading-relaxed">{t('protectionDesc')}</p>
            </div>
            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-wider text-green-100/50">{t('follow')}</div>
              <div className="mt-2.5 flex gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-[transform,background-color] duration-fast hover:bg-white/10 active:scale-[0.96] focus-visible:outline-none focus-visible:shadow-focus"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <Col title={t('quickLinks')}>
            <FLink href="/companion">{t('companion')}</FLink>
            <FLink href="/#why">{t('about')}</FLink>
            <FLink href="/support">{t('contact')}</FLink>
            <FLink href="/#deals">{t('newsroom')}</FLink>
            <FLink href="/#faq">{t('terms')}</FLink>
            <FLink href="/#faq">{t('privacy')}</FLink>
          </Col>

          <Col title={t('packages')}>
            <FLink href="/#packages">{t('economy')}</FLink>
            <FLink href="/#packages">{t('standard')}</FLink>
            <FLink href="/#packages">{t('premium')}</FLink>
            <FLink href="/#categories">{t('packages')}</FLink>
          </Col>

          {/* connect + contact + payment */}
          <div>
            <div className="text-[13px] font-bold text-white">{t('connect')}</div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed">{t('connectSub')}</p>
            <form className="mt-3 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                aria-label={t('emailPlaceholder')}
                placeholder={t('emailPlaceholder')}
                className="h-11 min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 text-[13.5px] text-white placeholder:text-green-100/40 focus-visible:border-white/40 focus-visible:outline-none"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-xl bg-gold px-4 text-[13.5px] font-bold text-green-950 transition-[transform,opacity] duration-fast hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
              >
                {t('subscribe')}
              </button>
            </form>

            <div className="mt-6 text-[13px] font-bold text-white">{t('getInTouch')}</div>
            <ul className="mt-2.5 grid gap-2 text-[13.5px]">
              <li>
                <a href={`mailto:${AUJ_CONTACT.email}`} className="inline-flex items-center gap-2 text-green-100/75 transition-colors duration-fast hover:text-white">
                  <span aria-hidden>✉️</span> {AUJ_CONTACT.email}
                </a>
              </li>
              <li>
                <a href={`tel:${AUJ_CONTACT.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 font-mono text-green-100/75 transition-colors duration-fast hover:text-white">
                  <span aria-hidden>📞</span> {AUJ_CONTACT.phone}
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-green-100/75">
                <span aria-hidden>📍</span> {AUJ_CONTACT.location}
              </li>
            </ul>

            <div className="mt-5 text-[11px] uppercase tracking-wider text-green-100/50">{t('payment')}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map((m) => (
                <span key={m} className="rounded-md bg-white/10 px-2.5 py-1 text-[11.5px] font-semibold text-white">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* legal + rights */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="max-w-[110ch] text-[11.5px] leading-relaxed text-green-100/55">{t('legal')}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px]">
            <span>{t('rights')}</span>
            <div className="flex items-center gap-4">
              <Link href="/redeem" className="font-semibold text-gold transition-opacity duration-fast hover:opacity-90 focus-visible:outline-none focus-visible:shadow-focus">
                {c('redeemGift')}
              </Link>
              <span>EN · LT · UR · AR</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
