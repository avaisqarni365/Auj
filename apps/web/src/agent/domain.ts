import type { Money } from '@auj/contracts';
import type { ItemKind } from '@auj/core-booking';

export type AgentTier = 'BRONZE' | 'SILVER' | 'GOLD';
export type AgentStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';

export interface Agent {
  id: string;
  agencyName: string;
  email: string;
  tier: AgentTier;
  status: AgentStatus;
  parentAgentId?: string; // agent -> sub-agent hierarchy
  createdAt: string;
}

export type MarkupKind = 'PERCENT' | 'FIXED';

export interface MarkupRule {
  id: string;
  tier?: AgentTier; // undefined = applies to any tier
  productKind?: ItemKind; // undefined = applies to any product
  kind: MarkupKind;
  value: number; // PERCENT: whole-number percent; FIXED: minor units
  enabled: boolean;
}

export interface PaxRow {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dob: string;
  gender: 'M' | 'F';
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'CONVERTED' | 'EXPIRED';

export interface QuoteLine {
  label: string;
  net: Money;
}

export interface Quotation {
  id: string;
  agentId: string;
  lines: QuoteLine[];
  netTotal: Money;
  markup: Money;
  sell: Money;
  status: QuoteStatus;
  validUntil: string;
  createdAt: string;
}

export interface StatementRow {
  date: string;
  ref: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface Statement {
  account: string;
  currency: Money['currency'];
  opening: number;
  debits: number;
  credits: number;
  closing: number;
  rows: StatementRow[];
}
