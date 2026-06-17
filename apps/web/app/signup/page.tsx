import { redirect } from 'next/navigation';
import { AuthForm } from '../../src/auth/AuthForm';
import { signupAction } from '../../src/auth/actions';
import { getCurrentUser } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';

export default async function SignupPage() {
  if (await getCurrentUser()) redirect('/');
  return (
    <SitePage center>
      <AuthForm mode="signup" action={signupAction} />
    </SitePage>
  );
}
