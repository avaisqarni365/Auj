import type { Money } from '@auj/contracts';
import type { Booking, PackageItem } from '@auj/core-booking';
import type { Agent, PaxRow } from './domain';
import type { Backend } from './ports';

export const MAX_PAX = 49;

export interface PaxValidation {
  ok: boolean;
  count: number;
  remaining: number;
  errors: string[];
}

export function validatePax(rows: PaxRow[]): PaxValidation {
  const errors: string[] = [];
  if (rows.length === 0) errors.push('At least one passenger is required');
  if (rows.length > MAX_PAX) errors.push(`Max ${MAX_PAX} passengers per booking (${rows.length} given)`);
  rows.forEach((r, i) => {
    if (!r.firstName || !r.lastName || !r.passportNumber || !r.nationality) {
      errors.push(`Row ${i + 1}: missing required fields`);
    }
  });
  return { ok: errors.length === 0, count: rows.length, remaining: Math.max(0, MAX_PAX - rows.length), errors };
}

/**
 * Book a whole group in one transaction and pay from the agent wallet. The wallet
 * hold enforces the credit limit, so an over-limit group never confirms.
 */
export async function bookGroupFromWallet(
  backend: Backend,
  input: { agent: Agent; rows: PaxRow[]; items: PackageItem[]; sell: Money },
): Promise<Booking> {
  const validation = validatePax(input.rows);
  if (!validation.ok) throw new Error(validation.errors.join('; '));
  if (input.agent.status !== 'APPROVED') throw new Error('Agent is not approved');

  const customer = await backend.booking.createCustomer({
    fullName: input.agent.agencyName,
    email: input.agent.email,
  });
  const pilgrims = await Promise.all(
    input.rows.map((r) => backend.booking.addPilgrim({ ...r, customerId: customer.id })),
  );

  const draft = await backend.booking.createBooking({
    customerId: customer.id,
    channel: 'PILGRIMAGE',
    pilgrimIds: pilgrims.map((p) => p.id),
    items: input.items,
  });

  await backend.booking.hold(draft.id);
  backend.wallet.hold(input.agent.id, input.sell, draft.id); // throws over credit limit -> blocks booking
  const confirmed = await backend.booking.confirm(draft.id, `wallet:${input.agent.id}`);
  backend.wallet.settle(input.agent.id, input.sell, draft.id);
  return confirmed;
}
