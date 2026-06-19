import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { FinanceCalculator } from '../../../src/finance/FinanceCalculator';
import { getFinanceStore } from '../../../src/finance/store';

// Admin Umrah Finance Calculator — ADMIN only (profit is internal). Manual-first costing.
export default async function UmrahFinancePage() {
  const user = await requireRole(['ADMIN'], '/admin/umrah-finance');
  const store = await getFinanceStore();
  const [saved, activity] = await Promise.all([store.list(), store.listActivity()]);
  return (
    <SitePage user={user}>
      <FinanceCalculator saved={saved} activity={activity} />
    </SitePage>
  );
}
