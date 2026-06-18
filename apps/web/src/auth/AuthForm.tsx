'use client';

import type { ReactNode } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Logo } from '@auj/ui';
import type { AuthState } from './actions';
import { demoLoginAction } from './actions';

type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>;

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

export function AuthForm({ mode, action, next, demo = false }: { mode: 'login' | 'signup'; action: Action; next?: string; demo?: boolean }) {
  const [state, formAction] = useFormState(action, {} as AuthState);
  const t = useTranslations('auth');
  const isSignup = mode === 'signup';

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
