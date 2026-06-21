import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { SuppliersConsole } from '../../../src/admin/SuppliersConsole';

export default async function AdminSuppliersPage() {
  const user = await requireRole(['ADMIN'], '/admin/suppliers');
  return (
    <SitePage user={user}>
      <SuppliersConsole />
    </SitePage>
  );
}
