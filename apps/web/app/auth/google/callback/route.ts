import { NextResponse } from 'next/server';
import { SESSION_COOKIE, type Session } from '@auj/auth';
import { getAuth } from '../../../../src/auth/backend';
import { derivedPassword, exchangeCodeForProfile, googleEnabled } from '../../../../src/auth/google';

// Google OAuth callback: exchange the code, find-or-create the local account for that Google
// identity, and set the session cookie. New Google users are provisioned as PILGRIM.
export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const rawNext = decodeURIComponent(url.searchParams.get('state') || '/');
  const dest = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  if (!googleEnabled() || !code) return NextResponse.redirect(new URL('/login?m=google-soon', url.origin));

  const profile = await exchangeCodeForProfile(code, `${url.origin}/auth/google/callback`);
  if (!profile) return NextResponse.redirect(new URL('/login?m=google-failed', url.origin));

  const auth = await getAuth();
  const password = derivedPassword(profile.email);
  let session: Session;
  try {
    session = (await auth.signup({ email: profile.email, password, displayName: profile.name, role: 'PILGRIM' })).session;
  } catch {
    // already provisioned (or email taken) — sign in with the derived credential
    session = (await auth.login({ email: profile.email, password })).session;
  }

  const res = NextResponse.redirect(new URL(dest, url.origin));
  res.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(session.expiresAt),
  });
  return res;
}
