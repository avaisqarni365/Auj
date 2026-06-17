import Landing from '../src/Landing';
import { getCurrentUser } from '../src/auth/session';
import { buildDeals } from '../src/landing-data';

// Server entry: resolve the logged-in user (if any) and the live deal cards (from the
// env-selected connector), then hand both to the client landing.
export default async function Page() {
  const [user, deals] = await Promise.all([getCurrentUser(), buildDeals()]);
  return <Landing user={user} deals={deals} />;
}
