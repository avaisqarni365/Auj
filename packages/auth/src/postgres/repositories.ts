import type pg from 'pg';
import type { Role, Session, User } from '../domain';
import type { AuthStores, SessionRepository, UserRepository } from '../ports';

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  role: string;
  password_hash: string;
  agent_status: string | null;
  parent_agent_id: string | null;
  created_at: string;
}

function rowToUser(r: UserRow): User {
  return {
    id: r.id,
    email: r.email,
    displayName: r.display_name,
    role: r.role as Role,
    passwordHash: r.password_hash,
    createdAt: r.created_at,
    ...(r.agent_status != null ? { agentStatus: r.agent_status as User['agentStatus'] } : {}),
    ...(r.parent_agent_id != null ? { parentAgentId: r.parent_agent_id } : {}),
  };
}

class PgUserRepository implements UserRepository {
  constructor(private readonly pool: pg.Pool) {}
  async getById(id: string): Promise<User | undefined> {
    const { rows } = await this.pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ? rowToUser(rows[0]) : undefined;
  }
  async getByEmail(email: string): Promise<User | undefined> {
    const { rows } = await this.pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    return rows[0] ? rowToUser(rows[0]) : undefined;
  }
  async save(u: User): Promise<User> {
    await this.pool.query(
      `INSERT INTO users (id, email, display_name, role, password_hash, agent_status, parent_agent_id, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET email=$2, display_name=$3, role=$4, password_hash=$5, agent_status=$6, parent_agent_id=$7`,
      [u.id, u.email, u.displayName, u.role, u.passwordHash, u.agentStatus ?? null, u.parentAgentId ?? null, u.createdAt],
    );
    return u;
  }
  async list(): Promise<User[]> {
    const { rows } = await this.pool.query<UserRow>('SELECT * FROM users ORDER BY created_at');
    return rows.map(rowToUser);
  }
}

interface SessionRow {
  token: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

class PgSessionRepository implements SessionRepository {
  constructor(private readonly pool: pg.Pool) {}
  async get(token: string): Promise<Session | undefined> {
    const { rows } = await this.pool.query<SessionRow>('SELECT * FROM sessions WHERE token = $1', [token]);
    const r = rows[0];
    return r ? { token: r.token, userId: r.user_id, createdAt: r.created_at, expiresAt: r.expires_at } : undefined;
  }
  async save(s: Session): Promise<Session> {
    await this.pool.query(
      `INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES ($1,$2,$3,$4)
       ON CONFLICT (token) DO UPDATE SET expires_at=$4`,
      [s.token, s.userId, s.createdAt, s.expiresAt],
    );
    return s;
  }
  async delete(token: string): Promise<void> {
    await this.pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  }
}

/** Postgres-backed auth stores — a drop-in for new AuthService({ ...stores }). */
export function createPostgresAuthStores(pool: pg.Pool): AuthStores {
  return { users: new PgUserRepository(pool), sessions: new PgSessionRepository(pool) };
}
