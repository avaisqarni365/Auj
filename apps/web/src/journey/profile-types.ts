// Client-safe pilgrim-profile types (no pg). Store in profile-store.ts.
export interface PilgrimProfile {
  pilgrimId: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  languages: string[];
  tier: string;
}

export type ProfileInput = Omit<PilgrimProfile, 'pilgrimId'>;

export interface ProfileStore {
  get(pilgrimId: string): Promise<PilgrimProfile | undefined>;
  save(pilgrimId: string, input: ProfileInput): Promise<PilgrimProfile>;
}

export const TIERS = ['Standard', 'Silver', 'Gold', 'Platinum'] as const;
