// Client-safe booking-draft types (no pg). A resumable snapshot of the funnel's choices.
import type { FunnelState, PilgrimDraft } from './funnel';

export interface BookingDraft {
  state: FunnelState;
  pilgrims: PilgrimDraft[];
}

export interface BookingDraftStore {
  get(userId: string): Promise<BookingDraft | undefined>;
  save(userId: string, draft: BookingDraft): Promise<void>;
  clear(userId: string): Promise<void>;
}
