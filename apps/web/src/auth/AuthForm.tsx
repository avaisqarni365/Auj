'use client';

import type { ReactNode } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Logo } from '@auj/ui';
import type { AuthState } from './actions';
import { demoLoginAction } from './actions';
import { AUJ_CONTACT } from '../content';

type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>;

const WHATSAPP_NUMBER = AUJ_CONTACT.phone.replace(/[^\d]/g, '');
const NOTICE: Record<string, string> = {
  'google-soon': 'Google sign-in is being set up — please continue with email for now.',
  'google-failed': 'Google sign-in didn’t complete. Please try again or use email.',
};

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useTranslations('auth');
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-xl bg-green-800 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(15,81,50,0.25)] hover:bg-green-700 disabled:opacity-60"
    >
      {pending ? t('pleaseWait') : label}
    </button>
  );
}

export function AuthForm({ mode, action, next, demo = false, notice }: { mode: 'login' | 'signup'; action: Action; next?: string; demo?: boolean; notice?: string }) {
  const [state, formAction] = useFormState(action, {} as AuthState);
  const t = useTranslations('auth');
  const isSignup = mode === 'signup';

  const intent = isSignup ? 'Hi AUJ, I’d like to create an account.' : 'Hi AUJ, I need help signing in.';
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(intent)}`;
  const mailHref = `mailto:${AUJ_CONTACT.email}?subject=${encodeURIComponent(isSignup ? 'AUJ sign-up' : 'AUJ sign-in help')}&body=${encodeURIComponent(intent)}`;
  const googleHref = `/auth/google?next=${encodeURIComponent(next ?? '/')}`;

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2.5 text-center">
          <Logo size={44} />
          <h1 className="font-serif text-2xl font-semibold">{isSignup ? t('titleSignup') : t('titleLogin')}</h1>
          <p className="text-sm text-sand-500">
            {isSignup ? t('subSignup') : t('subLogin')}
          </p>
        </div>

        <form action={formAction} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          {next ? <input type="hidden" name="next" value={next} /> : null}

          {isSignup ? (
            <Field label={t('fullName')}>
              <input name="displayName" required autoComplete="name" className={inputCls} placeholder="Imran Ali" />
            </Field>
          ) : null}

          <Field label={t('email')}>
            <input name="email" type="email" required autoComplete="email" className={inputCls} placeholder="you@example.com" />
          </Field>

          <Field label={t('password')}>
            <input
              name="password"
              type="password"
              required
              minLength={isSignup ? 8 : undefined}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              className={inputCls}
              placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
            />
          </Field>

          {isSignup ? (
            <Field label={t('accountType')}>
              <select name="role" defaultValue="PILGRIM" className={inputCls}>
                <option value="PILGRIM">{t('rolePilgrim')}</option>
                <option value="AGENT">{t('roleAgent')}</option>
              </select>
            </Field>
          ) : null}

          {state?.error ? (
            <p className="mb-3 rounded-lg bg-danger-bg px-3 py-2 text-[13px] font-medium text-danger-fg">{state.error}</p>
          ) : null}

          <Submit label={isSignup ? t('createAccount') : t('login')} />
        </form>

        {/* Google + assisted (WhatsApp / email) — works for sign-up and sign-in */}
        <div className="mt-4">
          {notice && NOTICE[notice] ? (
            <p className="mb-3 rounded-lg bg-accent-100 px-3 py-2 text-center text-[13px] font-medium text-accent-700">{NOTICE[notice]}</p>
          ) : null}
          <div className="my-3 flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-wider text-sand-400">
            <span className="h-px flex-1 bg-sand-200" /> or <span className="h-px flex-1 bg-sand-200" />
          </div>
          <a
            href={googleHref}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-sand-300 bg-white py-3 text-sm font-semibold text-sand-ink transition-colors duration-fast hover:bg-sand-50 focus-visible:outline-none focus-visible:shadow-focus"
          >
            <GoogleG /> Continue with Google
          </a>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-success/40 bg-success/5 py-2.5 text-[13.5px] font-semibold text-success-fg transition-colors duration-fast hover:bg-success/10"
            >
              <span aria-hidden>✆</span> WhatsApp
            </a>
            <a
              href={mailHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-sand-300 bg-white py-2.5 text-[13.5px] font-semibold text-green-800 transition-colors duration-fast hover:bg-sand-50"
            >
              <span aria-hidden>✉</span> Email
            </a>
          </div>
          <p className="mt-2 text-center text-[11px] text-sand-400">
            {isSignup ? 'Prefer a hand? Sign up with our team on WhatsApp or email.' : 'Need help signing in? Reach our team on WhatsApp or email.'}
          </p>
        </div>

        {!isSignup && demo ? (
          <div className="mt-5 rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-4">
            <div className="mb-2.5 text-center text-[12.5px] font-semibold text-sand-600">Try the demo — no sign-up</div>
            <div className="grid grid-cols-3 gap-2">
              {([
                { role: 'PILGRIM', label: 'Pilgrim', icon: '🧳' },
                { role: 'AGENT', label: 'Agent', icon: '🏢' },
                { role: 'ADMIN', label: 'Admin', icon: '🛡' },
              ] as const).map((d) => (
                <form key={d.role} action={demoLoginAction}>
                  <input type="hidden" name="role" value={d.role} />
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-sand-200 bg-white px-2 py-2.5 text-[13px] font-semibold text-sand-700 transition-[transform,background-color] duration-fast hover:border-green-700 hover:text-green-800 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
                  >
                    <span className="block text-base">{d.icon}</span>
                    {d.label}
                  </button>
                </form>
              ))}
            </div>
            <p className="mt-2.5 text-center text-[11px] text-sand-400">Demo data is shared &amp; resets periodically.</p>
          </div>
        ) : null}

        <p className="mt-4 text-center text-sm text-sand-500">
          {isSignup ? (
            <>
              {t('haveAccount')}{' '}
              <Link href="/login" className="font-semibold text-accent-600">{t('login')}</Link>
            </>
          ) : (
            <>
              {t('newToAuj')}{' '}
              <Link href="/signup" className="font-semibold text-accent-600">{t('createOne')}</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2.5 text-[14.5px] text-sand-ink focus:border-green-700 focus:outline-none';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">{label}</span>
      {children}
    </label>
  );
}
