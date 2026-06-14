// Minimal fetch shape so live providers are unit-testable offline (inject a fake)
// and don't pull in any SDK dependency. Defaults to the global fetch in production.
export interface FetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}
export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string },
) => Promise<FetchResponse>;

export const defaultFetch: FetchLike = (url, init) =>
  fetch(url, init as RequestInit) as unknown as Promise<FetchResponse>;

/** Form-encode a flat record for application/x-www-form-urlencoded (Stripe-style). */
export function formEncode(fields: Record<string, string | number | boolean>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(fields)) p.set(k, String(v));
  return p.toString();
}
