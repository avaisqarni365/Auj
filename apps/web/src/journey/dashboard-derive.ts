// Pure, client-safe helpers for the pilgrim dashboard — no DB/session, so they unit-test cleanly
// and can be imported from both the server action and the component.

/** Stable 5-digit serial from the user id — deterministic, no DB column needed. */
export function serialFromUserId(userId: string): string {
  let h = 0;
  for (const ch of userId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return String(h % 100000).padStart(5, '0');
}

/** Human booking reference, e.g. "BRN-26-04812", from the account id + creation year. */
export function bookingRef(userId: string, createdAt?: string): string {
  const yy = (createdAt ?? '').slice(2, 4) || '26';
  return `BRN-${yy}-${serialFromUserId(userId)}`;
}

/** First name for the greeting, stripped of any non-letter characters. */
export function greetNameOf(displayName?: string): string {
  return (displayName || '').trim().split(/\s+/)[0]?.replace(/[^\p{L}]/gu, '') ?? '';
}

/** The five journey stages, shared by the dashboard + profile timelines. */
export const JOURNEY_STAGES = ['Registered', 'Passport', 'Deposit', 'Visa started', 'Info sent'] as const;

/** Which journey stages a pilgrim has reached, derived from real booking signals (not a placeholder).
 *  Registered is always true; the rest come from a passport scan, a paid deposit, and a booking step. */
export function reachedStages(dash: { passports?: Record<string, unknown>; depositPaid?: boolean; bookingStep?: string | null } | null | undefined): string[] {
  const reached = ['Registered'];
  if (dash && Object.keys(dash.passports ?? {}).length > 0) reached.push('Passport');
  if (dash?.depositPaid) reached.push('Deposit');
  if (dash?.bookingStep) reached.push('Visa started', 'Info sent');
  return reached;
}
