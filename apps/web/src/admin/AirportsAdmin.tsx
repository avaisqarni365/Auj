'use client';

import { useState, useTransition } from 'react';
import { ScreenFrame } from '../components/ScreenFrame';
import { deleteAirportAction, listAirportsAction, saveAirportAction } from '../depart/airport-admin-actions';
import { DEPART_REGIONS, type DepartAirport, type DepartRoute } from '../depart/airport-content';

const INPUT =
  'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[13.5px] text-sand-ink focus:border-green-700 focus:outline-none focus-visible:shadow-focus';
const BTN_SM =
  'rounded-md border border-sand-200 px-2 py-0.5 text-[12px] min-h-[28px] transition-transform duration-fast active:scale-[0.98] disabled:opacity-40';

function emptyAirport(): DepartAirport {
  return {
    code: '',
    city: '',
    country: '',
    region: 'Western Europe',
    blurb: '',
    checkInSteps: [],
    toMakkah: [],
    toMadinah: [],
    arrivalsNote: '',
  };
}

function emptyRoute(dest: 'Makkah' | 'Madinah'): DepartRoute {
  return { dest, hub: dest === 'Makkah' ? 'JED' : 'MED', airlines: [], via: '', frequency: '', durationText: '' };
}

// Admin CRUD over the per-airport "Departing from your city" hubs. Left list grouped by region;
// right editor for the selected airport incl. its check-in steps and Makkah/Madinah route lists.
// English-only (the public hub is English-only). Saves to the live store.
export function AirportsAdmin({ initial }: { initial: DepartAirport[] }) {
  const [airports, setAirports] = useState<DepartAirport[]>(initial);
  const [selected, setSelected] = useState<string | undefined>(initial[0]?.code);
  const [draft, setDraft] = useState<DepartAirport | undefined>(initial[0] ?? undefined);
  const [isNew, setIsNew] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();

  const pick = (a: DepartAirport): void => {
    setSelected(a.code);
    setDraft({ ...a });
    setIsNew(false);
    setMsg('');
    setErr('');
  };

  const addAirport = (): void => {
    const fresh = emptyAirport();
    setSelected(undefined);
    setDraft(fresh);
    setIsNew(true);
    setMsg('');
    setErr('');
  };

  const patch = (p: Partial<DepartAirport>): void => {
    setDraft((d) => (d ? { ...d, ...p } : d));
    setMsg('');
  };

  // ---- check-in steps ----
  const setStep = (i: number, v: string): void =>
    patch({ checkInSteps: (draft?.checkInSteps ?? []).map((s, k) => (k === i ? v : s)) });
  const addStep = (): void => patch({ checkInSteps: [...(draft?.checkInSteps ?? []), ''] });
  const delStep = (i: number): void => patch({ checkInSteps: (draft?.checkInSteps ?? []).filter((_, k) => k !== i) });
  const moveStep = (i: number, dir: number): void => {
    const steps = [...(draft?.checkInSteps ?? [])];
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const [x] = steps.splice(i, 1);
    if (x !== undefined) steps.splice(j, 0, x);
    patch({ checkInSteps: steps });
  };

  // ---- routes ----
  const routesKey = (dest: 'Makkah' | 'Madinah'): 'toMakkah' | 'toMadinah' =>
    dest === 'Makkah' ? 'toMakkah' : 'toMadinah';
  const setRoute = (dest: 'Makkah' | 'Madinah', i: number, p: Partial<DepartRoute>): void => {
    const key = routesKey(dest);
    patch({ [key]: (draft?.[key] ?? []).map((r, k) => (k === i ? { ...r, ...p } : r)) } as Partial<DepartAirport>);
  };
  const addRoute = (dest: 'Makkah' | 'Madinah'): void => {
    const key = routesKey(dest);
    patch({ [key]: [...(draft?.[key] ?? []), emptyRoute(dest)] } as Partial<DepartAirport>);
  };
  const delRoute = (dest: 'Makkah' | 'Madinah', i: number): void => {
    const key = routesKey(dest);
    patch({ [key]: (draft?.[key] ?? []).filter((_, k) => k !== i) } as Partial<DepartAirport>);
  };

  const save = (): void => {
    if (!draft) return;
    setErr('');
    start(async () => {
      try {
        const list = await saveAirportAction(draft);
        setAirports(list);
        const saved = list.find((a) => a.code === draft.code.toUpperCase());
        setSelected(saved?.code);
        if (saved) setDraft({ ...saved });
        setIsNew(false);
        setMsg(`Saved “${draft.city || draft.code}”.`);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Could not save.');
      }
    });
  };

  const remove = (): void => {
    if (!draft || isNew) return;
    setErr('');
    start(async () => {
      try {
        const list = await deleteAirportAction(draft.code);
        setAirports(list);
        const next = list[0];
        setSelected(next?.code);
        setDraft(next ? { ...next } : undefined);
        setMsg('Airport deleted.');
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Could not delete.');
      }
    });
  };

  const refresh = (): void =>
    start(async () => {
      try {
        const list = await listAirportsAction();
        setAirports(list);
        setMsg('Reloaded from store.');
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Could not reload.');
      }
    });

  return (
    <ScreenFrame label="ADMIN · DEPARTURE AIRPORTS" tag={`${airports.length} airports`} maxWidth="max-w-5xl">
      <p className="mb-4 text-[13.5px] text-sand-500">
        Edit, add and delete the per-airport “Departing from your city” hubs — blurb, check-in steps, and the route
        lists to Makkah &amp; Madinah. Content is English-only. Saves to the live store.
      </p>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* ---- airport list (grouped by region) ---- */}
        <aside className="grid content-start gap-4">
          <button
            type="button"
            onClick={addAirport}
            className="self-start rounded-xl bg-green-800 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-transform duration-fast active:scale-[0.98] min-h-[44px]"
          >
            + Add airport
          </button>
          {DEPART_REGIONS.map((region) => {
            const group = airports.filter((a) => a.region === region);
            if (!group.length) return null;
            return (
              <div key={region}>
                <h2 className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-accent-600">{region}</h2>
                <div className="grid gap-1.5">
                  {group.map((a) => (
                    <button
                      key={a.code}
                      type="button"
                      onClick={() => pick(a)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-[13px] transition-colors min-h-[44px] ${
                        !isNew && selected === a.code
                          ? 'border-green-800 bg-green-800 text-white'
                          : 'border-sand-300 bg-white text-sand-700 hover:bg-sand-50'
                      }`}
                    >
                      <span className="font-semibold">{a.city || '(unnamed)'}</span>
                      <span className="font-mono text-[11px] opacity-70">{a.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={refresh}
            disabled={pending}
            className="self-start rounded-lg border border-sand-300 px-3 py-1.5 text-[12.5px] font-semibold text-sand-700 transition-transform duration-fast active:scale-[0.98] disabled:opacity-50 min-h-[40px]"
          >
            Reload
          </button>
        </aside>

        {/* ---- editor ---- */}
        {draft ? (
          <div className="grid content-start gap-4">
            <div className="rounded-2xl border border-sand-200 bg-white p-4">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-[12px] font-semibold text-sand-500">Code (IATA)</span>
                  <input
                    value={draft.code}
                    onChange={(e) => patch({ code: e.target.value.toUpperCase().slice(0, 4) })}
                    placeholder="VNO"
                    className={`${INPUT} font-mono uppercase`}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[12px] font-semibold text-sand-500">Region</span>
                  <select value={draft.region} onChange={(e) => patch({ region: e.target.value as DepartAirport['region'] })} className={INPUT}>
                    {DEPART_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-[12px] font-semibold text-sand-500">City</span>
                  <input value={draft.city} onChange={(e) => patch({ city: e.target.value })} placeholder="Vilnius" className={INPUT} />
                </label>
                <label className="grid gap-1">
                  <span className="text-[12px] font-semibold text-sand-500">Country</span>
                  <input value={draft.country} onChange={(e) => patch({ country: e.target.value })} placeholder="Lithuania" className={INPUT} />
                </label>
                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[12px] font-semibold text-sand-500">Blurb</span>
                  <textarea value={draft.blurb} onChange={(e) => patch({ blurb: e.target.value })} rows={2} placeholder="One calm sentence about flying Umrah from here." className={INPUT} />
                </label>
                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[12px] font-semibold text-sand-500">Arrivals note</span>
                  <textarea value={draft.arrivalsNote} onChange={(e) => patch({ arrivalsNote: e.target.value })} rows={2} placeholder="One line about return flights arriving back here." className={INPUT} />
                </label>
              </div>
            </div>

            {/* check-in steps */}
            <div className="rounded-2xl border border-sand-200 bg-white p-4">
              <div className="mb-2.5 text-[14px] font-bold text-sand-ink">Check-in steps</div>
              <div className="grid gap-2">
                {draft.checkInSteps.map((s, i) => (
                  <div key={i} className="rounded-xl border border-sand-100 bg-sand-50/40 p-2.5">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-sand-400">#{i + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => moveStep(i, -1)} disabled={i === 0} className={BTN_SM}>↑</button>
                        <button type="button" onClick={() => moveStep(i, 1)} disabled={i === draft.checkInSteps.length - 1} className={BTN_SM}>↓</button>
                        <button type="button" onClick={() => delStep(i)} className="rounded-md border border-danger/30 px-2 py-0.5 text-[12px] font-semibold text-danger-fg transition-transform duration-fast active:scale-[0.98] hover:bg-danger-bg min-h-[28px]">✕</button>
                      </div>
                    </div>
                    <textarea value={s} onChange={(e) => setStep(i, e.target.value)} rows={2} placeholder="Practical check-in / airport step for this airport." className={INPUT} />
                  </div>
                ))}
                <button type="button" onClick={addStep} disabled={draft.checkInSteps.length >= 8} className="self-start rounded-lg border border-dashed border-sand-300 px-3 py-1.5 text-[12.5px] font-semibold text-green-800 transition-transform duration-fast active:scale-[0.98] hover:bg-sand-50 disabled:opacity-40 min-h-[40px]">
                  + Add step
                </button>
              </div>
            </div>

            {/* routes */}
            {(['Makkah', 'Madinah'] as const).map((dest) => {
              const key = dest === 'Makkah' ? 'toMakkah' : 'toMadinah';
              const routes = draft[key];
              return (
                <div key={dest} className="rounded-2xl border border-sand-200 bg-white p-4">
                  <div className="mb-2.5 text-[14px] font-bold text-sand-ink">Routes to {dest}</div>
                  <div className="grid gap-2.5">
                    {routes.map((r, i) => (
                      <div key={i} className="rounded-xl border border-sand-100 bg-sand-50/40 p-2.5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-mono text-[11px] text-sand-400">#{i + 1}</span>
                          <button type="button" onClick={() => delRoute(dest, i)} className="rounded-md border border-danger/30 px-2 py-0.5 text-[12px] font-semibold text-danger-fg transition-transform duration-fast active:scale-[0.98] hover:bg-danger-bg min-h-[28px]">✕</button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input value={r.hub} onChange={(e) => setRoute(dest, i, { hub: e.target.value })} placeholder="Hub (JED / MED)" className={`${INPUT} font-mono`} />
                          <input value={r.via} onChange={(e) => setRoute(dest, i, { via: e.target.value })} placeholder="via Istanbul" className={INPUT} />
                          <input
                            value={r.airlines.join(', ')}
                            onChange={(e) => setRoute(dest, i, { airlines: e.target.value.split(',').map((x) => x.trim()).filter((x) => x.length > 0) })}
                            placeholder="Airlines (comma-separated)"
                            className={`${INPUT} sm:col-span-2`}
                          />
                          <input value={r.frequency} onChange={(e) => setRoute(dest, i, { frequency: e.target.value })} placeholder="Daily / 4×/week" className={INPUT} />
                          <input value={r.durationText} onChange={(e) => setRoute(dest, i, { durationText: e.target.value })} placeholder="~9h 30m incl. layover" className={INPUT} />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addRoute(dest)} disabled={routes.length >= 6} className="self-start rounded-lg border border-dashed border-sand-300 px-3 py-1.5 text-[12.5px] font-semibold text-green-800 transition-transform duration-fast active:scale-[0.98] hover:bg-sand-50 disabled:opacity-40 min-h-[40px]">
                      + Add route
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap items-center gap-3 border-t border-sand-100 pt-5">
              <button type="button" onClick={save} disabled={pending} className="rounded-xl bg-green-800 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50 min-h-[44px]">
                {pending ? 'Saving…' : isNew ? 'Create airport' : 'Save airport'}
              </button>
              {!isNew ? (
                <button type="button" onClick={remove} disabled={pending} className="rounded-xl border border-danger/40 px-5 py-2.5 text-sm font-semibold text-danger-fg transition-transform duration-fast active:scale-[0.98] hover:bg-danger-bg disabled:opacity-50 min-h-[44px]">
                  Delete
                </button>
              ) : null}
              {msg ? <span className="text-[13px] font-semibold text-success-fg">{msg}</span> : null}
              {err ? <span className="text-[13px] font-semibold text-danger-fg">{err}</span> : null}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-sand-300 bg-white p-8 text-center text-[13.5px] text-sand-500">
            No airport selected. Use “+ Add airport” to create one.
          </div>
        )}
      </div>
    </ScreenFrame>
  );
}
