import { getCurrentUser } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';
import { UmrahRitualWizard } from '../../src/ritual/UmrahRitualWizard';
import { getContentStore } from '../../src/ritual/content-store';

// Umrah Guide — free, no-login ritual walkthrough. Public, but we pass the signed-in user (if any)
// so the shared header chrome matches every other page, plus any admin content overrides.
export default async function GuidePage() {
  const user = await getCurrentUser();
  const overrides = await (await getContentStore()).getOverrides();
  return (
    <SitePage user={user}>
      <UmrahRitualWizard user={user} overrides={overrides} />
    </SitePage>
  );
}
