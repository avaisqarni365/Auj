'use server';

import { requireRole } from '../auth/session';
import { getFinanceStore, type SavedCalc } from './store';
import type { FinanceInputs } from './calc';

// Finance is admin/finance-only (profit is internal). Guards run server-side.
export async function saveCalculationAction(name: string, inputs: FinanceInputs): Promise<SavedCalc> {
  await requireRole(['ADMIN'], '/admin/umrah-finance');
  return (await getFinanceStore()).save(name, inputs);
}

export async function listCalculationsAction(): Promise<SavedCalc[]> {
  await requireRole(['ADMIN'], '/admin/umrah-finance');
  return (await getFinanceStore()).list();
}
