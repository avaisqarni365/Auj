'use server';

// Server Actions for the agent portal. Durable, agency-scoped state lives in Postgres
// (agent-db.ts; in-memory fallback in dev) — the agency, wallet, double-entry ledger and
// quotes all persist and are scoped to the logged-in agent. The booking transaction itself
// runs through core-booking via the in-process backend.
import type { SearchCriteria } from '@auj/contracts';
import type { Booking } from '@auj/core-booking';
import type { JournalEntry } from '@auj/payments';
import { createInProcessBackend } from './backend/in-process';
import { validatePax } from './multipax';
import { buildStatement, statementToCSV } from './statements';
import { getAgentDb, toJournalEntries, type QuoteRecord } from './agent-db';
import { MarkupEngine } from './markup';
import { uuidv7 } from './ids';
import type { Agent, AgentTier, MarkupRule, PaxRow, QuoteLine } from './domain';
import type { Backend } from './ports';
import { getCurrentUser } from '../auth/session';

let backend: Backend | undefined;
function getBackend(): Backend {
  backend ??= createInProcessBackend();
  return backend;
}

const CRITERIA: SearchCriteria = { city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 1 };
const PER_PAX_EUR = 100_000; // €1,000 client price per pilgrim

async function requireAgency(): Promise<{ id: string; name: string; email: string; tier: Agent['tier'] }> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not signed in');
  const db = await getAgentDb();
  const agency = await db.loadOrCreateAgency(user.id, user.displayName || 'Agency', user.email || 'agent@auj.example', 'GOLD');
  return { id: agency.id, name: agency.name, email: agency.email, tier: agency.tier };
}

function agencyToAgent(a: { id: string; name: string; email: string; tier: Agent['tier'] }): Agent {
  return { id: a.id, agencyName: a.name, email: a.email, tier: a.tier, status: 'APPROVED', createdAt: new Date().toISOString() };
}

/** Onboard the logged-in agent: load-or-create their durable agency + wallet, return current state. */
export async function setupAgentAction(): Promise<{ agent: Agent; balance: number; creditLimit: number; entries: JournalEntry[] }> {
  const agency = await requireAgency();
  const db = await getAgentDb();
  const w = await db.wallet(agency.id);
  const legs = await db.ledger(agency.id);
  return { agent: agencyToAgent(agency), balance: w.balanceMinor, creditLimit: w.creditLimitMinor, entries: toJournalEntries(agency.id, legs, w.currency) };
}

/** Book a group of `paxCount` pilgrims in one transaction, paid from the durable wallet. */
export async function bookGroupAction(input: {
  paxCount: number;
}): Promise<{ booking: Booking; balance: number; entries: JournalEntry[] }> {
  const agency = await requireAgency();
  const db = await getAgentDb();
  const w = await db.wallet(agency.id);

  const rows: PaxRow[] = Array.from({ length: input.paxCount }, (_, i) => ({
    firstName: `Pax${i + 1}`, lastName: 'Group', passportNumber: `PK${i + 1}`, nationality: 'PK', dob: '1990-01-01', gender: 'M',
  }));
  const validation = validatePax(rows);
  if (!validation.ok) throw new Error(validation.errors.join('; '));

  const sellMinor = input.paxCount * PER_PAX_EUR;
  const available = w.balanceMinor + w.creditLimitMinor;
  if (sellMinor > available) throw new Error('Over credit limit — top up the wallet before booking this group.');

  const b = getBackend();
  const hotels = await b.booking.searchHotels(CRITERIA);
  const top = hotels[0];
  if (!top) throw new Error('No hotels available');
  const items = [{ kind: 'HOTEL' as const, offerId: top.id, title: top.name, net: top.nightlyNet }];

  const customer = await b.booking.createCustomer({ fullName: agency.name, email: agency.email });
  const pilgrims = await Promise.all(rows.map((r) => b.booking.addPilgrim({ ...r, customerId: customer.id })));
  const draft = await b.booking.createBooking({ customerId: customer.id, channel: 'PILGRIMAGE', pilgrimIds: pilgrims.map((p) => p.id), items });
  await b.booking.hold(draft.id);
  const booking = await b.booking.confirm(draft.id, `wallet:${agency.id}`);

  const snapshot = await db.append(agency.id, {
    ref: booking.bookingRef ?? booking.id,
    kind: 'BOOKING',
    memo: `${input.paxCount} pax · ${top.name}`,
    debitMinor: sellMinor,
    creditMinor: 0,
  });
  const legs = await db.ledger(agency.id);
  return { booking, balance: snapshot.balanceMinor, entries: toJournalEntries(agency.id, legs, w.currency) };
}

