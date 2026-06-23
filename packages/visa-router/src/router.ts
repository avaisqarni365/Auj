import type { Pilgrim, VisaRoute } from '@auj/contracts';
import { DEFAULT_VISA_CONFIG, type SeasonalSuspension, type VisaConfig } from './config';

export interface RouteOptions {
  /** ISO-8601 date (YYYY-MM-DD) to evaluate seasonal suspensions against. Defaults to today. */
  today?: string;
  /** Extra nationalities for dual nationals — any eligible one wins (preference for e-visa). */
  additionalNationalities?: string[];
  /** Inject an alternative config (e.g. ops-updated lists). Defaults to DEFAULT_VISA_CONFIG. */
  config?: VisaConfig;
}

/** One readable line of the decision trace — `pass` = this condition contributed to the route. */
export interface TraceStep {
  check: 'nationality' | 'residence' | 'seasonal';
  pass: boolean;
  detail: string;
}

export interface VisaRouting {
  route: VisaRoute;
  warnings: string[];
  /** Deterministic, human-readable explanation of how the route was decided. */
  trace: TraceStep[];
}

const norm = (s: string | undefined): string => (s ?? '').trim().toUpperCase();

function activeSuspension(
  config: VisaConfig,
  nationality: string,
  today: string,
): SeasonalSuspension | undefined {
  return config.seasonalSuspensions.find(
    (s) =>
      s.nationalities.map((c) => c.toUpperCase()).includes(nationality) &&
      today >= s.from &&
      today <= s.to,
  );
}

/**
 * Decide a pilgrim's visa channel. Eligibility follows the TRAVELLER (passport +
 * residence), never the company's location. Pure and deterministic.
 *
 * - EVISA_DIRECT when any nationality is e-visa-eligible, OR the pilgrim holds a
 *   qualifying residence permit (Schengen / UK / US / GCC).
 * - AGENT_CHANNEL otherwise (MoRA-licensed operator + Nusuk Masar).
 * - Seasonal suspensions add a warning but never change/deny the route here.
 * - Missing nationality falls back to the safe default (AGENT_CHANNEL) with a warning.
 */
export function routeFor(pilgrim: Pilgrim, opts: RouteOptions = {}): VisaRouting {
  const config = opts.config ?? DEFAULT_VISA_CONFIG;
  const warnings: string[] = [];

  const nationalities = [pilgrim.nationality, ...(opts.additionalNationalities ?? [])]
    .map(norm)
    .filter((n) => n.length > 0);

  if (nationalities.length === 0) {
    warnings.push('Missing nationality — defaulted to AGENT_CHANNEL.');
    return {
      route: 'AGENT_CHANNEL',
      warnings,
      trace: [{ check: 'nationality', pass: false, detail: 'No nationality provided — defaulted to the agent channel.' }],
    };
  }

  const eligibleByNationality = nationalities.some((n) =>
    config.evisaEligibleNationalities.has(n),
  );
  const residenceCountry = norm(pilgrim.residenceCountry);
  const eligibleByResidence =
    pilgrim.residencePermit === true && config.residenceQualifiers.has(residenceCountry);

  const route: VisaRoute =
    eligibleByNationality || eligibleByResidence ? 'EVISA_DIRECT' : 'AGENT_CHANNEL';

  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  let suspended = false;
  for (const n of nationalities) {
    const suspension = activeSuspension(config, n, today);
    if (suspension) {
      suspended = true;
      warnings.push(
        `Seasonal suspension for ${n} (${suspension.from} to ${suspension.to}): ${suspension.reason}`,
      );
    }
  }

  const trace: TraceStep[] = [
    {
      check: 'nationality',
      pass: eligibleByNationality,
      detail: `Passport ${nationalities.join(', ')} ${eligibleByNationality ? 'is on' : 'is not on'} the e-Visa list.`,
    },
    {
      check: 'residence',
      pass: eligibleByResidence,
      detail: residenceCountry
        ? `Residence in ${residenceCountry}${pilgrim.residencePermit ? '' : ' (no permit held)'} ${eligibleByResidence ? 'qualifies' : 'does not qualify'}.`
        : 'No residence qualifier provided.',
    },
    {
      check: 'seasonal',
      pass: suspended,
      detail: suspended ? 'Seasonal suspension warning applies (route unchanged).' : 'No seasonal suspension active.',
    },
  ];

  return { route, warnings, trace };
}

/** Route a whole group, preserving per-pilgrim results (mixed groups are normal). */
export function routeForGroup(
  pilgrims: Pilgrim[],
  opts: RouteOptions = {},
): Array<{ pilgrimId: string } & VisaRouting> {
  return pilgrims.map((p) => ({ pilgrimId: p.id, ...routeFor(p, opts) }));
}
