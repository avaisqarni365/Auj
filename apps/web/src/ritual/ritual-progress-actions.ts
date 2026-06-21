'use server';

import { getCurrentUser } from '../auth/session';
import { getProgressStore } from './ritual-progress-store';
import type { RitualProgress } from './ritual-progress-types';

export async function getProgressAction(): Promise<RitualProgress | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return (await (await getProgressStore()).get(user.id)) ?? null;
}

/** Saves only for signed-in users (always-DB, per-pilgrim); silent no-op otherwise. */
export async function saveProgressAction(p: RitualProgress): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await (await getProgressStore()).save(user.id, p);
}
