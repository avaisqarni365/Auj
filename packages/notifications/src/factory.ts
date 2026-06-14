import { LogNotifier } from './log';
import { HttpEmailNotifier } from './http';
import type { Notifier } from './ports';

export interface NotifierEnv {
  EMAIL_API_URL?: string;
  EMAIL_API_KEY?: string;
  EMAIL_FROM?: string;
}

/** HTTP email notifier when EMAIL_API_URL + EMAIL_API_KEY are set, else the offline log adapter. */
export function createNotifier(env: NotifierEnv = process.env): Notifier {
  if (env.EMAIL_API_URL && env.EMAIL_API_KEY) {
    return new HttpEmailNotifier({ url: env.EMAIL_API_URL, apiKey: env.EMAIL_API_KEY, from: env.EMAIL_FROM ?? 'AUJ <no-reply@auj.example>' });
  }
  return new LogNotifier();
}
