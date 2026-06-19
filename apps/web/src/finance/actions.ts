'use server';

import { requireRole } from '../auth/session';
import { getFinanceStore, type ActivityEntry, type FinanceStatus, type SavedCalc } from './store';
import type { FinanceInputs } from './calc';

// Finance is admin/finance-only (profit is internal). Guards run server-side.
export async function saveCalculationAction(
  name: string,
  inputs: FinanceInputs,
  status: FinanceStatus,
  note: string,
): Promise<SavedCalc> {
  const user = await requireRole(['ADMIN'], '/admin/umrah-finance');
  return (await getFinanceStore()).save(name, inputs, { status, note: note.trim() || undefined, actor: user.displayName });
}

export async function listCalculationsAction(): Promise<SavedCalc[]> {
  await requireRole(['ADMIN'], '/admin/umrah-finance');
  return (await getFinanceStore()).list();
}

export async function listActivityAction(): Promise<ActivityEntry[]> {
  await requireRole(['ADMIN'], '/admin/umrah-finance');
  return (await getFinanceStore()).listActivity();
}
