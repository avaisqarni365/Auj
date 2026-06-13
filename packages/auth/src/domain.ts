import { z } from 'zod';

/** Platform roles. Pilgrims book for themselves; agents (and their sub-agents) sell
 * on behalf of pilgrims via the B2B portal; admins run the back office. */
export const RoleSchema = z.enum(['PILGRIM', 'AGENT', 'SUB_AGENT', 'ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

/** Agent lifecycle: a new agent registers PENDING and must be approved by an admin. */
export const AgentStatusSchema = z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']);
export type AgentStatus = z.infer<typeof AgentStatusSchema>;

export interface User {
  id: string;
  email: string; // stored lowercased
  displayName: string;
  role: Role;
  passwordHash: string; // scrypt, format "saltHex:hashHex"
  agentStatus?: AgentStatus; // present only for AGENT / SUB_AGENT
  parentAgentId?: string; // SUB_AGENT -> owning AGENT
  createdAt: string; // ISO-8601
}

/** A user safe to expose to the client — never carries the password hash. */
export type PublicUser = Omit<User, 'passwordHash'>;
export function toPublicUser(u: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = u;
  return rest;
}

export interface Session {
  token: string; // opaque random, set as an httpOnly cookie
  userId: string;
  createdAt: string;
  expiresAt: string;
}

/** Public signup is limited to PILGRIM or AGENT (admins/sub-agents are provisioned). */
export const SignupInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Use at least 8 characters'),
  displayName: z.string().min(1),
  role: z.enum(['PILGRIM', 'AGENT']).default('PILGRIM'),
});
export type SignupInput = z.infer<typeof SignupInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;
