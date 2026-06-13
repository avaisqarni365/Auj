import type { Ticket } from './domain';
import type { TicketRepository } from './ports';

/** In-memory ticket store (no DB). Used by tests and the dev default. */
export function createInMemoryTicketRepository(): TicketRepository {
  const tickets = new Map<string, Ticket>();
  return {
    async get(id) {
      return tickets.get(id);
    },
    async save(t) {
      tickets.set(t.id, t);
      return t;
    },
    async list() {
      return [...tickets.values()].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    },
    async listByUser(userId) {
      return [...tickets.values()].filter((t) => t.userId === userId).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    },
  };
}
