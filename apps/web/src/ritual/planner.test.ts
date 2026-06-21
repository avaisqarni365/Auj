import { describe, it, expect } from 'vitest';
import { clampShift, dayPlan, SHIFT_MAX } from './planner';

describe('day planner', () => {
  it('shifts every slot by the same amount', () => {
    const base = dayPlan('makkah', 0);
    const plus = dayPlan('makkah', 15);
    expect(base.slots[1].time).toBe('05:00'); // Fajr jamaat
    expect(plus.slots[1].time).toBe('05:15');
    expect(plus.slots[5].time).toBe('12:40'); // Dhuhr 12:25 + 15
  });

  it('negative shift wraps time-of-day correctly', () => {
    const minus = dayPlan('makkah', -30);
    expect(minus.slots[1].time).toBe('04:30');
  });

  it('city toggle changes the schedule and Madinah runs cooler', () => {
    const mk = dayPlan('makkah', 0);
    const md = dayPlan('madinah', 0);
    expect(mk.slots[1].title).toContain('Haram');
    expect(md.slots[1].title).toContain('Nabawi');
    expect(md.tempRange.max).toBe(mk.tempRange.max - 2);
  });

  it('temperature is attached per slot and within the hot-season range', () => {
    const mk = dayPlan('makkah', 0);
    expect(mk.slots.every((s) => s.temp >= 29 && s.temp <= 45)).toBe(true);
    expect(mk.count).toBe(14);
  });

  it('clampShift snaps to 15-min steps and bounds to ±180', () => {
    expect(clampShift(8)).toBe(15); // nearest 15
    expect(clampShift(7)).toBe(0);
    expect(clampShift(-8)).toBe(-15);
    expect(clampShift(999)).toBe(SHIFT_MAX);
    expect(clampShift(-999)).toBe(-SHIFT_MAX);
  });
});
