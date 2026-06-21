import { getCurrentUser } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { PackingOrganizer } from '../../../src/companion/PackingOrganizer';
import { getPackingStore } from '../../../src/companion/packing-store';

// Packing organizer — a smart checklist tuned to the traveller profile + stay length.
// Public + useful to anyone; ticks persist to the account when signed in.
const DEFAULT_PROFILE = 'Family' as const;

export default async function PackingPage() {
  const user = await getCurrentUser();
  const initialState = user ? ((await (await getPackingStore()).get(user.id, DEFAULT_PROFILE)) ?? null) : null;
  return (
    <SitePage user={user}>
      <PackingOrganizer signedIn={!!user} initialProfile={DEFAULT_PROFILE} initialState={initialState} />
    </SitePage>
  );
}
