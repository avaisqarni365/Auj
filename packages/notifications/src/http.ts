import type { EmailMessage, FetchLike, Notifier } from './ports';

const defaultFetch: FetchLike = (url, init) => fetch(url, init as RequestInit) as unknown as ReturnType<FetchLike>;

export interface HttpEmailConfig {
  url: string;
  apiKey: string;
  from: string;
  fetchFn?: FetchLike;
}

/** Generic JSON email-API adapter (Resend / Postmark / Mailgun-style). A real integration
 * maps the provider's request/response here; `fetchFn` is injectable for offline tests. */
export class HttpEmailNotifier implements Notifier {
  readonly name = 'http-email';
  private readonly fetchFn: FetchLike;

  constructor(private readonly cfg: HttpEmailConfig) {
    this.fetchFn = cfg.fetchFn ?? defaultFetch;
  }

  async send(message: EmailMessage): Promise<void> {
    const res = await this.fetchFn(this.cfg.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.cfg.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.cfg.from, to: message.to, subject: message.subject, text: message.text }),
    });
    if (!res.ok) throw new Error(`email send failed: ${res.status} ${await res.text()}`);
  }
}
