import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { UmrahContentAdmin } from '../../../src/ritual/UmrahContentAdmin';
import { getContentStore } from '../../../src/ritual/content-store';

// Admin: live Umrah Guide content editor + translation coverage (brief /admin/umrah-content). ADMIN only.
export default async function UmrahContentPage() {
  const user = await requireRole(['ADMIN'], '/admin/umrah-content');
  const overrides = await (await getContentStore()).getOverrides();
  return (
    <SitePage user={user}>
      <UmrahContentAdmin overrides={overrides} />
    </SitePage>
  );
}
