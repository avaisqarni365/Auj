import Landing from '../src/Landing';
import { getCurrentUser } from '../src/auth/session';
import { buildDeals } from '../src/landing-data';
import { getLandingContentStore } from '../src/landing-content-store';

// Server entry: resolve the logged-in user (if any), the live deal cards (from the env-selected
// connector) and any admin CMS copy overrides, then hand them to the client landing.
export default async function Page() {
  const [user, deals, content] = await Promise.all([
    getCurrentUser(),
    buildDeals(),
    getLandingContentStore().then((s) => s.getOverrides()),
  ]);
  return <Landing user={user} deals={deals} content={content} />;
}
