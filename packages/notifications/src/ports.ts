export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

/** A transactional notifier. Implemented by the log adapter (dev) and an HTTP email
 * adapter (prod). Fire-and-forget at the call site — callers should not fail on send errors. */
export interface Notifier {
  readonly name: string;
  send(message: EmailMessage): Promise<void>;
}

// Minimal fetch shape so the HTTP adapter is unit-testable offline (inject a fake).
export interface FetchResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}
export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<FetchResponse>;
