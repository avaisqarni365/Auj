import type { EmailMessage, Notifier } from './ports';

/** Default offline notifier: logs the message instead of sending. Keeps dev/test/CI
 * free of any email provider or network. */
export class LogNotifier implements Notifier {
  readonly name = 'log';
  async send(message: EmailMessage): Promise<void> {
    console.log(`[email:log] to=${message.to} · ${message.subject}`);
  }
}
