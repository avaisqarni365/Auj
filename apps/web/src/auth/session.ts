import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, type PublicUser, type Role } from '@auj/auth';
import { getAuth } from './backend';

/** Resolve the logged-in user from the session cookie (server components/actions). */
export async function getCurrentUser(): Promise<PublicUser | undefined> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return (await getAuth()).getSessionUser(token);
}

/** Redirect to /login unless the user has one of the allowed roles. Returns the user. */
export async function requireRole(roles: Role[], from: string): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(from)}`);
  if (!roles.includes(user.role)) redirect('/?denied=1');
  return user;
}
