// Client-safe ritual-progress type (no pg). Store in ritual-progress-store.ts (server).
export interface RitualProgress {
  stepIndex: number;
  checked: Record<string, boolean>;
  counters: { tawaf: number; sai: number };
  notes: string;
  elapsedSec: number;
  completedAt: number | null;
}

export interface ProgressStore {
  get(userId: string): Promise<RitualProgress | undefined>;
  save(userId: string, p: RitualProgress): Promise<void>;
}
