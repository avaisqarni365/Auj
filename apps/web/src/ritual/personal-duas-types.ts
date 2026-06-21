// Client-safe personal-du'a types (no pg). Store in personal-duas-store.ts (server).
export interface PersonalDua {
  id: string;
  stepKey: string;
  text: string;
  lang: string;
  translit?: string;
  meaning?: string;
  note?: string;
  pinned: boolean;
  createdAt: number;
}

export interface DuaInput {
  id?: string;
  stepKey: string;
  text: string;
  lang: string;
  translit?: string;
  meaning?: string;
  note?: string;
  pinned?: boolean;
}

export interface DuasStore {
  list(userId: string, stepKey?: string): Promise<PersonalDua[]>;
  save(userId: string, input: DuaInput): Promise<PersonalDua | null>;
  remove(userId: string, id: string): Promise<void>;
  togglePin(userId: string, id: string): Promise<void>;
}
