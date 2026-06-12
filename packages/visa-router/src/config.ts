// Eligibility data is CONFIG, not code. Updating any list below changes routing
// behaviour with no logic change (an acceptance criterion of this module).
// All codes are ISO-3166 alpha-2, upper-case.

export interface SeasonalSuspension {
  /** Nationalities temporarily blocked (alpha-2). */
  nationalities: string[];
  /** Inclusive ISO-8601 date window (YYYY-MM-DD). */
  from: string;
  to: string;
  reason: string;
}

export interface VisaConfig {
  /** Nationalities on the Saudi e-visa-eligible list. */
  evisaEligibleNationalities: ReadonlySet<string>;
  /** Countries whose RESIDENCE (with a held permit) qualifies regardless of nationality. */
  residenceQualifiers: ReadonlySet<string>;
  /** Time-boxed nationality suspensions — surfaced as warnings, never a hard block. */
  seasonalSuspensions: readonly SeasonalSuspension[];
}

// EU + EEA + Schengen-associated.
const EU_EEA = [
  'LT', 'LV', 'EE', 'PL', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'LU', 'AT', 'IE', 'PT',
  'FI', 'SE', 'DK', 'GR', 'CZ', 'SK', 'SI', 'HR', 'HU', 'RO', 'BG', 'CY', 'MT',
  'NO', 'IS', 'CH', 'LI',
];

// Selected additional nationalities on the Saudi tourist e-visa list.
const OTHER_EVISA = ['GB', 'US', 'CA', 'AU', 'NZ', 'JP', 'KR', 'SG', 'MY', 'BN'];

// Gulf Cooperation Council members.
const GCC = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'];

// Holding residence in Schengen / UK / US / GCC qualifies a non-eligible national.
const RESIDENCE_QUALIFIERS = [...EU_EEA, 'GB', 'US', ...GCC];

/** The shipped default. Operators tune these lists (e.g. via env-loaded overrides) without code changes. */
export const DEFAULT_VISA_CONFIG: VisaConfig = {
  evisaEligibleNationalities: new Set([...EU_EEA, ...OTHER_EVISA]),
  residenceQualifiers: new Set(RESIDENCE_QUALIFIERS),
  // No suspensions active by default; add date-boxed entries during Hajj-prep windows.
  seasonalSuspensions: [],
};
