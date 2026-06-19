// Client-safe finance types + constants (no Postgres/node imports), so client components can use
// them without pulling `pg` into the browser bundle. The store implementation lives in store.ts.
import type { FinanceInputs } from './calc';

export type FinanceStatus = 'draft' | 'confirmed' | 'invoiced' | 'paid' | 'cancelled';
export const FINANCE_STATUSES: FinanceStatus[] = ['draft', 'confirmed', 'invoiced', 'paid', 'cancelled'];

export interface SavedCalc {
  id: string;
  ref: string;
  name: string;
  currency: string;
  travellers: number;
  status: FinanceStatus;
  note?: string;
  sellingPriceCents: number;
  profitCents: number;
  createdAt: string;
  inputs: FinanceInputs;
}

export interface ActivityEntry {
  id: string;
  ref: string;
  at: string;
  actor: string;
  action: string;
  status: FinanceStatus;
  note?: string;
}

export interface SaveOpts {
  status: FinanceStatus;
  note?: string;
  actor: string;
}

export interface FinanceStore {
  save(name: string, inputs: FinanceInputs, opts: SaveOpts): Promise<SavedCalc>;
  list(): Promise<SavedCalc[]>;
  listActivity(): Promise<ActivityEntry[]>;
}
