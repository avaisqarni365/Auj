'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { PublicUser } from '@auj/auth';
import { formatMoney, pkrIndicative } from '../currency';
import { saveProfileAction } from './profile-actions';
import { TIERS, type PilgrimProfile } from './profile-types';

const INPUT = 'w-full rounded-lg border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[14px] focus:border-green-700 focus:outline-none';
const STAGES = ['Registered', 'Passport', 'Deposit', 'Visa started', 'Info sent'];
const TOOLS: ReadonlyArray<[string, string, string]> = [
  ['/book', '🧳', 'Book a package'],
  ['/guide', '🕋', 'Umrah Guide'],
  ['/guide/tour', '🧭', 'Virtual tour'],
  ['/companion', '🧭', 'Companion'],
  ['/bookings', '📄', 'My bookings'],
  ['/plan', '📝', 'Smart planner'],
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">{label}</span>
      {children}
    </label>
  );
}

export function ProfileEditor({ user, profile }: { user: PublicUser; profile: PilgrimProfile | null }) {
  const [city, setCity] = useState(profile?.city ?? '');
  const [country, setCountry] = useState(profile?.country ?? '');
  const [email, setEmail] = useState(profile?.email ?? user.email);
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [languages, setLanguages] = useState((profile?.languages ?? []).join(', '));
  const [tier, setTier] = useState(profile?.tier ?? 'Standard');
  const [savedMsg, setSavedMsg] = useState('');
  const [pending, start] = useTransition();

  const initials = user.displayName.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  const deposit = { amount: 248000, currency: 'EUR' as const };

  const save = (): void =>
    start(async () => {
      await saveProfileAction({ city, country, email, phone, languages: languages.split(',').map((s) => s.trim()).filter(Boolean), tier });
      setSavedMsg('Saved to your profile.');
    });

  return (
    <div className="mx-auto max-w-4xl px-[clamp(16px,4vw,32px)] py-8">
      {/* cover */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-3xl bg-gradient-to-br from-green-800 to-green-950 p-[clamp(20px,3vw,32px)] text-green-50">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 font-serif text-2xl font-semibold text-white">{initials || '🕋'}</span>
        <div className="min-w-0 flex-1">
          <div className="font-serif text-2xl font-semibold text-white">{user.displayName}</div>
          <div className="text-[13px] text-green-100/80">{[city, country].filter(Boolean).join(', ') || 'Add your city & country below'}</div>
        </div>
        <span className="rounded-full bg-[#F7EBD3]/20 px-3 py-1 text-[12.5px] font-semibold text-[#F0D9A4]">{tier} tier</span>
      </div>

      {/* progress */}
      <div className="mb-6 rounded-2xl border border-sand-200 bg-white p-5">
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-sand-500">Your journey progress</div>
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s, i) => (
            <span key={s} className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${i === 0 ? 'bg-green-800 text-white' : 'border border-sand-200 bg-sand-50 text-sand-500'}`}>{s}</span>
          ))}
        </div>
        <p className="mt-2 text-[11.5px] text-sand-400">Stages reflect your booking status once a booking exists.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* editable details */}
        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <div className="mb-3 text-[13px] font-bold text-sand-ink">Personal details</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="City"><input value={city} onChange={(e) => setCity(e.target.value)} className={INPUT} /></Field>
            <Field label="Country"><input value={country} onChange={(e) => setCountry(e.target.value)} className={INPUT} /></Field>
            <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={INPUT} /></Field>
            <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} /></Field>
            <Field label="Languages (comma-separated)"><input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Urdu" className={INPUT} /></Field>
            <Field label="Tier">
              <select value={tier} onChange={(e) => setTier(e.target.value)} className={INPUT}>{TIERS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            </Field>
          </div>
          <button type="button" onClick={save} disabled={pending} className="mt-4 rounded-xl bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">
            {pending ? 'Saving…' : 'Save profile'}
          </button>
          {savedMsg ? <span className="ms-3 text-[12.5px] font-semibold text-success-fg">{savedMsg}</span> : null}
        </div>

        {/* deposit / currency */}
        <div className="rounded-2xl border border-sand-200 bg-white p-5">
          <div className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-sand-500">Deposit</div>
          <div className="font-mono text-2xl font-bold text-green-800">{formatMoney(deposit)}</div>
          <div className="font-mono text-[12px] text-sand-500">{pkrIndicative(deposit)} indicative</div>
          <p className="mt-2 text-[11.5px] text-sand-400">Charged in EUR; PKR shown at today’s rate.</p>
          <Link href="/book" className="mt-3 block rounded-xl bg-green-800 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700">Pay / book</Link>
        </div>
      </div>

      {/* tool grid */}
      <div className="mt-6">
        <div className="mb-3 text-[13px] font-bold text-sand-ink">Your tools</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOOLS.map(([href, icon, label]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white p-4 transition-shadow duration-fast hover:shadow-lg">
              <span className="text-2xl">{icon}</span>
              <span className="text-[14px] font-semibold text-sand-ink">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
