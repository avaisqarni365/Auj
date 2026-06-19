import { getCurrentUser } from '../../src/auth/session';
import { SitePage } from '../../src/components/SitePage';
import { UmrahRitualWizard } from '../../src/ritual/UmrahRitualWizard';

// Umrah Guide — free, no-login ritual walkthrough. Public, but we pass the signed-in user (if any)
// so the shared header chrome matches every other page.
export default async function GuidePage() {
  const user = await getCurrentUser();
  return (
    <SitePage user={user}>
      <UmrahRitualWizard user={user} />
    </SitePage>
  );
}
