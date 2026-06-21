'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { routeFor } from '@auj/visa-router';
import { displayFromEur, type DisplayCurrency } from '../currency';
import { StripePaymentForm } from '../book/screens/StripePaymentForm';
import { finalizeDepositAction, startDepositAction } from './deposit-actions';
import {
  addMemberAction,
  getDashboardAction,
  removeMemberAction,
  savePassportFieldsAction,
  uploadPassportAction,
  type DashboardData,
} from './dashboard-actions';
import { EMPTY_PASSPORT, type PassportFields, type PassportScan } from './dashboard-types';

const STAGES = ['Registered', 'Passport', 'Deposit', 'Visa started', 'Info sent'] as const;
const CURRENCIES: DisplayCurrency[] = ['EUR', 'USD', 'SAR', 'PKR'];
const TOOLS = [
  { href: '/book', icon: '🔎', label: 'Search & book' },
  { href: '/plan/day', icon: '🕌', label: 'Day planner' },
  { href: '/companion/packing', icon: '🧳', label: 'Packing' },
  { href: '/companion/diary', icon: '📿', label: 'Diary' },
  { href: '/guide', icon: '🕋', label: 'Ritual guide' },
  { href: '/guide/airport', icon: '✈️', label: 'Airport wizard' },
  { href: '/companion', icon: '🧭', label: 'Companion' },
  { href: '/journey', icon: '📋', label: 'My journey' },
];

const FIELD_LABELS: Array<[keyof PassportFields, string]> = [
  ['passportNumber', 'Passport number'],
  ['surname', 'Surname'],
  ['givenNames', 'Given names'],
  ['nationality', 'Nationality (e.g. PK, LT)'],
  ['dob', 'Date of birth'],
  ['expiry', 'Expiry'],
  ['sex', 'Sex'],
];

