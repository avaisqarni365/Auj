import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { ComplianceConsole } from '../../../src/admin/ComplianceConsole';
import { listComplianceAction } from '../../../src/admin/compliance-actions';

// EU compliance ops — ADMIN only. Reuses @auj/compliance logic; records persist in Postgres.
export default async function AdminCompliancePage() {
  const user = await requireRole(['ADMIN'], '/admin/compliance');
  const initial = await listComplianceAction();
  return (
    <SitePage user={user}>
      <ComplianceConsole initial={initial} />
    </SitePage>
  );
}
