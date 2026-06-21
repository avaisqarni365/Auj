import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { NusukConsole } from '../../../src/admin/NusukConsole';

export default async function AdminNusukPage() {
  const user = await requireRole(['ADMIN'], '/admin/nusuk');
  return (
    <SitePage user={user}>
      <NusukConsole />
    </SitePage>
  );
}
