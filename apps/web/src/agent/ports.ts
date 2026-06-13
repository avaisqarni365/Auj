import type { HotelOffer, Money, SearchCriteria } from '@auj/contracts';
import type { Booking, CrmPilgrim, Customer, PackageItem } from '@auj/core-booking';
import type { JournalEntry } from '@auj/payments';
import type { Agent, AgentTier } from './domain';

export interface AgentApi {
  register(input: { agencyName: string; email: string; tier?: AgentTier; parentAgentId?: string }): Promise<Agent>;
  approve(agentId: string): Promise<Agent>;
  get(agentId: string): Promise<Agent | undefined>;
  list(): Promise<Agent[]>;
}

export interface BookingApi {
  searchHotels(c: SearchCriteria): Promise<HotelOffer[]>;
  createCustomer(input: { fullName: string; email: string }): Promise<Customer>;
  addPilgrim(input: Omit<CrmPilgrim, 'id'>): Promise<CrmPilgrim>;
  createBooking(input: {
    customerId: string;
    channel: 'PILGRIMAGE' | 'TRAVEL';
    pilgrimIds: string[];
    items: PackageItem[];
  }): Promise<Booking>;
  hold(bookingId: string): Promise<Booking>;
  confirm(bookingId: string, paymentRef: string): Promise<Booking>;
  getBooking(bookingId: string): Promise<Booking | undefined>;
}

/** Agent wallet on the payments ledger. hold() throws over the credit limit. */
export interface WalletApi {
  open(agentId: string, currency: Money['currency'], creditLimit: number): void;
  balance(agentId: string): number;
  available(agentId: string): number;
  held(agentId: string): number;
  topUp(agentId: string, amount: Money, ref: string): void;
  hold(agentId: string, amount: Money, ref: string): void;
  settle(agentId: string, amount: Money, ref: string): void;
  entries(): JournalEntry[];
}

export interface Backend {
  agents: AgentApi;
  booking: BookingApi;
  wallet: WalletApi;
}
