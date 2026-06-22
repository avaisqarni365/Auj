// Google OAuth (server-only). Real flow, env-gated: set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
// (and optionally GOOGLE_OAUTH_PEPPER) to enable. Until then the button shows a friendly notice.
// We map the Google identity onto the existing password-based AuthService via a deterministic,
// server-side-derived password — so no auth-package changes and the same Google account always
// resolves to the same local account.
import { createHmac } from 'node:crypto';

export const googleEnabled = (): boolean => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

/** Public-facing origin (behind nginx the request URL is the internal host, so prefer forwarded
 *  headers / an explicit PUBLIC_BASE_URL — otherwise OAuth redirects would point at localhost). */
export function publicOrigin(req: Request): string {
  const env = process.env.PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, '');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (host) return `${req.headers.get('x-forwarded-proto') ?? 'https'}://${host}`;
  return new URL(req.url).origin;
}

export function googleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface GoogleProfile {
  email: string;
  name: string;
}

export async function exchangeCodeForProfile(code: string, redirectUri: string): Promise<GoogleProfile | null> {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) return null;
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) return null;

  const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!infoRes.ok) return null;
  const info = (await infoRes.json()) as { email?: string; name?: string };
  if (!info.email) return null;
  return { email: info.email, name: info.name || info.email.split('@')[0] || info.email };
}

/** Stable, unguessable local password for a Google identity (never shown to the user). */
export function derivedPassword(email: string): string {
  const pepper = process.env.GOOGLE_OAUTH_PEPPER ?? process.env.ADMIN_PASSWORD ?? 'auj-google-oauth-pepper';
  return `g$${createHmac('sha256', pepper).update(email.toLowerCase()).digest('hex').slice(0, 24)}`;
}
