import { NextResponse } from 'next/server';
import { googleAuthUrl, googleEnabled, publicOrigin } from '../../../src/auth/google';

// Start Google sign-in. Redirects to Google's consent screen when configured, otherwise back to
// /login with a friendly notice (so the button is honest until OAuth creds are set).
export function GET(req: Request): NextResponse {
  const url = new URL(req.url);
  const origin = publicOrigin(req);
  const next = url.searchParams.get('next') || '/';
  if (!googleEnabled()) {
    return NextResponse.redirect(`${origin}/login?m=google-soon`);
  }
  const redirectUri = `${origin}/auth/google/callback`;
  return NextResponse.redirect(googleAuthUrl(redirectUri, encodeURIComponent(next)));
}
