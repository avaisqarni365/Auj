'use server';

import { requireRole } from '../auth/session';
import { getFinanceStore } from './finance-store';
import { cleanFinanceLines, type FinanceLines } from './finance-data';

/** Admin — current Financial-Planner cost presets. */
export async function getLinesAction(): Promise<FinanceLines> {
  await requireRole(['ADMIN'], '/admin/budget');
  return (await getFinanceStore()).getLines();
}

/** Admin — replace both cost-line groups; returns the validated lines after save. */
export async function saveLinesAction(lines: FinanceLines): Promise<FinanceLines> {
  await requireRole(['ADMIN'], '/admin/budget');
  const next = cleanFinanceLines(lines);
  await (await getFinanceStore()).setLines(next);
  return next;
}
