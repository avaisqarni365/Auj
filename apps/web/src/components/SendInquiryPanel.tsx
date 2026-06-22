'use client';

import { useMemo, useState, useTransition, type ReactNode } from 'react';
import { submitInquiryAction } from '../leads/actions';
import { AUJ_CONTACT } from '../content';
import type { InquiryInput } from '../leads/inquiry';

// Shared "send your plan to AUJ" panel — passenger details + GDPR consent and three send
// options: a real inquiry (submitInquiryAction → leads DB), WhatsApp and email (both pre-filled
// with the summary). Used by the Smart Planner and the booking checkout so they behave identically.

const WHATSAPP_NUMBER = AUJ_CONTACT.phone.replace(/[^\d]/g, '');
const INPUT =
  'w-full rounded-xl border-[1.5px] border-sand-300 bg-white px-3.5 py-3 text-[15px] text-sand-ink focus:border-accent-600 focus:outline-none focus:ring-[3px] focus:ring-accent-600/15';

export interface InquiryContact {
  name: string;
  phone: string;
  address: string;
  email: string;
}

export function SendInquiryPanel({
  subtitle = 'Add your details and we’ll prepare a tailored quote — by WhatsApp, email, or a direct inquiry.',
  subject = 'AUJ Smart Visit plan',
  summary,
  buildInquiry,
  successTitle = 'Your plan is on its way to AUJ',
  successCta,
}: {
  subtitle?: string;
  subject?: string;
  summary: { label: string; value: string }[];
  buildInquiry: (contact: InquiryContact, consent: boolean) => InquiryInput;
  successTitle?: string;
  successCta?: ReactNode;
}) {
  const [contact, setContact] = useState<InquiryContact>({ name: '', phone: '', address: '', email: '' });
  const setC = (patch: Partial<InquiryContact>): void => setContact((c) => ({ ...c, ...patch }));
  const [consent, setConsent] = useState(false);
  const [sentRef, setSentRef] = useState<string>();
  const [sending, startSend] = useTransition();
  const canSend = contact.name.trim() !== '' && /.+@.+\..+/.test(contact.email) && consent;

  const text = useMemo(
    () =>
      [
        subject,
        ...summary.map((s) => `• ${s.label}: ${s.value}`),
        '',
        `Name: ${contact.name || '—'}`,
        `Phone: ${contact.phone || '—'}`,
        `City / address: ${contact.address || '—'}`,
        `Email: ${contact.email || '—'}`,
      ].join('\n'),
    [subject, summary, contact],
  );
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  const mailHref = `mailto:${AUJ_CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

  const send = (): void =>
    startSend(async () => {
      const { ref } = await submitInquiryAction(buildInquiry(contact, consent));
      setSentRef(ref);
    });

  if (sentRef) {
    return (
      <div className="rounded-2xl border border-green-100 bg-green-50 px-5 py-6 text-center">
        <div className="text-2xl">📨</div>
        <div className="mt-1 text-[15px] font-bold text-green-800">{successTitle}</div>
        <p className="mt-1 text-[13px] text-sand-600">
          Reference <span className="font-mono font-semibold text-green-800">{sentRef}</span> — our team will be in touch shortly.
        </p>
        {successCta ? <div className="mt-3">{successCta}</div> : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-5">
      <div className="text-[15px] font-bold text-sand-ink">Send your plan to AUJ</div>
      <p className="mb-3 mt-0.5 text-[13px] text-sand-500">{subtitle}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name"><input value={contact.name} onChange={(e) => setC({ name: e.target.value })} className={INPUT} placeholder="As in passport" /></Field>
        <Field label="Phone"><input value={contact.phone} onChange={(e) => setC({ phone: e.target.value })} className={INPUT} placeholder="+…" /></Field>
        <Field label="City / address"><input value={contact.address} onChange={(e) => setC({ address: e.target.value })} className={INPUT} placeholder="City, country" /></Field>
        <Field label="Email"><input type="email" value={contact.email} onChange={(e) => setC({ email: e.target.value })} className={INPUT} placeholder="you@email.com" /></Field>
      </div>
      <label className="mt-3 flex items-start gap-2 text-[12.5px] text-sand-600">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        <span>I agree AUJ may contact me about this and store my details (GDPR).</span>
      </label>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={send}
          disabled={!canSend || sending}
          className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:cursor-default disabled:bg-sand-300"
        >
          {sending ? 'Sending…' : 'Send to AUJ'} <span aria-hidden>→</span>
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-success/40 bg-success/5 px-5 py-3 text-sm font-semibold text-success-fg transition-colors duration-fast hover:bg-success/10"
        >
          <span aria-hidden>✆</span> WhatsApp
        </a>
        <a href={mailHref} className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-sand-300 bg-white px-5 py-3 text-sm font-semibold text-green-800 transition-colors duration-fast hover:bg-sand-50">
          <span aria-hidden>✉</span> Email
        </a>
      </div>
      <p className="mt-2 text-[11.5px] text-sand-400">WhatsApp &amp; email open with your details pre-filled. “Send to AUJ” needs a name, email and consent.</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[7px] block text-[11.5px] font-semibold uppercase tracking-[0.07em] text-sand-500">{label}</span>
      {children}
    </label>
  );
}
