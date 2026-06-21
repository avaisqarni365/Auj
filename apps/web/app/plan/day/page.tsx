import { getCurrentUser } from '../../../src/auth/session';
import { SitePage } from '../../../src/components/SitePage';
import { DayPlanner } from '../../../src/ritual/DayPlanner';
import { getDayPlanStore } from '../../../src/ritual/day-plan-store';

// Day planner — jamaat-anchored daily schedule with ±15-min shift + hourly temperature.
// Public + useful to anyone; the chosen city/shift persists to the account when signed in.
export default async function DayPlanPage() {
  const user = await getCurrentUser();
  const initialPref = user ? ((await (await getDayPlanStore()).get(user.id)) ?? null) : null;
  return (
    <SitePage user={user}>
      <DayPlanner signedIn={!!user} initialPref={initialPref} />
    </SitePage>
  );
}
