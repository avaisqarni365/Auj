import { createNotifier, type Notifier } from '@auj/notifications';

// Env-selected notifier (HTTP email when EMAIL_API_URL+KEY are set, else the offline log
// adapter), cached on globalThis. Sends are best-effort — callers must not fail on errors.
const globalForNotifier = globalThis as unknown as { __aujNotifier?: Notifier };

export function getNotifier(): Notifier {
  globalForNotifier.__aujNotifier ??= createNotifier(process.env);
  return globalForNotifier.__aujNotifier;
}
