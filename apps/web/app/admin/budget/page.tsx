import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { FinanceLinesAdmin } from '../../../src/admin/FinanceLinesAdmin';
import { getFinanceStore } from '../../../src/budget/finance-store';

// Admin — full CRUD over the Financial-Planner cost presets (Package + Private line groups).
export default async function BudgetAdminPage() {
  const user = await requireRole(['ADMIN'], '/admin/budget');
  const lines = await (await getFinanceStore()).getLines();
  return (
    <SitePage user={user}>
      <FinanceLinesAdmin initial={lines} />
    </SitePage>
  );
}
