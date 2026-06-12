import type { Pilgrim, VisaRoute } from '@auj/contracts';

// EU/EEA + e-visa-eligible nationalities get the direct Saudi e-visa; everyone
// else (e.g. Pakistani passports) goes through the licensed agent channel.
// The canonical, config-driven list lives in the visa-router module (Wave A);
// this is a deliberately small stand-in so the mock is self-contained.
const EVISA_ELIGIBLE = new Set<string>([
  // EU
  'LT', 'LV', 'EE', 'PL', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'LU', 'AT', 'IE', 'PT',
  'FI', 'SE', 'DK', 'GR', 'CZ', 'SK', 'SI', 'HR', 'HU', 'RO', 'BG', 'CY', 'MT',
  // EEA + selected others on the Saudi e-visa list
  'NO', 'IS', 'CH', 'LI', 'GB', 'US', 'CA', 'AU', 'NZ', 'JP', 'KR', 'SG', 'MY', 'BN',
]);

/** Mirror of the central rule: derive the visa channel from a pilgrim's nationality. */
export function resolveVisaRoute(pilgrim: Pilgrim): VisaRoute {
  return EVISA_ELIGIBLE.has(pilgrim.nationality.toUpperCase()) ? 'EVISA_DIRECT' : 'AGENT_CHANNEL';
}
