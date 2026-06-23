import { describe, it, expect } from 'vitest';
import { FINANCE_SEED, budgetTotals, cleanFinanceLines, lineAmount, noteText, sumLines, type FinanceLines } from './finance-data';

describe('financial planner math', () => {
  it('fixed lines are flat; nightly/perDay scale with days', () => {
    expect(lineAmount({ label: 'x', note: '', kind: 'fixed', cents: 48_000 }, 15)).toBe(48_000);
    expect(lineAmount({ label: 'x', note: '', kind: 'nightly', cents: 11_000 }, 15)).toBe(165_000);
    expect(lineAmount({ label: 'x', note: '', kind: 'perDay', cents: 1_800 }, 10)).toBe(18_000);
  });

  it('budgetTotals: grand = package + private, and 15 days costs more than 10', () => {
    const t10 = budgetTotals(FINANCE_SEED, 10);
    const t15 = budgetTotals(FINANCE_SEED, 15);
    expect(t10.grandCents).toBe(t10.packageCents + t10.privateCents);
    expect(t15.grandCents).toBeGreaterThan(t10.grandCents); // more nights/days
    expect(sumLines(FINANCE_SEED.package, 10)).toBe(t10.packageCents);
  });

  it('noteText fills the {days} placeholder, leaves static notes alone', () => {
    expect(noteText('{days} nights · twin-share', 12)).toBe('12 nights · twin-share');
    expect(noteText('From your EU city', 12)).toBe('From your EU city');
  });

  it('cleanFinanceLines clamps cents, coerces kind, caps groups, tolerates junk', () => {
    const dirty = {
      package: [{ label: 'A', note: 'n', kind: 'weird', cents: 999_999_999 }],
      private: Array.from({ length: 40 }, () => ({ label: 'L', note: 'n', kind: 'perDay', cents: -5 })),
    } as unknown as FinanceLines;
    const out = cleanFinanceLines(dirty);
    expect(out.package[0]!.kind).toBe('fixed'); // bad kind → fixed
    expect(out.package[0]!.cents).toBe(100_000_00); // clamped to €100k
    expect(out.private.length).toBe(20); // group capped
    expect(out.private[0]!.cents).toBe(0); // negatives floored
    expect(cleanFinanceLines(undefined)).toEqual({ package: [], private: [] });
  });
});
