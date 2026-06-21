'use server';

import { getCurrentUser } from '../auth/session';
import { getDayPlanStore } from './day-plan-store';
import { clampShift, type PlannerCity } from './planner';
import type { DayPlanPref } from './day-plan-types';

export async function getDayPlanAction(): Promise<DayPlanPref | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return (await (await getDayPlanStore()).get(user.id)) ?? null;
}

export async function saveDayPlanAction(city: PlannerCity, shiftMin: number): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await (await getDayPlanStore()).save(user.id, { city, shiftMin: clampShift(shiftMin) });
}
