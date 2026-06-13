import type { Ticket } from './domain';

export interface TicketRepository {
  get(id: string): Promise<Ticket | undefined>;
  save(t: Ticket): Promise<Ticket>;
  list(): Promise<Ticket[]>;
  listByUser(userId: string): Promise<Ticket[]>;
}

export type Clock = () => string;
