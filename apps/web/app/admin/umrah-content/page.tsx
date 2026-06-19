import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { UmrahContentAdmin } from '../../../src/ritual/UmrahContentAdmin';

// Admin: Umrah Guide content + translation coverage (brief /admin/umrah-content). ADMIN only.
export default async function UmrahContentPage() {
  const user = await requireRole(['ADMIN'], '/admin/umrah-content');
  return (
    <SitePage user={user}>
      <UmrahContentAdmin />
    </SitePage>
  );
}
