// Client-safe types for the day-plan preference store (no pg import here).
import type { PlannerCity } from './planner';

export interface DayPlanPref {
  city: PlannerCity;
  shiftMin: number;
}

export interface DayPlanStore {
  get(userId: string): Promise<DayPlanPref | undefined>;
  save(userId: string, pref: DayPlanPref): Promise<void>;
}
