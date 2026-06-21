// Client-safe types for the finance deal book (no pg import). Store lives in deals-store.ts.
import type { Channel } from './calc';

export interface DealLine {
  id: string;
  label: string;
  cents: number;
}

export interface Deal {
  id: string;
  name: string;
  channel: Channel;
  pax: number;
  bufferPct: number;
  markupPct: number;
  feePct: number;
  commissionPct: number;
  costs: DealLine[];
  createdAt: string;
  updatedAt: string;
}

export type DealInput = Omit<Deal, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

/** IND (single) vs GRP, derived from pax. */
export const dealKind = (pax: number): 'IND' | 'GRP' => (pax > 1 ? 'GRP' : 'IND');

export interface DealsStore {
  list(): Promise<Deal[]>;
  save(input: DealInput): Promise<Deal>;
  remove(id: string): Promise<void>;
}
