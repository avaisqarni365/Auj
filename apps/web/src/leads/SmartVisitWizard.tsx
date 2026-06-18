'use client';

import { useMemo, useState, useTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Logo } from '@auj/ui';
import { submitInquiryAction } from './actions';
import { COUNTRIES, HOTEL_BANDS, MADINAH_ZIYARAH, MAKKAH_ZIYARAH, airportsFor } from './wizard-data';
import type { ContactChannel, InquiryInput, PartyKind, ReturnFrom, TransferMode } from './inquiry';

const STEPS = ['residence', 'party', 'makkah', 'transfer', 'madinah', 'return', 'contact'] as const;

const initial: InquiryInput = {
  country: 'LT', city: '', departureAirport: 'VNO',
  adults: 2, children: 0, infants: 0, partyKind: 'FAMILY',
  makkahNights: 6, makkahHotelBand: HOTEL_BANDS[1], makkahZiyarah: [],
  transferMode: 'TRAIN', transferPrivate: false,
  madinahNights: 3, madinahHotelBand: HOTEL_BANDS[1], rawdah: true, madinahZiyarah: [],
  returnFrom: 'MADINAH', jeddahStopover: false,
  windowFrom: '', windowTo: '', trackerOptIn: true,
  name: '', email: '', phone: '', channel: 'WHATSAPP', lang: 'en', consent: false,
};

