// Client-safe pilgrim-profile types (no pg). Store in profile-store.ts.
export interface JourneyHistory {
  title: string;
  year: string;
  detail: string;
  stars: string;
}

export interface PilgrimProfile {
  pilgrimId: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  languages: string[];
  tier: string;
  preferences: string[];
  /** Completed pilgrimages — populated as journeys complete; empty for a new pilgrim. */
  history?: JourneyHistory[];
}

export type ProfileInput = Omit<PilgrimProfile, 'pilgrimId'>;

export interface ProfileStore {
  get(pilgrimId: string): Promise<PilgrimProfile | undefined>;
  save(pilgrimId: string, input: ProfileInput): Promise<PilgrimProfile>;
}

export const TIERS = ['Standard', 'Silver', 'Gold', 'Platinum'] as const;

/** Stay & representative preferences a pilgrim can toggle on their profile. */
export const PREFERENCE_OPTIONS = [
  'Non-smoking room',
  'Near the Haram',
  'Halal full board',
  'Wheelchair on request',
  'Female guide (family)',
  'Urdu-speaking rep',
] as const;
