import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@auj/auth';
import { getAuth } from '../../src/auth/backend';

// Plain GET logout so it works without client JS (a normal <a href="/logout">),
// not only via the account-menu dropdown. Invalidates the server session + clears
// the cookie, then redirects home.
export async function GET(req: Request): Promise<NextResponse> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  await (await getAuth()).logout(token);
  const res = NextResponse.redirect(new URL('/', req.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
