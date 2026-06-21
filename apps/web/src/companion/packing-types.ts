// Client-safe types for the packing list store (no pg import here).
import type { PackingProfile } from './packing';

export interface PackingState {
  days: number;
  checked: Record<string, boolean>; // itemId → ticked
}

export interface PackingStore {
  get(userId: string, profile: PackingProfile): Promise<PackingState | undefined>;
  save(userId: string, profile: PackingProfile, state: PackingState): Promise<void>;
}
