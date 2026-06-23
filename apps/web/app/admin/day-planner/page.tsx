import { requireRole } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { DayPlanAdmin } from '../../../src/admin/DayPlanAdmin';
import { getDayPlanTemplateStore } from '../../../src/ritual/day-plan-template-store';

// Admin — full CRUD over the shared default Day Planner template (slots per city).
export default async function DayPlanAdminPage() {
  const user = await requireRole(['ADMIN'], '/admin/day-planner');
  const template = await (await getDayPlanTemplateStore()).getTemplate();
  return (
    <SitePage user={user}>
      <DayPlanAdmin initial={template} />
    </SitePage>
  );
}
