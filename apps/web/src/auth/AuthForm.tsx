'use client';

import type { ReactNode } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Logo } from '@auj/ui';
import type { AuthState } from './actions';

type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>;

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-xl bg-green-800 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(15,81,50,0.25)] hover:bg-green-700 disabled:opacity-60"
    >
      {pending ? 'Please wait…' : label}
    </button>
  );
}

export function AuthForm({ mode, action, next }: { mode: 'login' | 'signup'; action: Action; next?: string }) {
  const [state, formAction] = useFormState(action, {} as AuthState);
  const isSignup = mode === 'signup';

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2.5 text-center">
          <Logo size={44} />
          <h1 className="font-serif text-2xl font-semibold">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="text-sm text-sand-500">
            {isSignup ? 'Book pilgrimages, track visas, manage documents.' : 'Sign in to continue your journey.'}
          </p>
        </div>

        <form action={formAction} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
          {next ? <input type="hidden" name="next" value={next} /> : null}

          {isSignup ? (
            <Field label="Full name">
              <input name="displayName" required autoComplete="name" className={inputCls} placeholder="Imran Ali" />
            </Field>
          ) : null}

          <Field label="Email">
            <input name="email" type="email" required autoComplete="email" className={inputCls} placeholder="you@example.com" />
          </Field>

          <Field label="Password">
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
            <Field label="Account type">
              <select name="role" defaultValue="PILGRIM" className={inputCls}>
                <option value="PILGRIM">Pilgrim — book for myself / family</option>
                <option value="AGENT">Travel agent — sell to clients (needs approval)</option>
              </select>
            </Field>
          ) : null}

          {state?.error ? (
            <p className="mb-3 rounded-lg bg-danger-bg px-3 py-2 text-[13px] font-medium text-danger-fg">{state.error}</p>
          ) : null}

          <Submit label={isSignup ? 'Create account' : 'Log in'} />
        </form>

        <p className="mt-4 text-center text-sm text-sand-500">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-accent-600">Log in</Link>
            </>
          ) : (
            <>
              New to AUJ?{' '}
              <Link href="/signup" className="font-semibold text-accent-600">Create an account</Link>
            </>
          )}
        </p>
      </div>
    </main>
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
