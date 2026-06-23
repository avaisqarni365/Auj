// Pure derivations for the Smart Planner (no React) so they unit-test cleanly. Canonical option
// values stay English; these map them to the visa-route preview, the IATA code and the /book href.

/** Extract the IATA code from an airport label like "Vilnius (VNO)" → "VNO". */
export function airportCode(airport: string): string {
  const m = airport.match(/\(([^)]+)\)/);
  return m ? m[1]! : airport;
}

export type VisaRouteKey = 'mixed' | 'evisa' | 'agent';

/** Which visa channel the group's passports route to. Mirrors the visa-router's intent:
 *  EU + Pakistani → two routes handled together; EU/EEA only → online e-Visa; otherwise → agent. */
export function visaRoute(nationality: string): { key: VisaRouteKey; kind: 'info' | 'success' } {
  const eu = nationality.includes('EU');
  const pk = nationality.includes('Pakistani');
  if (eu && pk) return { key: 'mixed', kind: 'info' };
  if (eu) return { key: 'evisa', kind: 'success' };
  return { key: 'agent', kind: 'info' };
}

export interface PlanForHref {
  journey: string;
  pilgrims: number;
  rooms: number;
  nights: number;
  airport: string;
  stars: string;
}

/** Build the hand-off URL into the /book funnel from the plan (origin code + group + stay). */
export function bookHref(plan: PlanForHref): string {
  const params = new URLSearchParams({
    city: 'MAKKAH',
    journey: plan.journey,
    pax: String(plan.pilgrims),
    rooms: String(plan.rooms),
    nights: String(plan.nights),
    from: airportCode(plan.airport),
    stars: plan.stars.replace('★', ''),
  });
  return `/book?${params.toString()}`;
}
