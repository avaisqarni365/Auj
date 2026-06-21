'use server';

import { getCurrentUser } from '../auth/session';
import { getPackingStore } from './packing-store';
import type { PackingProfile } from './packing';
import type { PackingState } from './packing-types';

export async function getPackingAction(profile: PackingProfile): Promise<PackingState | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return (await (await getPackingStore()).get(user.id, profile)) ?? null;
}

export async function savePackingAction(profile: PackingProfile, state: PackingState): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await (await getPackingStore()).save(user.id, profile, state);
}
