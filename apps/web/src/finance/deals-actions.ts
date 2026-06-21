'use server';

import { requireRole } from '../auth/session';
import { getDealsStore } from './deals-store';
import type { Deal, DealInput } from './deals-types';

export async function listDealsAction(): Promise<Deal[]> {
  await requireRole(['ADMIN'], '/admin/finance');
  return (await getDealsStore()).list();
}

export async function saveDealAction(input: DealInput): Promise<Deal> {
  await requireRole(['ADMIN'], '/admin/finance');
  return (await getDealsStore()).save(input);
}

export async function deleteDealAction(id: string): Promise<void> {
  await requireRole(['ADMIN'], '/admin/finance');
  await (await getDealsStore()).remove(id);
}
