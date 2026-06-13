'use server';

// Server Actions for the agent portal. The backend runs server-side (node:crypto +
// in-memory ledger/agents). The portal's agent record is personalised from the
// logged-in user; wallet + booking state persist in a dev singleton.
import type { SearchCriteria } from '@auj/contracts';
import type { Booking } from '@auj/core-booking';
import type { JournalEntry } from '@auj/payments';
import { createInProcessBackend } from './backend/in-process';
import { bookGroupFromWallet } from './multipax';
import type { Agent, PaxRow } from './domain';
import type { Backend } from './ports';
import { getCurrentUser } from '../auth/session';

let backend: Backend | undefined;
function getBackend(): Backend {
  backend ??= createInProcessBackend();
  return backend;
}

const CRITERIA: SearchCriteria = { city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 1 };
const PER_PAX_EUR = 100_000; // €1,000 client price per pilgrim

/** Onboard the logged-in agent: register + approve and fund the wallet (idempotent per session). */
export async function setupAgentAction(): Promise<{ agent: Agent; balance: number }> {
  const b = getBackend();
  const user = await getCurrentUser();
  const reg = await b.agents.register({
    agencyName: user?.displayName ?? 'Agency',
    email: user?.email ?? 'agent@auj.example',
    tier: 'GOLD',
  });
  const agent = await b.agents.approve(reg.id);
  b.wallet.open(agent.id, 'EUR', 0);
  b.wallet.topUp(agent.id, { amount: 6_000_000, currency: 'EUR' }, 'demo-topup');
  return { agent, balance: b.wallet.balance(agent.id) };
}

/** Book a group of `paxCount` pilgrims in one transaction, paid from the wallet. */
export async function bookGroupAction(input: {
  agentId: string;
  paxCount: number;
}): Promise<{ booking: Booking; balance: number; entries: JournalEntry[] }> {
  const b = getBackend();
  const agent = await b.agents.get(input.agentId);
  if (!agent) throw new Error('Unknown agent');

  const hotels = await b.booking.searchHotels(CRITERIA);
  const top = hotels[0];
  if (!top) throw new Error('No hotels available');

  const items = [{ kind: 'HOTEL' as const, offerId: top.id, title: top.name, net: top.nightlyNet }];
  const rows: PaxRow[] = Array.from({ length: input.paxCount }, (_, i) => ({
    firstName: `Pax${i + 1}`, lastName: 'Group', passportNumber: `PK${i + 1}`, nationality: 'PK', dob: '1990-01-01', gender: 'M',
  }));
  const sell = { amount: input.paxCount * PER_PAX_EUR, currency: 'EUR' as const };

  const booking = await bookGroupFromWallet(b, { agent, rows, items, sell });
  return { booking, balance: b.wallet.balance(agent.id), entries: b.wallet.entries() };
}
