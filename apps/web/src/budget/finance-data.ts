// Pure, dependency-free data + math for the Financial Planner — shared by the client component,
// the pg-backed store, the admin actions and tests. No React, no pg (so a server module can import
// it without pulling in a 'use client' component).

// Serializable cost line: `note` is a template string that may contain the placeholder `{days}`
// (only the hotel line needs it). All other notes are static text.
export type FinanceLine = { label: string; note: string; kind: 'nightly' | 'perDay' | 'fixed'; cents: number };
export type FinanceLines = { package: FinanceLine[]; private: FinanceLine[] };

export const noteText = (note: string, days: number): string => note.replace('{days}', String(days));

const PACKAGE: FinanceLine[] = [
  { label: 'Hotel near the Haram', note: '{days} nights · twin-share', kind: 'nightly', cents: 11_000 },
  { label: 'Flights (return)', note: 'From your EU city', kind: 'fixed', cents: 48_000 },
  { label: 'Ground transfers & ziyarat', note: 'Airport, Haram, sites', kind: 'fixed', cents: 18_000 },
  { label: 'Visa & services', note: 'e-Visa, SIM, Ihram kit', kind: 'fixed', cents: 15_000 },
];

const PRIVATE: FinanceLine[] = [
  { label: 'Food & dining', note: '~€18 / day', kind: 'perDay', cents: 1_800 },
  { label: 'Local transport', note: 'Taxis, ride-hailing ~€6 / day', kind: 'perDay', cents: 600 },
  { label: 'Laundry', note: 'Wash & iron for the trip', kind: 'fixed', cents: 2_500 },
  { label: 'Clothes & ihram', note: 'Ihram, abaya, basics', kind: 'fixed', cents: 6_000 },
  { label: 'Gifts, dates & Zamzam', note: 'To carry home', kind: 'fixed', cents: 9_000 },
  { label: 'SIM & data', note: 'Local number + bundle', kind: 'fixed', cents: 2_000 },
];

export const FINANCE_SEED: FinanceLines = { package: PACKAGE, private: PRIVATE };

/** A line's cost for a trip of `days`: fixed lines are flat; nightly/perDay scale with the days. */
export const lineAmount = (l: FinanceLine, days: number): number => (l.kind === 'fixed' ? l.cents : l.cents * days);
export const sumLines = (ls: FinanceLine[], days: number): number => ls.reduce((a, l) => a + lineAmount(l, days), 0);

/** Per-pilgrim totals (EUR minor units) for a given trip length. */
export function budgetTotals(lines: FinanceLines, days: number): { packageCents: number; privateCents: number; grandCents: number } {
  const packageCents = sumLines(lines.package, days);
  const privateCents = sumLines(lines.private, days);
  return { packageCents, privateCents, grandCents: packageCents + privateCents };
}

// ---- admin-input sanitizer (used by finance-admin-actions; exported for tests) ----
const KINDS = ['nightly', 'perDay', 'fixed'] as const;
const isKind = (k: unknown): k is FinanceLine['kind'] => (KINDS as readonly string[]).includes(String(k));
const MAX_CENTS = 100_000_00; // €100,000 cap per line
const capCents = (x: unknown): number => Math.max(0, Math.min(MAX_CENTS, Math.round(Number(x) || 0)));

const cleanLine = (l: Partial<FinanceLine>): FinanceLine => ({
  label: String(l.label ?? '').slice(0, 80),
  note: String(l.note ?? '').slice(0, 120),
  kind: isKind(l.kind) ? l.kind : 'fixed',
  cents: capCents(l.cents),
});
const cleanGroup = (g: unknown): FinanceLine[] => (Array.isArray(g) ? g : []).slice(0, 20).map((l) => cleanLine(l as Partial<FinanceLine>));

/** Validate admin-supplied cost lines: coerce kind, clamp cents, cap group size, slice strings. */
export function cleanFinanceLines(lines: Partial<FinanceLines> | undefined): FinanceLines {
  return { package: cleanGroup(lines?.package), private: cleanGroup(lines?.private) };
}
