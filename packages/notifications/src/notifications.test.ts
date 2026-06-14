import { describe, it, expect } from 'vitest';
import { bookingConfirmation, ticketReply } from './messages';
import { HttpEmailNotifier } from './http';
import { LogNotifier } from './log';
import { createNotifier } from './factory';
import type { FetchLike, FetchResponse } from './ports';

const resp = (ok: boolean, status = 200, body = ''): FetchResponse => ({ ok, status, text: async () => body });

describe('message builders', () => {
  it('bookingConfirmation puts the ref in the subject + targets the user', () => {
    const m = bookingConfirmation({ to: 'a@x.example', bookingRef: 'BR-1', pilgrims: 3 });
    expect(m.to).toBe('a@x.example');
    expect(m.subject).toContain('BR-1');
    expect(m.text).toContain('3 pilgrim');
  });
  it('ticketReply references the ticket + carries the body', () => {
    const m = ticketReply({ to: 'a@x.example', ref: 'AUJ-T-1', subject: 'Visa', body: 'On it' });
    expect(m.subject).toContain('AUJ-T-1');
    expect(m.text).toContain('On it');
  });
});

describe('HttpEmailNotifier (injected fetch)', () => {
  it('POSTs the message with auth + from, and throws on failure', async () => {
    let captured: { url: string; headers: Record<string, string>; body: string } | undefined;
    const fetchFn: FetchLike = async (url, init) => {
      captured = { url, headers: init.headers, body: init.body };
      return resp(true);
    };
    const n = new HttpEmailNotifier({ url: 'https://email.example/send', apiKey: 'k', from: 'AUJ <x@auj.example>', fetchFn });
    await n.send({ to: 'p@x.example', subject: 'Hi', text: 'Body' });
    expect(captured?.url).toBe('https://email.example/send');
    expect(captured?.headers.Authorization).toBe('Bearer k');
    expect(captured?.body).toContain('p@x.example');
    expect(captured?.body).toContain('AUJ <x@auj.example>');

    const failing = new HttpEmailNotifier({ url: 'u', apiKey: 'k', from: 'f', fetchFn: async () => resp(false, 500, 'boom') });
    await expect(failing.send({ to: 't', subject: 's', text: 'b' })).rejects.toThrow(/email send failed/);
  });
});

describe('createNotifier selects by env', () => {
  it('defaults to the log notifier, swaps to HTTP when keys present', () => {
    expect(createNotifier({})).toBeInstanceOf(LogNotifier);
    expect(createNotifier({ EMAIL_API_URL: 'https://e', EMAIL_API_KEY: 'k' })).toBeInstanceOf(HttpEmailNotifier);
  });
});
