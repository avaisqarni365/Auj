'use client';

import { useState, useTransition } from 'react';
import { ScreenFrame } from '../components/ScreenFrame';
import { saveWizardStepsAction } from '../ritual/wizard-admin-actions';
import type { WizItem, WizStep, WizardSlug } from '../ritual/wizard-steps-types';

const INPUT = 'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[14px] text-sand-ink focus:border-green-700 focus:outline-none';
const STATUSES = ['', 'ok', 'permit', 'prohibited'] as const;
const itemLabel = (it: WizItem): string => (typeof it === 'string' ? it : it.label);
const itemStatus = (it: WizItem): string => (typeof it === 'string' ? '' : it.status);

// Admin CRUD for the step-video wizards. Edits English title/body + structural fields per step
// (other languages are preserved). Add / reorder / delete steps and items; one save per wizard.
export function WizardsAdmin({ initial, titles, slugs }: { initial: Record<WizardSlug, WizStep[]>; titles: Record<WizardSlug, string>; slugs: WizardSlug[] }) {
  const [all, setAll] = useState<Record<WizardSlug, WizStep[]>>(initial);
  const [active, setActive] = useState<WizardSlug>(slugs[0] ?? 'airport');
  const [msg, setMsg] = useState('');
  const [pending, start] = useTransition();
  const steps = all[active] ?? [];

  const setSteps = (next: WizStep[]): void => {
    setAll((a) => ({ ...a, [active]: next }));
    setMsg('');
  };
  const updateStep = (i: number, patch: Partial<WizStep>): void => setSteps(steps.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  const setEn = (i: number, field: 't' | 'b', val: string): void => {
    const s = steps[i];
    if (!s) return;
    const en = { t: s.text.en?.t ?? '', b: s.text.en?.b ?? '', [field]: val };
    updateStep(i, { text: { ...s.text, en } });
  };
  const addStep = (): void => setSteps([...steps, { short: 'New step', label: '', text: { en: { t: '', b: '' } }, items: [] }]);
  const delStep = (i: number): void => setSteps(steps.filter((_, k) => k !== i));
  const move = (i: number, d: number): void => {
    const j = i + d;
    if (j < 0 || j >= steps.length) return;
    const n = [...steps];
    const [x] = n.splice(i, 1);
    if (x) n.splice(j, 0, x);
    setSteps(n);
  };
  const setItem = (i: number, j: number, label: string, status: string): void => {
    const s = steps[i];
    if (!s) return;
    const items = [...s.items];
    items[j] = status ? { label, status: status as 'ok' | 'permit' | 'prohibited' } : label;
    updateStep(i, { items });
  };
  const addItem = (i: number): void => {
    const s = steps[i];
    if (s) updateStep(i, { items: [...s.items, ''] });
  };
  const delItem = (i: number, j: number): void => {
    const s = steps[i];
    if (s) updateStep(i, { items: s.items.filter((_, k) => k !== j) });
  };

  const save = (): void =>
    start(async () => {
      const r = await saveWizardStepsAction(active, steps);
      setMsg(`Saved ${r.count} steps for “${titles[active] ?? active}”.`);
    });

  return (
    <ScreenFrame label="ADMIN · WIZARDS" tag={`${steps.length} steps`} maxWidth="max-w-4xl">
      <p className="mb-4 text-[13.5px] text-sand-500">
        Edit, add, reorder and delete the steps of each guided wizard. English is edited here; other languages are preserved. Changes save to the live wizard.
      </p>

      {/* wizard tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {slugs.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setActive(s); setMsg(''); }}
            className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${active === s ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-700 hover:bg-sand-50'}`}
          >
            {titles[s] ?? s} <span className="font-mono opacity-70">· {(all[s] ?? []).length}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {steps.map((s, i) => (
          <div key={i} className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="font-mono text-[11.5px] font-semibold text-accent-600">STEP {i + 1}</span>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg border border-sand-200 px-2 py-1 text-[13px] text-sand-700 disabled:opacity-40">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === steps.length - 1} className="rounded-lg border border-sand-200 px-2 py-1 text-[13px] text-sand-700 disabled:opacity-40">↓</button>
                <button type="button" onClick={() => delStep(i)} className="rounded-lg border border-danger/30 px-2.5 py-1 text-[13px] font-semibold text-danger-fg hover:bg-danger-bg">Delete</button>
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Field label="Rail label (short)"><input value={s.short} onChange={(e) => updateStep(i, { short: e.target.value })} className={INPUT} /></Field>
              <Field label="Caption (mono)"><input value={s.label} onChange={(e) => updateStep(i, { label: e.target.value })} className={INPUT} /></Field>
            </div>
            <Field label="Title (EN)"><input value={s.text.en?.t ?? ''} onChange={(e) => setEn(i, 't', e.target.value)} className={INPUT} /></Field>
            <Field label="Body (EN)"><textarea rows={2} value={s.text.en?.b ?? ''} onChange={(e) => setEn(i, 'b', e.target.value)} className={INPUT} /></Field>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Field label="Tip (optional)"><input value={s.tip ?? ''} onChange={(e) => updateStep(i, { tip: e.target.value })} className={INPUT} /></Field>
              <Field label="Seed video URL (optional)"><input value={s.videoUrl ?? ''} onChange={(e) => updateStep(i, { videoUrl: e.target.value })} className={INPUT} placeholder="YouTube / Vimeo / MP4" /></Field>
            </div>

            {/* checklist items */}
            <div className="mt-1">
              <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">Items / checklist</span>
              <div className="grid gap-2">
                {s.items.map((it, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <input value={itemLabel(it)} onChange={(e) => setItem(i, j, e.target.value, itemStatus(it))} className={`${INPUT} flex-1`} />
                    <select value={itemStatus(it)} onChange={(e) => setItem(i, j, itemLabel(it), e.target.value)} className="rounded-[10px] border-[1.5px] border-sand-300 bg-white px-2 py-2 text-[13px]">
                      {STATUSES.map((st) => <option key={st || 'plain'} value={st}>{st || 'plain'}</option>)}
                    </select>
                    <button type="button" onClick={() => delItem(i, j)} className="rounded-lg border border-sand-200 px-2 py-1.5 text-[13px] text-sand-500 hover:bg-sand-100">✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => addItem(i)} className="self-start rounded-lg border border-dashed border-sand-300 px-3 py-1.5 text-[12.5px] font-semibold text-green-800 hover:bg-sand-50">+ Add item</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-sand-100 pt-5">
        <button type="button" onClick={addStep} className="rounded-xl border border-dashed border-sand-300 px-5 py-2.5 text-sm font-semibold text-green-800 hover:bg-sand-50">+ Add step</button>
        <button type="button" onClick={save} disabled={pending} className="rounded-xl bg-green-800 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50">
          {pending ? 'Saving…' : `Save ${titles[active] ?? active}`}
        </button>
        {msg ? <span className="text-[13px] font-semibold text-success-fg">{msg}</span> : null}
      </div>
    </ScreenFrame>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-2.5 block">
      <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">{label}</span>
      {children}
    </label>
  );
}