/** Build + persist a shareable quote, scoped to the agency. markupPct is whole-number percent. */
export async function saveQuoteAction(input: { lines: QuoteLine[]; markupPct: number }): Promise<QuoteRecord> {
  const agency = await requireAgency();
  const db = await getAgentDb();
  const lines = input.lines.filter((l) => l.label.trim() && l.net.amount > 0);
  const netMinor = lines.reduce((s, l) => s + l.net.amount, 0);
  const pct = Math.max(0, Math.min(100, Math.trunc(input.markupPct) || 0));
  const markupMinor = Math.round((netMinor * pct) / 100);
  return db.saveQuote(agency.id, { lines, netMinor, markupMinor, sellMinor: netMinor + markupMinor, currency: 'EUR' });
}

export async function listQuotesAction(): Promise<QuoteRecord[]> {
  const agency = await requireAgency();
  return (await getAgentDb()).listQuotes(agency.id);
}

export async function convertQuoteAction(id: string): Promise<void> {
  const agency = await requireAgency();
  await (await getAgentDb()).convertQuote(agency.id, id);
}

// ---- Markups (per-agency, persisted) ----------------------------------------------------
export interface MarkupInput {
  id?: string;
  tier?: AgentTier;
  productKind?: MarkupRule['productKind'];
  kind: MarkupRule['kind'];
  value: number;
  enabled: boolean;
}

export async function listMarkupsAction(): Promise<MarkupRule[]> {
  const agency = await requireAgency();
  return (await getAgentDb()).listMarkups(agency.id);
}

export async function saveMarkupAction(input: MarkupInput): Promise<MarkupRule> {
  const agency = await requireAgency();
  const rule: MarkupRule = {
    id: input.id || uuidv7(),
    ...(input.tier ? { tier: input.tier } : {}),
    ...(input.productKind ? { productKind: input.productKind } : {}),
    kind: input.kind === 'FIXED' ? 'FIXED' : 'PERCENT',
    value: Math.max(0, Math.round(input.value) || 0),
    enabled: input.enabled,
  };
  await (await getAgentDb()).saveMarkup(agency.id, rule);
  return rule;
}

export async function toggleMarkupAction(id: string, enabled: boolean): Promise<void> {
  const agency = await requireAgency();
  const db = await getAgentDb();
  const rule = (await db.listMarkups(agency.id)).find((r) => r.id === id);
  if (rule) await db.saveMarkup(agency.id, { ...rule, enabled });
}

export async function deleteMarkupAction(id: string): Promise<void> {
  const agency = await requireAgency();
  await (await getAgentDb()).deleteMarkup(agency.id, id);
}

export interface TierPreview {
  tier: AgentTier;
  netMinor: number;
  markupMinor: number;
  sellMinor: number;
}

/** Net→sell preview per tier for a representative hotel net, via the tested MarkupEngine. */
export async function markupPreviewAction(netMinor: number): Promise<TierPreview[]> {
  const agency = await requireAgency();
  const rules = await (await getAgentDb()).listMarkups(agency.id);
  const engine = new MarkupEngine(rules);
  const net = { amount: Math.max(0, Math.round(netMinor) || 0), currency: 'EUR' as const };
  return (['BRONZE', 'SILVER', 'GOLD'] as AgentTier[]).map((tier) => {
    const r = engine.price(net, { tier, kind: 'HOTEL' });
    return { tier, netMinor: net.amount, markupMinor: r.markup.amount, sellMinor: r.sell.amount };
  });
}

/** Per-agency statement as CSV, reconstructed from (and reconciling) the double-entry ledger. */
export async function statementCsvAction(): Promise<string> {
  const agency = await requireAgency();
  const db = await getAgentDb();
  const w = await db.wallet(agency.id);
  const legs = await db.ledger(agency.id);
  const entries = toJournalEntries(agency.id, legs, w.currency);
  return statementToCSV(buildStatement(entries, `wallet:${agency.id}`, w.currency));
}
