'use server';

import type { PublicUser } from '@auj/auth';
import { getAuth } from './backend';
import { getCurrentUser } from './session';

async function assertAdmin(): Promise<void> {
  const me = await getCurrentUser();
  if (me?.role !== 'ADMIN') throw new Error('Forbidden');
}

/** All agent accounts (ADMIN only), for the approvals panel. */
export async function listAgentsAction(): Promise<PublicUser[]> {
  await assertAdmin();
  const users = await (await getAuth()).listUsers();
  return users.filter((u) => u.role === 'AGENT' || u.role === 'SUB_AGENT');
}

/** Approve a pending agent (ADMIN only). Returns the refreshed agent list. */
export async function approveAgentAction(userId: string): Promise<PublicUser[]> {
  await assertAdmin();
  await (await getAuth()).approveAgent(userId);
  return listAgentsAction();
}