export function PilgrimDashboard({ initial }: { initial: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initial);
  const [sel, setSel] = useState('me');
  const [fields, setFields] = useState<PassportFields>(initial.passports.me?.extracted ?? EMPTY_PASSPORT);
  const [addName, setAddName] = useState('');
  const [addRel, setAddRel] = useState('Family');
  const [currency, setCurrency] = useState<DisplayCurrency>('EUR');
  const [depositEur, setDepositEur] = useState('300');
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pay, setPay] = useState<'idle' | 'card' | 'paid'>(initial.depositPaid ? 'paid' : 'idle');
  const [payErr, setPayErr] = useState<string>();
  const [card, setCard] = useState<{ ref: string; clientSecret: string; publishableKey: string; amountLabel: string }>();

  const refresh = (next?: string): void =>
    void getDashboardAction().then((d) => {
      if (!d) return;
      setData(d);
      const id = next ?? sel;
      setFields(d.passports[id]?.extracted ?? EMPTY_PASSPORT);
    });

  const pickMember = (id: string): void => {
    setSel(id);
    setFields(data.passports[id]?.extracted ?? EMPTY_PASSPORT);
    setErr(undefined);
  };

  const scan: PassportScan | undefined = data.passports[sel];

  const upload = (file: File): void => {
    setErr(undefined);
    const form = new FormData();
    form.set('file', file);
    form.set('memberId', sel);
    start(async () => {
      const r = await uploadPassportAction(form);
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      refresh(sel);
    });
  };
  const saveFields = (): void => start(async () => {
    await savePassportFieldsAction(sel, fields);
    refresh(sel);
  });
  const addMember = (): void => {
    if (!addName.trim()) return;
    start(async () => {
      await addMemberAction(addName, addRel);
      setAddName('');
      refresh();
    });
  };
  const removeMember = (id: string): void => start(async () => {
    await removeMemberAction(id);
    if (sel === id) setSel('me');
    refresh('me');
  });

  // Progress derived from real signals: registration, passport confirmed, and booking step.
  const step = data.bookingStep;
  const passportConfirmed = data.passports.me?.status === 'confirmed';
  const confirmed = step === 'CONFIRMED';
  const depositDone = data.depositPaid || pay === 'paid' || confirmed;
  const done = [true, passportConfirmed, depositDone, confirmed, confirmed];
  const pct = Math.round((done.filter(Boolean).length / STAGES.length) * 100);

  const visa = fields.nationality.trim() ? routeFor({ nationality: fields.nationality.trim() } as Parameters<typeof routeFor>[0]) : null;
  const depositMinor = Math.round((parseFloat(depositEur) || 0) * 100);

  const payDeposit = (): void => {
    setPayErr(undefined);
    start(async () => {
      const r = await startDepositAction(depositMinor);
      if (r.status === 'error') {
        setPayErr(r.error);
        return;
      }
      if (r.status === 'requires_card') {
        setCard({ ref: r.ref, clientSecret: r.clientSecret, publishableKey: r.publishableKey, amountLabel: r.amountLabel });
        setPay('card');
        return;
      }
      setPay('paid');
    });
  };
  const confirmDeposit = (): void => {
    if (!card) return;
    start(async () => {
      const r = await finalizeDepositAction(card.ref);
      if (r.ok) {
        setPay('paid');
        setCard(undefined);
      } else {
        setPayErr('Could not capture the payment.');
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-[clamp(1.6rem,4vw,2.25rem)] font-semibold">📋 Pilgrim dashboard</h1>
      <p className="mt-2 max-w-[60ch] text-sand-500">Manage passports, deposits and your journey progress — for yourself, family or your group.</p>

      {/* member switcher */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {data.members.map((m) => (
          <button
            key={m.memberId}
            type="button"
            onClick={() => pickMember(m.memberId)}
            aria-pressed={sel === m.memberId}
            className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-[transform,border-color,background-color] duration-fast active:scale-[0.97] ${
              sel === m.memberId ? 'border-green-700 bg-green-700 text-white' : 'border-sand-200 bg-white text-sand-700 hover:border-green-700'
            }`}
          >
            <span>{m.memberId === 'me' ? '👤' : m.relation === 'Group' ? '👥' : '👪'} {m.name}</span>
            {m.memberId !== 'me' ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  removeMember(m.memberId);
                }}
                className={`-mr-1 rounded-full px-1 ${sel === m.memberId ? 'text-white/70 hover:text-white' : 'text-sand-400 hover:text-danger-fg'}`}
                aria-label={`Remove ${m.name}`}
              >
                ✕
              </span>
            ) : null}
          </button>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <input
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Add family/group member"
            className="w-44 rounded-lg border border-sand-200 bg-sand-50 px-3 py-1.5 text-[13px] outline-none focus:border-accent-600 focus:shadow-focus"
          />
          <select value={addRel} onChange={(e) => setAddRel(e.target.value)} className="rounded-lg border border-sand-200 bg-white px-2 py-1.5 text-[13px]">
            <option>Family</option>
            <option>Group</option>
          </select>
          <button type="button" onClick={addMember} disabled={pending} className="rounded-lg bg-green-700 px-3 py-1.5 text-[13px] font-semibold text-white active:scale-[0.98] disabled:opacity-40">
            Add
          </button>
        </span>
      </div>

      {/* progress */}
      <div className="mt-6 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-semibold text-sand-700">Journey progress</span>
          <span className="font-mono tabular-nums text-green-800">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-100">
          <div className="h-full rounded-full bg-green-700 transition-[width] duration-300 ease-out-soft" style={{ width: `${pct}%` }} />
        </div>
        <ol className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
          {STAGES.map((s, i) => (
            <li key={s} className={`flex items-center gap-1.5 text-[12px] font-semibold ${done[i] ? 'text-green-800' : 'text-sand-400'}`}>
              <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${done[i] ? 'bg-green-700 text-white' : 'bg-sand-200 text-transparent'}`}>✓</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {/* passport scan */}
        <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-serif text-lg font-semibold text-sand-800">Passport scan</h2>
            {visa ? (
              <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${visa.route === 'EVISA_DIRECT' ? 'bg-success-bg text-success-fg' : 'bg-info-bg text-info-fg'}`}>
                {visa.route === 'EVISA_DIRECT' ? 'e-Visa' : 'Agent channel'}
              </span>
            ) : null}
          </div>

          {scan?.imageKey ? (
            <img src={`/api/doc/${scan.imageKey}`} alt="Passport scan" className="mt-3 max-h-44 w-full rounded-lg border border-sand-200 object-contain" />
          ) : (
            <div className="mt-3 grid h-28 place-items-center rounded-lg border border-dashed border-sand-300 bg-sand-50 text-[13px] text-sand-500">No passport uploaded</div>
          )}

          <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={pending}
            className="mt-3 w-full rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-[13.5px] font-semibold text-green-800 transition-transform duration-fast active:scale-[0.98] disabled:opacity-50"
          >
            {scan?.imageKey ? 'Replace passport image' : 'Upload passport image'}
          </button>
          {scan && scan.status !== 'none' ? (
            <p className="mt-1 text-[12px] text-sand-500">
              {scan.status === 'confirmed' ? '✓ Details confirmed.' : 'Uploaded — fields are entered manually (OCR not configured).'}
            </p>
          ) : null}
          {err ? <p className="mt-1 text-[12px] text-danger-fg">{err}</p> : null}

          <div className="mt-3 grid gap-2">
            {FIELD_LABELS.map(([k, label]) => (
              <label key={k} className="text-[12px] font-medium text-sand-600">
                {label}
                <input
                  value={fields[k]}
                  onChange={(e) => setFields((f) => ({ ...f, [k]: e.target.value }))}
                  className="mt-0.5 w-full rounded-lg border border-sand-200 bg-sand-50 px-3 py-1.5 text-[13.5px] text-sand-800 outline-none focus:border-accent-600 focus:shadow-focus"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={saveFields}
            disabled={pending}
            className="mt-3 w-full rounded-lg bg-green-700 px-4 py-2 text-[13.5px] font-semibold text-white transition-transform duration-fast active:scale-[0.98] disabled:opacity-40"
          >
            Save details
          </button>
        </section>

        {/* deposit */}
        <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-sand-800">Deposit &amp; pay</h2>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[13px] text-sand-500">€</span>
            <input
              value={depositEur}
              inputMode="decimal"
              onChange={(e) => setDepositEur(e.target.value)}
              className="w-28 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-right font-mono text-[15px] outline-none focus:border-accent-600 focus:shadow-focus"
            />
            <span className="text-[12px] text-sand-500">deposit (EUR)</span>
          </div>
          <div className="mt-3 inline-flex rounded-xl border border-sand-200 bg-white p-1">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                aria-pressed={currency === c}
                className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors duration-fast ${currency === c ? 'bg-green-700 text-white' : 'text-sand-600 hover:text-green-800'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-sand-50 p-4">
            <div className="font-mono text-2xl font-semibold text-green-800">{displayFromEur(depositMinor, currency)}</div>
            <div className="mt-1 text-[12px] text-sand-500">
              {currency === 'EUR' ? 'Charged in EUR.' : `Indicative — charged in EUR (${displayFromEur(depositMinor, 'EUR')}).`}
            </div>
          </div>

          {pay === 'paid' ? (
            <div className="mt-3 rounded-lg bg-green-100 px-4 py-2.5 text-center text-[13.5px] font-semibold text-green-800">✓ Deposit paid</div>
          ) : pay === 'card' && card ? (
            <div className="mt-3">
              <StripePaymentForm
                locale="en"
                clientSecret={card.clientSecret}
                publishableKey={card.publishableKey}
                amountLabel={card.amountLabel}
                onConfirmed={confirmDeposit}
                onBack={() => {
                  setPay('idle');
                  setCard(undefined);
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={payDeposit}
              disabled={pending || depositMinor < 5000}
              className="mt-3 w-full rounded-lg bg-green-800 px-4 py-2.5 text-center text-[13.5px] font-semibold text-white transition-transform duration-fast active:scale-[0.98] disabled:opacity-50"
            >
              {pending ? 'Starting…' : 'Pay deposit'}
            </button>
          )}
          {payErr ? <p className="mt-1.5 text-[12px] text-danger-fg">{payErr}</p> : null}
          <Link href="/book" className="mt-2 block text-center text-[12.5px] font-semibold text-accent-600 hover:underline">
            or build a full package →
          </Link>
        </section>
      </div>

      {/* tool grid */}
      <section className="mt-5">
        <h2 className="mb-3 font-serif text-lg font-semibold text-sand-800">Your tools</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2.5 rounded-xl border border-sand-200 bg-white p-3.5 text-[13.5px] font-semibold text-sand-700 transition-[transform,border-color,color] duration-fast hover:border-green-700 hover:text-green-800 active:scale-[0.98]"
            >
              <span className="text-lg" aria-hidden>{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
