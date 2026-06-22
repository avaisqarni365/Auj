'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ScreenFrame } from '../components/ScreenFrame';
import { deleteTourVideoAction } from '../ritual/tour/tour-video-actions';
import { deleteStepVideoAction } from '../ritual/step-video-actions';
import type { WizardSlug } from '../ritual/wizard-steps-types';

export interface TourClip { sceneId: string; label: string; url: string }
export interface WizardClip { wizard: WizardSlug; wizardTitle: string; stepIdx: number; stepLabel: string; url: string }

// Pilgrim's personal wizard hub: their preferences + the clips they've added to the Virtual Tour
// and to each guided wizard. Everything here is personal to the signed-in pilgrim.
export function PilgrimWizardsHub({ preferences, tourClips, wizardClips }: { preferences: string[]; tourClips: TourClip[]; wizardClips: WizardClip[] }) {
  const [tour, setTour] = useState(tourClips);
  const [wiz, setWiz] = useState(wizardClips);
  const [, start] = useTransition();

  const removeTour = (sceneId: string): void => {
    setTour((t) => t.filter((c) => c.sceneId !== sceneId));
    start(async () => {
      await deleteTourVideoAction(sceneId);
    });
  };
  const removeWiz = (wizard: WizardSlug, stepIdx: number): void => {
    setWiz((x) => x.filter((c) => !(c.wizard === wizard && c.stepIdx === stepIdx)));
    start(async () => {
      await deleteStepVideoAction(wizard, stepIdx);
    });
  };

  return (
    <ScreenFrame label="MY WIZARDS & PREFERENCES" tag={`${tour.length + wiz.length} clips`} maxWidth="max-w-3xl">
      <p className="mb-5 text-[13.5px] text-sand-500">Everything personal to you — your travel preferences and the videos you’ve attached to the tour and the guided wizards. Only you can see these.</p>

      {/* preferences */}
      <section className="mb-6 rounded-2xl border border-sand-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[14px] font-bold text-sand-ink">Your preferences</div>
          <Link href="/journey/profile" className="text-[13px] font-semibold text-accent-600 hover:text-green-800">Edit in profile →</Link>
        </div>
        {preferences.length === 0 ? (
          <p className="text-[13px] text-sand-500">No preferences set yet — add them in your profile.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {preferences.map((p) => (
              <span key={p} className="inline-flex items-center gap-2 rounded-full border border-green-600 bg-green-50 px-3.5 py-1.5 text-[13px] font-medium text-green-800">
                <span className="h-[7px] w-[7px] rounded-full bg-green-600" /> {p}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* virtual tour clips */}
      <Section title="Virtual tour — your videos" addHref="/guide/tour" addLabel="Open tour to add">
        {tour.length === 0 ? (
          <Empty>No tour videos yet. Open the virtual tour and add your own clip to any step.</Empty>
        ) : (
          tour.map((c) => <ClipRow key={c.sceneId} label={c.label} sub="Virtual tour" url={c.url} onRemove={() => removeTour(c.sceneId)} />)
        )}
      </Section>

      {/* wizard clips */}
      <Section title="Guided wizards — your videos" addHref="/guide" addLabel="Open the guides to add">
        {wiz.length === 0 ? (
          <Empty>No wizard videos yet. Open a wizard (airport, luggage, ziyarat…) and attach your own clip per step.</Empty>
        ) : (
          wiz.map((c) => <ClipRow key={`${c.wizard}-${c.stepIdx}`} label={c.stepLabel} sub={c.wizardTitle} url={c.url} onRemove={() => removeWiz(c.wizard, c.stepIdx)} />)
        )}
      </Section>
    </ScreenFrame>
  );
}

function Section({ title, addHref, addLabel, children }: { title: string; addHref: string; addLabel: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold text-sand-ink">{title}</h2>
        <Link href={addHref} className="shrink-0 rounded-xl border border-sand-300 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-green-800 hover:bg-sand-50">{addLabel} →</Link>
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function ClipRow({ label, sub, url, onRemove }: { label: string; sub: string; url: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-3.5 py-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-100 text-base">🎥</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold text-sand-ink">{label}</div>
        <div className="truncate text-[12px] text-sand-500">{sub} · <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent-600 hover:underline">{url}</a></div>
      </div>
      <button type="button" onClick={onRemove} className="shrink-0 rounded-lg border border-sand-200 px-3 py-1.5 text-[12.5px] font-semibold text-danger-fg hover:bg-danger-bg">Remove</button>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-sand-200 bg-sand-50/50 px-4 py-6 text-center text-[13px] text-sand-500">{children}</div>;
}
