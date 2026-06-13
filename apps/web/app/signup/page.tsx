import { redirect } from 'next/navigation';
import { AuthForm } from '../../src/auth/AuthForm';
import { signupAction } from '../../src/auth/actions';
import { getCurrentUser } from '../../src/auth/session';

export default async function SignupPage() {
  if (await getCurrentUser()) redirect('/');
  return <AuthForm mode="signup" action={signupAction} />;
}