export function SmartVisitWizard() {
  const t = useTranslations('smartvisit');
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<InquiryInput>(initial);
  const [ref, setRef] = useState<string>();
  const [pending, start] = useTransition();
  const set = (patch: Partial<InquiryInput>): void => setF((s) => ({ ...s, ...patch }));
  const airports = useMemo(() => airportsFor(f.country), [f.country]);
  const canSubmit = f.name.trim() !== '' && /.+@.+/.test(f.email) && f.consent;

  const submit = (): void =>
    start(async () => {
      const { ref: r } = await submitInquiryAction({ ...f, lang: locale });
      setRef(r);
    });

  if (ref) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <div className="text-[44px]">🕋</div>
        <h1 className="mt-2 font-serif text-2xl font-semibold">{t('done.title')}</h1>
        <p className="mt-2 text-sm text-sand-500">{t('done.body')}</p>
        <div className="mt-4 inline-block rounded-xl bg-green-100 px-4 py-2 font-mono text-sm font-semibold text-green-800">{t('done.ref')}: {ref}</div>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/book" className="rounded-xl bg-green-800 py-2.5 text-sm font-semibold text-white hover:bg-green-700">{t('done.book')}</Link>
          <Link href="/companion" className="rounded-xl border border-sand-300 py-2.5 text-sm font-semibold text-sand-700 hover:border-green-700 hover:text-green-800">{t('done.companion')}</Link>
          <Link href="/" className="text-sm font-semibold text-accent-600">{t('done.home')}</Link>
        </div>
      </div>
    );
  }

  const key = STEPS[step]!;
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-5 flex items-center gap-2.5">
        <Logo size={32} />
        <div>
          <div className="font-serif text-lg font-semibold leading-none">{t('title')}</div>
          <div className="text-[12px] text-sand-500">{t('step', { n: step + 1, total: STEPS.length })}</div>
        </div>
      </div>
      {/* progress */}
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-sand-100">
        <div className="h-full rounded-full bg-green-700 transition-[width] duration-200 ease-out-soft" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <div key={key} className="animate-rise">
        {key === 'residence' && (
          <Step title={t('residence.title')}>
            <Field label={t('residence.country')}>
              <Select value={f.country} onChange={(v) => set({ country: v, departureAirport: airportsFor(v)[0]?.code })} options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))} />
            </Field>
            <Field label={t('residence.city')}>
              <input value={f.city} onChange={(e) => set({ city: e.target.value })} className={INPUT} placeholder="—" />
            </Field>
            {airports.length > 0 && (
              <Field label={t('residence.airport')}>
                <Select value={f.departureAirport ?? ''} onChange={(v) => set({ departureAirport: v })} options={airports.map((a) => ({ value: a.code, label: `${a.city} (${a.code})` }))} />
              </Field>
            )}
          </Step>
        )}

        {key === 'party' && (
          <Step title={t('party.title')}>
            <Counter label={t('party.adults')} value={f.adults} min={1} onChange={(v) => set({ adults: v })} />
            <Counter label={t('party.children')} value={f.children} min={0} onChange={(v) => set({ children: v })} />
            <Counter label={t('party.infants')} value={f.infants} min={0} onChange={(v) => set({ infants: v })} />
            <Field label={t('party.kind')}>
              <Seg<PartyKind> value={f.partyKind} onChange={(v) => set({ partyKind: v })} options={[['SOLO', t('party.solo')], ['FAMILY', t('party.family')], ['GROUP', t('party.group')]]} />
            </Field>
          </Step>
        )}

        {key === 'makkah' && (
          <Step title={t('makkah.title')}>
            <Counter label={t('makkah.nights')} value={f.makkahNights} min={1} onChange={(v) => set({ makkahNights: v })} />
            <Field label={t('makkah.hotel')}>
              <Seg value={f.makkahHotelBand} onChange={(v) => set({ makkahHotelBand: v })} options={HOTEL_BANDS.map((b) => [b, b] as [string, string])} />
            </Field>
            <Field label={t('makkah.ziyarah')}>
              <Chips selected={f.makkahZiyarah} all={MAKKAH_ZIYARAH} onToggle={(v) => set({ makkahZiyarah: toggle(f.makkahZiyarah, v) })} />
            </Field>
          </Step>
        )}

        {key === 'transfer' && (
          <Step title={t('transfer.title')}>
            <Field label={t('transfer.mode')}>
              <Seg<TransferMode> value={f.transferMode} onChange={(v) => set({ transferMode: v })} options={[['TRAIN', t('transfer.train')], ['BUS', t('transfer.bus')], ['CAR', t('transfer.car')], ['FLEXIBLE', t('transfer.flexible')]]} />
            </Field>
            <Toggle label={t('transfer.private')} on={f.transferPrivate} onChange={(v) => set({ transferPrivate: v })} />
          </Step>
        )}

        {key === 'madinah' && (
          <Step title={t('madinah.title')}>
            <Counter label={t('madinah.nights')} value={f.madinahNights} min={1} onChange={(v) => set({ madinahNights: v })} />
            <Field label={t('madinah.hotel')}>
              <Seg value={f.madinahHotelBand} onChange={(v) => set({ madinahHotelBand: v })} options={HOTEL_BANDS.map((b) => [b, b] as [string, string])} />
            </Field>
            <Toggle label={t('madinah.rawdah')} hint={t('madinah.rawdahHint')} on={f.rawdah} onChange={(v) => set({ rawdah: v })} />
            <Field label={t('madinah.ziyarah')}>
              <Chips selected={f.madinahZiyarah} all={MADINAH_ZIYARAH} onToggle={(v) => set({ madinahZiyarah: toggle(f.madinahZiyarah, v) })} />
            </Field>
          </Step>
        )}

        {key === 'return' && (
          <Step title={t('return.title')}>
            <Field label={t('return.from')}>
              <Seg<ReturnFrom> value={f.returnFrom} onChange={(v) => set({ returnFrom: v })} options={[['MADINAH', t('return.fromMadinah')], ['JEDDAH', t('return.fromJeddah')]]} />
            </Field>
            <Toggle label={t('return.jeddahStop')} on={f.jeddahStopover} onChange={(v) => set({ jeddahStopover: v })} />
            <div className="grid grid-cols-2 gap-2">
              <Field label={t('return.windowFrom')}><input type="date" value={f.windowFrom} onChange={(e) => set({ windowFrom: e.target.value })} className={INPUT} /></Field>
              <Field label={t('return.windowTo')}><input type="date" value={f.windowTo} min={f.windowFrom} onChange={(e) => set({ windowTo: e.target.value })} className={INPUT} /></Field>
            </div>
          </Step>
        )}

        {key === 'contact' && (
          <Step title={t('contact.title')}>
            <Field label={t('contact.name')}><input value={f.name} onChange={(e) => set({ name: e.target.value })} className={INPUT} required /></Field>
            <Field label={t('contact.email')}><input type="email" value={f.email} onChange={(e) => set({ email: e.target.value })} className={INPUT} required /></Field>
            <Field label={t('contact.phone')}><input value={f.phone} onChange={(e) => set({ phone: e.target.value })} className={INPUT} placeholder="+…" /></Field>
            <Field label={t('contact.channel')}>
              <Seg<ContactChannel> value={f.channel} onChange={(v) => set({ channel: v })} options={[['WHATSAPP', t('contact.whatsapp')], ['EMAIL', t('contact.emailC')], ['CALL', t('contact.call')]]} />
            </Field>
            <Toggle label={t('contact.tracker')} on={f.trackerOptIn} onChange={(v) => set({ trackerOptIn: v })} />
            <label className="mt-1 flex items-start gap-2 text-[13px] text-sand-600">
              <input type="checkbox" checked={f.consent} onChange={(e) => set({ consent: e.target.checked })} className="mt-0.5" />
              <span>{t('contact.consent')}</span>
            </label>
          </Step>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-sand-600 disabled:opacity-40">{t('back')}</button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => setStep((s) => s + 1)} className="rounded-xl bg-green-800 px-6 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98]">{t('next')}</button>
        ) : (
          <button type="button" onClick={submit} disabled={!canSubmit || pending} className="rounded-xl bg-green-800 px-6 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">{pending ? t('submitting') : t('submit')}</button>
        )}
      </div>
    </div>
  );
}

