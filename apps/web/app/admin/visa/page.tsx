import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { VisaRouterDemo } from '../../../src/admin/VisaRouterDemo';

// Visa Router QA/demo — ADMIN only. The routing logic is the pure @auj/visa-router package.
export default async function AdminVisaPage() {
  const user = await requireRole(['ADMIN'], '/admin/visa');
  return (
    <SitePage user={user}>
      <VisaRouterDemo />
    </SitePage>
  );
}
