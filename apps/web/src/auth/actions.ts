'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, type PublicUser, type Session } from '@auj/auth';
import { getAuth } from './backend';

export interface AuthState {
  error?: string;
}

/** Where a user lands after auth when no explicit destination was requested. */
function homeForRole(user: PublicUser): string {
  if (user.role === 'ADMIN') return '/admin';
  if (user.role === 'AGENT' || user.role === 'SUB_AGENT') return '/agent';
  return '/';
}

function setSessionCookie(session: Session): void {
  cookies().set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(session.expiresAt),
  });
}

function safeNext(raw: FormDataEntryValue | null): string {
  const v = typeof raw === 'string' ? raw : '';
  return v.startsWith('/') && !v.startsWith('//') ? v : '/';
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const requested = safeNext(formData.get('next'));
  let dest: string;
  try {
    const { user, session } = await (await getAuth()).login({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });
    setSessionCookie(session);
    // Honour an explicit ?next (e.g. from a guard); otherwise send each role to its home.
    dest = requested !== '/' ? requested : homeForRole(user);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Login failed' };
  }
  redirect(dest);
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const role = formData.get('role') === 'AGENT' ? 'AGENT' : 'PILGRIM';
  try {
    const { session } = await (await getAuth()).signup({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      displayName: String(formData.get('displayName') ?? ''),
      role,
    });
    setSessionCookie(session);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Sign up failed' };
  }
  redirect(role === 'AGENT' ? '/agent' : '/');
}

export async function logoutAction(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  await (await getAuth()).logout(token);
  cookies().delete(SESSION_COOKIE);
  redirect('/');
}
