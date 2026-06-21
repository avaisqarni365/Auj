import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { SaudiConnectorConsole } from '../../../src/admin/SaudiConnectorConsole';

export default async function AdminConnectorPage() {
  const user = await requireRole(['ADMIN'], '/admin/connector');
  return (
    <SitePage user={user}>
      <SaudiConnectorConsole />
    </SitePage>
  );
}
