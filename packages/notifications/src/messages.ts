import type { EmailMessage } from './ports';

// Pure message builders (unit-tested). Plain text keeps providers/locale-agnostic; richer
// templates can layer on later.

export function bookingConfirmation(input: { to: string; bookingRef: string; pilgrims: number }): EmailMessage {
  return {
    to: input.to,
    subject: `AUJ booking confirmed · ${input.bookingRef}`,
    text:
      `Your AUJ booking ${input.bookingRef} is confirmed for ${input.pilgrims} pilgrim(s).\n` +
      `Track it any time under “My bookings”. You'll be charged in EUR; PKR is shown for reference.`,
  };
}

export function ticketReply(input: { to: string; ref: string; subject: string; body: string }): EmailMessage {
  return {
    to: input.to,
    subject: `Re: ${input.subject} · ${input.ref}`,
    text: `AUJ support replied to your ticket ${input.ref}:\n\n${input.body}\n\nReply in the app under Help & support.`,
  };
}
