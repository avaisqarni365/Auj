// Day-planner engine (migration 08). Pure + unit-tested.
// Jamaat-anchored daily schedule per city, hourly temperature, ±15-min whole-day shift.
// Prayer/jamaat times are a static seasonal approximation — verify locally each day.
// (Assumption recorded in docs/assumptions.md.)
export type PlannerCity = 'makkah' | 'madinah';
export type SlotKind = 'prayer' | 'meal' | 'activity' | 'rest';

interface BaseSlot {
  h: number;
  m: number;
  title: string;
  note: string;
  type: SlotKind;
  tag: string;
}

const SCHEDULE: Record<PlannerCity, BaseSlot[]> = {
  makkah: [
    { h: 4, m: 15, title: 'Wake-up & Tahajjud', note: 'Wudu, witr and quiet dua', type: 'rest', tag: 'Wake' },
    { h: 5, m: 0, title: 'Fajr — jamaat at the Haram', note: 'Leave early for a place', type: 'prayer', tag: 'Jamaat' },
    { h: 6, m: 30, title: 'Breakfast at the hotel', note: 'Light meal, hydrate', type: 'meal', tag: 'Meal' },
    { h: 8, m: 0, title: 'Rest & Quran', note: 'Nap or recite', type: 'rest', tag: 'Rest' },
    { h: 10, m: 0, title: 'Umrah / Tawaf at the Haram', note: 'Cooler indoor areas', type: 'activity', tag: 'Ibadah' },
    { h: 12, m: 25, title: 'Dhuhr — jamaat', note: 'At Masjid al-Haram', type: 'prayer', tag: 'Jamaat' },
    { h: 13, m: 30, title: 'Lunch', note: 'Near the hotel', type: 'meal', tag: 'Meal' },
    { h: 15, m: 45, title: 'Asr — jamaat', note: 'At the Haram', type: 'prayer', tag: 'Jamaat' },
    { h: 16, m: 30, title: 'Ziyarat or shopping', note: 'Gifts, dates, Zamzam', type: 'activity', tag: 'Activity' },
    { h: 18, m: 55, title: 'Maghrib — jamaat', note: 'Break any fast with dates', type: 'prayer', tag: 'Jamaat' },
    { h: 19, m: 40, title: 'Dinner', note: 'Hotel or nearby', type: 'meal', tag: 'Meal' },
    { h: 20, m: 25, title: 'Isha — jamaat', note: 'At the Haram', type: 'prayer', tag: 'Jamaat' },
    { h: 21, m: 10, title: 'Taraweeh / extra Tawaf', note: 'Voluntary worship', type: 'activity', tag: 'Ibadah' },
    { h: 22, m: 45, title: 'Rest for the night', note: 'Sleep early for Fajr', type: 'rest', tag: 'Sleep' },
  ],
  madinah: [
    { h: 4, m: 10, title: 'Wake-up & Tahajjud', note: 'Wudu, witr and quiet dua', type: 'rest', tag: 'Wake' },
    { h: 4, m: 55, title: 'Fajr — jamaat at an-Nabawi', note: 'Leave early for the Rawdah queue', type: 'prayer', tag: 'Jamaat' },
    { h: 6, m: 25, title: 'Breakfast at the hotel', note: 'Light meal, hydrate', type: 'meal', tag: 'Meal' },
    { h: 8, m: 0, title: 'Rest & Quran', note: 'Nap or recite', type: 'rest', tag: 'Rest' },
    { h: 9, m: 30, title: 'Rawdah / Masjid an-Nabawi', note: 'Book a Rawdah slot via Nusuk', type: 'activity', tag: 'Ibadah' },
    { h: 12, m: 20, title: 'Dhuhr — jamaat', note: 'At Masjid an-Nabawi', type: 'prayer', tag: 'Jamaat' },
    { h: 13, m: 30, title: 'Lunch', note: 'Near the hotel', type: 'meal', tag: 'Meal' },
    { h: 15, m: 40, title: 'Asr — jamaat', note: 'At the mosque', type: 'prayer', tag: 'Jamaat' },
    { h: 16, m: 30, title: 'Ziyarat (Quba / Uhud)', note: 'Quba, Uhud, dates market', type: 'activity', tag: 'Activity' },
    { h: 18, m: 50, title: 'Maghrib — jamaat', note: 'Break any fast with dates', type: 'prayer', tag: 'Jamaat' },
    { h: 19, m: 35, title: 'Dinner', note: 'Hotel or nearby', type: 'meal', tag: 'Meal' },
    { h: 20, m: 20, title: 'Isha — jamaat', note: 'At the mosque', type: 'prayer', tag: 'Jamaat' },
    { h: 21, m: 5, title: 'Taraweeh / quiet worship', note: 'Voluntary worship', type: 'activity', tag: 'Ibadah' },
    { h: 22, m: 40, title: 'Rest for the night', note: 'Sleep early for Fajr', type: 'rest', tag: 'Sleep' },
  ],
};

// Typical hot-season hourly temperature for Makkah (°C); Madinah runs ~2° cooler.
const TEMP_MAKKAH: Record<number, number> = {
  0: 32, 1: 31, 2: 30, 3: 30, 4: 29, 5: 29, 6: 30, 7: 33, 8: 36, 9: 39, 10: 41, 11: 43,
  12: 44, 13: 45, 14: 45, 15: 44, 16: 43, 17: 41, 18: 38, 19: 36, 20: 35, 21: 34, 22: 33, 23: 32,
};

export const SHIFT_STEP = 15;
export const SHIFT_MAX = 180;

export function clampShift(min: number): number {
  const n = Math.round(min / SHIFT_STEP) * SHIFT_STEP;
  return Math.max(-SHIFT_MAX, Math.min(SHIFT_MAX, n));
}

function fmt(mins: number): string {
  const t = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${`0${h}`.slice(-2)}:${`0${m}`.slice(-2)}`;
}

export interface DaySlot {
  time: string;
  title: string;
  note: string;
  tag: string;
  type: SlotKind;
  temp: number;
}

export interface DayPlanView {
  city: PlannerCity;
  cityLabel: string;
  slots: DaySlot[];
  count: number;
  tempRange: { min: number; max: number };
  shiftLabel: string;
}

export function dayPlan(city: PlannerCity, shiftMin: number): DayPlanView {
  const shift = clampShift(shiftMin);
  const sched = SCHEDULE[city];
  const tOff = city === 'madinah' ? -2 : 0;
  const slots: DaySlot[] = sched.map((s) => ({
    time: fmt(s.h * 60 + s.m + shift),
    title: s.title,
    note: s.note,
    tag: s.tag,
    type: s.type,
    temp: Math.round((TEMP_MAKKAH[s.h] ?? 32) + tOff),
  }));
  const temps = slots.map((s) => s.temp);
  return {
    city,
    cityLabel: city === 'makkah' ? 'Makkah' : 'Madinah',
    slots,
    count: slots.length,
    tempRange: { min: Math.min(...temps), max: Math.max(...temps) },
    shiftLabel: shift === 0 ? 'On schedule' : shift > 0 ? `+${shift} min` : `${shift} min`,
  };
}