const INPUT = 'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2.5 text-[14.5px] focus:border-green-700 focus:outline-none';
const toggle = (arr: string[], v: string): string[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-serif text-xl font-semibold">{title}</h2>
      <div className="grid gap-3.5">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-sand-500">{label}</span>
      {children}
    </label>
  );
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Counter({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14px] font-medium text-sand-700">{label}</span>
      <div className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-sand-300 px-2 py-1.5">
        <button type="button" aria-label={`${label} −`} onClick={() => onChange(Math.max(min, value - 1))} className="h-8 w-8 rounded-lg border border-sand-200 bg-sand-50 text-lg text-green-700">−</button>
        <span className="min-w-[1.5rem] text-center text-[14.5px] font-semibold tabular-nums">{value}</span>
        <button type="button" aria-label={`${label} +`} onClick={() => onChange(Math.min(49, value + 1))} className="h-8 w-8 rounded-lg bg-green-800 text-lg text-white">+</button>
      </div>
    </div>
  );
}
function Seg<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: Array<[T, string]> }) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-[10px] bg-sand-100 p-1">
      {options.map(([v, label]) => (
        <button key={v} type="button" onClick={() => onChange(v)} className={`flex-1 whitespace-nowrap rounded-[7px] px-3 py-1.5 text-[13px] font-semibold ${value === v ? 'bg-white text-green-800 shadow-sm' : 'text-sand-500'}`}>{label}</button>
      ))}
    </div>
  );
}
function Chips({ selected, all, onToggle }: { selected: string[]; all: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {all.map((v) => {
        const on = selected.includes(v);
        return <button key={v} type="button" aria-pressed={on} onClick={() => onToggle(v)} className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${on ? 'border-green-800 bg-green-800/5 text-green-800' : 'border-sand-300 bg-white text-sand-600'}`}>{v}</button>;
      })}
    </div>
  );
}
function Toggle({ label, hint, on, onChange }: { label: string; hint?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={() => onChange(!on)} className="flex items-center gap-3 text-start">
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold ${on ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 text-transparent'}`}>✓</span>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium text-sand-700">{label}</span>
        {hint ? <span className="block text-[12px] text-sand-500">{hint}</span> : null}
      </span>
    </button>
  );
}
