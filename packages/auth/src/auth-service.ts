import {
  LoginInputSchema,
  SignupInputSchema,
  toPublicUser,
  type AgentStatus,
  type LoginInput,
  type PublicUser,
  type Role,
  type Session,
  type SignupInput,
  type User,
} from './domain';
import { hashPassword, verifyPassword } from './hashing';
import { newId, newToken } from './ids';
import type { AuthStores, Clock } from './ports';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthServiceDeps extends AuthStores {
  now?: Clock;
}

/**
 * Email+password auth with opaque server sessions and role-based access.
 * Agents register PENDING and are activated by an admin. Receives its stores by
 * DI so it runs in-memory (dev/test) or Postgres-backed identically.
 */
export class AuthService {
  private readonly now: Clock;

  constructor(private readonly deps: AuthServiceDeps) {
    this.now = deps.now ?? (() => new Date().toISOString());
  }

  async signup(input: SignupInput): Promise<{ user: PublicUser; session: Session }> {
    const parsed = SignupInputSchema.parse(input);
    const email = parsed.email.toLowerCase();
    if (await this.deps.users.getByEmail(email)) {
      throw new AuthError('An account with this email already exists');
    }
    const role: Role = parsed.role;
    const user: User = {
      id: newId(),
      email,
      displayName: parsed.displayName,
      role,
      passwordHash: hashPassword(parsed.password),
      ...(role === 'AGENT' ? { agentStatus: 'PENDING' as AgentStatus } : {}),
      createdAt: this.now(),
    };
    await this.deps.users.save(user);
    const session = await this.createSession(user.id);
    return { user: toPublicUser(user), session };
  }

  async login(input: LoginInput): Promise<{ user: PublicUser; session: Session }> {
    const parsed = LoginInputSchema.parse(input);
    const user = await this.deps.users.getByEmail(parsed.email.toLowerCase());
    if (!user || !verifyPassword(parsed.password, user.passwordHash)) {
      throw new AuthError('Invalid email or password');
    }
    const session = await this.createSession(user.id);
    return { user: toPublicUser(user), session };
  }

  async createSession(userId: string): Promise<Session> {
    const createdAt = this.now();
    const expiresAt = new Date(new Date(createdAt).getTime() + SESSION_TTL_MS).toISOString();
    return this.deps.sessions.save({ token: newToken(), userId, createdAt, expiresAt });
  }

  /** Resolve the logged-in user from a session token (undefined if missing/expired). */
  async getSessionUser(token: string | undefined): Promise<PublicUser | undefined> {
    if (!token) return undefined;
    const s = await this.deps.sessions.get(token);
    if (!s) return undefined;
    if (new Date(s.expiresAt).getTime() < new Date(this.now()).getTime()) {
      await this.deps.sessions.delete(token);
      return undefined;
    }
    const u = await this.deps.users.getById(s.userId);
    return u ? toPublicUser(u) : undefined;
  }

  async logout(token: string | undefined): Promise<void> {
    if (token) await this.deps.sessions.delete(token);
  }

  async listUsers(): Promise<PublicUser[]> {
    return (await this.deps.users.list()).map(toPublicUser);
  }

  /** Admin action: activate a PENDING agent. */
  async approveAgent(userId: string): Promise<PublicUser> {
    const u = await this.deps.users.getById(userId);
    if (!u) throw new AuthError('User not found');
    if (u.role !== 'AGENT' && u.role !== 'SUB_AGENT') throw new AuthError('Not an agent account');
    u.agentStatus = 'ACTIVE';
    await this.deps.users.save(u);
    return toPublicUser(u);
  }

  /** Idempotently provision an admin account (bootstrap). */
  async ensureAdmin(email: string, password: string, displayName = 'Admin'): Promise<PublicUser> {
    const lower = email.toLowerCase();
    const existing = await this.deps.users.getByEmail(lower);
    if (existing) return toPublicUser(existing);
    const user: User = {
      id: newId(),
      email: lower,
      displayName,
      role: 'ADMIN',
      passwordHash: hashPassword(password),
      createdAt: this.now(),
    };
    await this.deps.users.save(user);
    return toPublicUser(user);
  }
}

export const SESSION_COOKIE = 'auj_session';
