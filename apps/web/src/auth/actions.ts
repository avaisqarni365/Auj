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

// ── Demo accounts ──────────────────────────────────────────────────────────────
// One-click login so anyone can explore the full product (mock connector) without signing
// up. Idempotently provisions the demo user, then logs in. Disable for real production by
// setting DEMO_MODE=off (the UI hides the panel; this action refuses).
const DEMO = {
  PILGRIM: { email: 'demo@auj.example', password: 'demo-pilgrim-2026', name: 'Demo Pilgrim', role: 'PILGRIM' as const },
  AGENT: { email: 'demo-agent@auj.example', password: 'demo-agent-2026', name: 'Demo Travel Agency', role: 'AGENT' as const },
  ADMIN: {
    email: process.env.ADMIN_EMAIL ?? 'admin@auj.example',
    password: process.env.ADMIN_PASSWORD ?? 'admin12345',
    name: 'AUJ Admin',
    role: 'ADMIN' as const,
  },
};

export const demoEnabled = (): boolean => process.env.DEMO_MODE !== 'off';

export async function demoLoginAction(formData: FormData): Promise<void> {
  if (!demoEnabled()) redirect('/login');
  const key = String(formData.get('role') ?? 'PILGRIM').toUpperCase();
  const cfg = DEMO[key as keyof typeof DEMO] ?? DEMO.PILGRIM;
  const auth = await getAuth();

  if (cfg.role === 'ADMIN') {
    await auth.ensureAdmin(cfg.email, cfg.password, cfg.name);
  } else {
    try {
      await auth.signup({ email: cfg.email, password: cfg.password, displayName: cfg.name, role: cfg.role });
    } catch {
      /* already provisioned */
    }
  }
  const { user, session } = await auth.login({ email: cfg.email, password: cfg.password });
  if (cfg.role === 'AGENT' && user.agentStatus !== 'ACTIVE') await auth.approveAgent(user.id);
  setSessionCookie(session);
  redirect(homeForRole(user));
}

export async function logoutAction(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  await (await getAuth()).logout(token);
  cookies().delete(SESSION_COOKIE);
  redirect('/');
}
