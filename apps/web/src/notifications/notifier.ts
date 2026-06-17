import { createNotifier, type Notifier } from '@auj/notifications';

// Env-selected notifier (HTTP email when EMAIL_API_URL+KEY are set, else the offline log
// adapter), cached on globalThis. Sends are best-effort — callers must not fail on errors.
const globalForNotifier = globalThis as unknown as { __aujNotifier?: Notifier };

export function getNotifier(): Notifier {
  // createNotifier defaults its env arg to process.env; passing it explicitly trips TS's
  // weak-type check (NotifierEnv is all-optional) under `next build`. Call with no arg.
  globalForNotifier.__aujNotifier ??= createNotifier();
  return globalForNotifier.__aujNotifier;
}
