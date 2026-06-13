import { redirect } from 'next/navigation';
import { AuthForm } from '../../src/auth/AuthForm';
import { loginAction } from '../../src/auth/actions';
import { getCurrentUser } from '../../src/auth/session';

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  if (await getCurrentUser()) redirect('/');
  return <AuthForm mode="login" action={loginAction} next={searchParams.next} />;
}
