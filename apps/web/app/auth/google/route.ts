import { NextResponse } from 'next/server';
import { googleAuthUrl, googleEnabled } from '../../../src/auth/google';

// Start Google sign-in. Redirects to Google's consent screen when configured, otherwise back to
// /login with a friendly notice (so the button is honest until OAuth creds are set).
export function GET(req: Request): NextResponse {
  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/';
  if (!googleEnabled()) {
    return NextResponse.redirect(new URL('/login?m=google-soon', url.origin));
  }
  const redirectUri = `${url.origin}/auth/google/callback`;
  return NextResponse.redirect(googleAuthUrl(redirectUri, encodeURIComponent(next)));
}
