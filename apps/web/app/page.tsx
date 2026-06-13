import Landing from '../src/Landing';
import { getCurrentUser } from '../src/auth/session';

// Server entry: resolve the logged-in user (if any) and hand it to the client landing
// so the nav can show the account menu vs Log in / Sign up.
export default async function Page() {
  const user = await getCurrentUser();
  return <Landing user={user} />;
}
