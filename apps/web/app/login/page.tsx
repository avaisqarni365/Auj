import { redirect } from 'next/navigation';
import { AuthForm } from '../../src/auth/AuthForm';
import { demoEnabled, loginAction } from '../../src/auth/actions';
import { getCurrentUser } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  if (await getCurrentUser()) redirect('/');
  return (
    <SitePage center>
      <AuthForm mode="login" action={loginAction} next={searchParams.next} demo={demoEnabled()} />
    </SitePage>
  );
}
