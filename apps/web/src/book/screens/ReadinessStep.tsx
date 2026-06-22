'use client';

import type { Readiness } from '../funnel';

// Pre-payment readiness (AUJ Booking Process.dc.html steps: insurance, luggage, planning, niyyah).
// Visa route is auto-derived from passports elsewhere in the funnel, so it is not a manual step here.

type OptId = string;
interface Group<T extends OptId> {
  field: keyof Readiness;
  title: string;
  desc: string;
  options: readonly (readonly [T, string, string])[];
}

const INSURANCE: Group<Readiness['insurance']> = {
  field: 'insurance',
  title: 'Travel insurance',
  desc: 'Choose the cover for your group. Medical cover is strongly recommended for every pilgrim.',
  options: [
    ['std', 'Standard cover', 'Included · basic medical & trip'],
    ['prem', 'Premium medical', 'Higher limits · pre-existing conditions'],
    ['fam', 'Family cover', 'All pilgrims on one policy'],
  ],
};
const LUGGAGE: Group<Readiness['luggage']> = {
  field: 'luggage',
  title: 'Luggage allowance',
  desc: 'Set your baggage. You can change this before you pay.',
  options: [
    ['std', 'Standard', '23 kg checked + 7 kg cabin'],
    ['extra', 'Extra bag', '+23 kg for gifts & Zamzam'],
    ['light', 'Cabin only', 'Travel light, lower fare'],
  ],
};
const PLANNING: Group<Readiness['planning']> = {
  field: 'planning',
  title: 'Pre-departure planning session',
  desc: 'Before you fly, we run an orientation so you arrive confident — rites, documents, health and what to pack.',
  options: [
    ['video', 'Online video session', 'Live group call with a guide'],
    ['inperson', 'In-person briefing', 'At a partner centre near you'],
    ['self', 'Self-guided', 'Use the AUJ wizards & guides'],
  ],
};

export interface ReadinessStepProps {
  readiness: Readiness;
  onChange: (patch: Partial<Readiness>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function ReadinessStep({ readiness, onChange, onBack, onContinue }: ReadinessStepProps) {
  return (
    <div className="grid gap-6">
      {([INSURANCE, LUGGAGE, PLANNING] as Group<string>[]).map((g) => (
        <section key={g.field as string}>
          <h3 className="font-serif text-lg font-semibold text-sand-ink">{g.title}</h3>
          <p className="mb-3 mt-0.5 max-w-[60ch] text-[13.5px] leading-relaxed text-sand-600">{g.desc}</p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {g.options.map(([id, label, note]) => {
              const on = readiness[g.field] === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ [g.field]: id } as Partial<Readiness>)}
                  className={`min-h-[44px] rounded-2xl border-2 p-4 text-left transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus ${
                    on ? 'border-green-600 bg-green-50' : 'border-sand-200 bg-white hover:border-green-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-4 w-4 rounded-full border-2 ${on ? 'border-green-600 bg-green-600' : 'border-sand-300'}`} />
                    <span className="text-[14.5px] font-semibold text-sand-ink">{label}</span>
                  </div>
                  <div className="mt-1 ps-6 text-[12.5px] text-sand-500">{note}</div>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {/* niyyah */}
      <section className="overflow-hidden rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-sand-50 p-5">
        <h3 className="font-serif text-lg font-semibold text-sand-ink">Your intention &amp; motivation</h3>
        <p className="mb-3 mt-0.5 max-w-[60ch] text-[13.5px] leading-relaxed text-sand-700">
          A pilgrimage begins in the heart. Renew your intention (niyyah) sincerely, seek forgiveness, and travel with calm and patience. We carry the logistics so you can carry your worship.
        </p>
        <button
          type="button"
          aria-pressed={readiness.niyyah}
          onClick={() => onChange({ niyyah: !readiness.niyyah })}
          className={`inline-flex min-h-[44px] items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-left transition-colors duration-fast focus-visible:outline-none focus-visible:shadow-focus ${
            readiness.niyyah ? 'border-green-600 bg-white' : 'border-sand-300 bg-white hover:border-green-500'
          }`}
        >
          <span className={`grid h-6 w-6 place-items-center rounded-full text-[13px] font-bold ${readiness.niyyah ? 'bg-green-700 text-white' : 'border border-sand-300 text-transparent'}`}>✓</span>
          <span>
            <span className="block text-[14.5px] font-semibold text-sand-ink">I renew my intention</span>
            <span className="block text-[12.5px] text-sand-500">Ready in heart and mind</span>
          </span>
        </button>
      </section>

      <div className="flex items-center justify-between gap-3 border-t border-sand-200 pt-5">
        <button type="button" onClick={onBack} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-sand-600 hover:text-sand-ink">‹ Back</button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!readiness.niyyah}
          className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 text-[15px] font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:cursor-default disabled:bg-sand-300"
        >
          Continue to checkout <span aria-hidden>→</span>
        </button>
      </div>
      {!readiness.niyyah ? <p className="-mt-3 text-end text-[12px] text-sand-400">Please renew your intention to continue.</p> : null}
    </div>
  );
}
