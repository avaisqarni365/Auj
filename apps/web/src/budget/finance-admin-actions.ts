'use server';

import { requireRole } from '../auth/session';
import { getFinanceStore } from './finance-store';
import type { FinanceLine, FinanceLines } from './FinancialPlanner';

const KINDS = ['nightly', 'perDay', 'fixed'] as const;
type Kind = (typeof KINDS)[number];

const MAX_CENTS = 100_000_00; // €100,000 cap per line
const isKind = (k: unknown): k is Kind => (KINDS as readonly string[]).includes(String(k));

const cents = (x: unknown): number => Math.max(0, Math.min(MAX_CENTS, Math.round(Number(x) || 0)));

const cleanLine = (l: Partial<FinanceLine>): FinanceLine => ({
  label: String(l.label ?? '').slice(0, 80),
  note: String(l.note ?? '').slice(0, 120),
  kind: isKind(l.kind) ? l.kind : 'fixed',
  cents: cents(l.cents),
});

const cleanGroup = (g: unknown): FinanceLine[] =>
  (Array.isArray(g) ? g : []).slice(0, 20).map((l) => cleanLine(l as Partial<FinanceLine>));

const clean = (lines: FinanceLines): FinanceLines => ({
  package: cleanGroup(lines?.package),
  private: cleanGroup(lines?.private),
});

/** Admin — current Financial-Planner cost presets. */
export async function getLinesAction(): Promise<FinanceLines> {
  await requireRole(['ADMIN'], '/admin/budget');
  return (await getFinanceStore()).getLines();
}

/** Admin — replace both cost-line groups; returns the validated lines after save. */
export async function saveLinesAction(lines: FinanceLines): Promise<FinanceLines> {
  await requireRole(['ADMIN'], '/admin/budget');
  const next = clean(lines);
  await (await getFinanceStore()).setLines(next);
  return next;
}
