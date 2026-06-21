import { getCurrentUser } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';
import { UmrahRitualWizard } from '../../src/ritual/UmrahRitualWizard';
import { getContentStore } from '../../src/ritual/content-store';
import { getProgressStore } from '../../src/ritual/ritual-progress-store';

// Umrah Guide — free, no-login walkthrough. Browsing is open; saving (progress, du'as) needs sign-in.
export default async function GuidePage() {
  const user = await getCurrentUser();
  const overrides = await (await getContentStore()).getOverrides();
  const initialProgress = user ? ((await (await getProgressStore()).get(user.id)) ?? null) : null;
  return (
    <SitePage user={user}>
      <UmrahRitualWizard user={user} overrides={overrides} initialProgress={initialProgress} />
    </SitePage>
  );
}
