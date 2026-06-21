import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { ProvidersConsole } from '../../../src/admin/ProvidersConsole';
import { listProvidersAction } from '../../../src/admin/connector-actions';

export default async function AdminProvidersPage() {
  const user = await requireRole(['ADMIN'], '/admin/providers');
  const initial = await listProvidersAction();
  return (
    <SitePage user={user}>
      <ProvidersConsole initial={initial} />
    </SitePage>
  );
}
