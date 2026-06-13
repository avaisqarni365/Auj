import type { Session, User } from './domain';

export interface UserRepository {
  getById(id: string): Promise<User | undefined>;
  getByEmail(email: string): Promise<User | undefined>;
  save(u: User): Promise<User>;
  list(): Promise<User[]>;
}

export interface SessionRepository {
  get(token: string): Promise<Session | undefined>;
  save(s: Session): Promise<Session>;
  delete(token: string): Promise<void>;
}

export type Clock = () => string;

export interface AuthStores {
  users: UserRepository;
  sessions: SessionRepository;
}
