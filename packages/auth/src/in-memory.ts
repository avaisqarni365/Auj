import type { Session, User } from './domain';
import type { AuthStores } from './ports';

/** In-memory auth stores (no DB). Used by tests and the dev default. */
export function createInMemoryAuthStores(): AuthStores {
  const users = new Map<string, User>();
  const sessions = new Map<string, Session>();
  return {
    users: {
      async getById(id) {
        return users.get(id);
      },
      async getByEmail(email) {
        const lower = email.toLowerCase();
        return [...users.values()].find((u) => u.email === lower);
      },
      async save(u) {
        users.set(u.id, u);
        return u;
      },
      async list() {
        return [...users.values()];
      },
    },
    sessions: {
      async get(token) {
        return sessions.get(token);
      },
      async save(s) {
        sessions.set(s.token, s);
        return s;
      },
      async delete(token) {
        sessions.delete(token);
      },
    },
  };
}
