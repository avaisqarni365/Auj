import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { PackingAdmin } from '../../../src/admin/PackingAdmin';
import { getPackingTemplateStore } from '../../../src/companion/packing-template-store';

// Admin — full CRUD over the shared default Packing Organizer template (sections + items).
export default async function PackingAdminPage() {
  const user = await requireRole(['ADMIN'], '/admin/packing');
  const template = await (await getPackingTemplateStore()).getTemplate();
  return (
    <SitePage user={user}>
      <PackingAdmin initial={template} />
    </SitePage>
  );
}
