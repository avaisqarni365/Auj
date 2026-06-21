'use server';

import { getCurrentUser } from '../auth/session';
import { getDuasStore } from './personal-duas-store';
import type { DuaInput, PersonalDua } from './personal-duas-types';

// Browse the guide open; saving du'as requires sign-in (always-DB, per-pilgrim).
export async function listMyDuasAction(stepKey?: string): Promise<PersonalDua[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return (await getDuasStore()).list(user.id, stepKey);
}

export async function saveMyDuaAction(input: DuaInput): Promise<PersonalDua | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Please sign in to save your du‘a.');
  return (await getDuasStore()).save(user.id, input);
}

export async function deleteMyDuaAction(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Please sign in.');
  await (await getDuasStore()).remove(user.id, id);
}

export async function togglePinDuaAction(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Please sign in.');
  await (await getDuasStore()).togglePin(user.id, id);
}
