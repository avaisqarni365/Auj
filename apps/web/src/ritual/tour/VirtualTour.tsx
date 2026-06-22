'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { PanoramaViewer } from './PanoramaViewer';
import { ScreenFrame } from '../../components/ScreenFrame';
import { tourChrome, tourScenes } from './scenes';
import { isRtlLang, ui } from '../i18n';
import { useRitualLang } from '../useRitualLang';
import { ListenButton } from '../ListenButton';
import { deleteTourVideoAction, saveTourVideoAction } from './tour-video-actions';
import type { ContentOverrides } from '../content-overrides';

const MEDIA_H = 'h-[clamp(220px,42vw,420px)]';

// Personal-video panel copy (matches AUJ Virtual Tour.dc.html), localized.
const VL: Record<string, { your: string; ph: string; add: string; replace: string; remove: string; signin: string; hint: string }> = {
  en: { your: 'Your video', ph: 'Paste a video link (YouTube, Vimeo, MP4)', add: 'Add link', replace: 'Replace', remove: 'Remove', signin: 'Sign in to add your own video for each step', hint: 'Attach your own clip for this step — it plays here and only you see it.' },
  ar: { your: 'الفيديو الخاص بك', ph: 'الصق رابط فيديو (YouTube، Vimeo، MP4)', add: 'إضافة رابط', replace: 'استبدال', remove: 'إزالة', signin: 'سجّل الدخول لإضافة الفيديو الخاص بك لكل خطوة', hint: 'أضف مقطعك الخاص لهذه الخطوة — يظهر هنا وتراه أنت وحدك.' },
  ur: { your: 'آپ کی ویڈیو', ph: 'ویڈیو لنک پیسٹ کریں (YouTube، Vimeo، MP4)', add: 'لنک شامل کریں', replace: 'تبدیل کریں', remove: 'ہٹائیں', signin: 'ہر مرحلے کے لیے اپنی ویڈیو شامل کرنے کے لیے سائن اِن کریں', hint: 'اس مرحلے کے لیے اپنی ویڈیو لگائیں — یہ یہاں چلے گی اور صرف آپ دیکھیں گے۔' },
  tr: { your: 'Senin videon', ph: 'Bir video bağlantısı yapıştır (YouTube, Vimeo, MP4)', add: 'Bağlantı ekle', replace: 'Değiştir', remove: 'Kaldır', signin: 'Her adıma kendi videonu eklemek için giriş yap', hint: 'Bu adım için kendi klibini ekle — burada oynar ve yalnızca sen görürsün.' },
  de: { your: 'Dein Video', ph: 'Videolink einfügen (YouTube, Vimeo, MP4)', add: 'Link hinzufügen', replace: 'Ersetzen', remove: 'Entfernen', signin: 'Melde dich an, um dein eigenes Video je Schritt hinzuzufügen', hint: 'Füge deinen eigenen Clip für diesen Schritt hinzu — er läuft hier und nur du siehst ihn.' },
};
const vl = (lang: string) => VL[lang] ?? VL.en!;

/** Resolve a pasted link to an embeddable player (YouTube/Vimeo → iframe, else a direct <video>). */
function embed(url: string): { kind: 'iframe' | 'video'; url: string } {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) return { kind: 'iframe', url: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(\d+)/i);
  if (vm) return { kind: 'iframe', url: `https://player.vimeo.com/video/${vm[1]}` };
  return { kind: 'video', url };
}

/** Shared walkthrough video; falls back to a calm placeholder until an .mp4 is dropped in. */
function TourVideo({ src, poster, soonLabel }: { src: string; poster: string; soonLabel: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <div className={`flex ${MEDIA_H} items-center justify-center rounded-2xl border border-dashed border-sand-300 bg-sand-50`}>
        <span className="text-[13px] font-medium text-sand-500">🎥 {soonLabel}</span>
      </div>
    );
  }
  return (
    <video controls preload="none" poster={poster} src={src} onError={() => setOk(false)} className={`${MEDIA_H} w-full rounded-2xl border border-sand-200 bg-green-950 object-cover`} />
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-sand-500">{children}</div>;
}

export function VirtualTour({ overrides = {}, signedIn = false, initialVideos = {} }: { overrides?: ContentOverrides; signedIn?: boolean; initialVideos?: Record<string, string> }) {
  const [lang] = useRitualLang();
  const rtl = isRtlLang(lang);
  const chrome = tourChrome(lang);
  const L = vl(lang);
  const scenes = tourScenes(lang).map((s) => {
    const o = overrides[`tour:${s.id}`]?.[lang] ?? {};
    return { ...s, title: o.title?.trim() || s.title, subtitle: o.subtitle?.trim() || s.subtitle, desc: o.intro?.trim() || s.desc };
  });
  const [idx, setIdx] = useState(0);
  const scene = scenes[idx] ?? scenes[0];

  // Per-pilgrim personal videos (sceneId → url). Optimistic local state, persisted via server action.
  const [videos, setVideos] = useState<Record<string, string>>(initialVideos);
  const [draft, setDraft] = useState('');
  const [, startSave] = useTransition();

  if (!scene) return null;
  const personal = videos[scene.id];

  const addVideo = (): void => {
    const url = draft.trim();
    if (!url) return;
    const sid = scene.id;
    setVideos((v) => ({ ...v, [sid]: url }));
    setDraft('');
    startSave(async () => {
      await saveTourVideoAction(sid, url);
    });
  };
  const removeVideo = (): void => {
    const sid = scene.id;
    setVideos((v) => {
      const n = { ...v };
      delete n[sid];
      return n;
    });
    startSave(async () => {
      await deleteTourVideoAction(sid);
    });
  };

  return (
    <ScreenFrame label={ui(lang).virtualTour} tag={`${idx + 1} / ${scenes.length}`} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[14px] text-sand-500">{chrome.subtitle}</p>
        <Link
          href="/guide"
          className="shrink-0 rounded-xl border border-sand-300 bg-white px-4 py-2 text-[13px] font-semibold text-green-800 transition-colors duration-fast hover:bg-sand-50 active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus"
        >
          {chrome.back} →
        </Link>
      </div>

      {/* picture + video, side by side */}
      <div key={scene.id} className="animate-rise grid gap-3 md:grid-cols-2">
        <figure>
          <Caption>{chrome.photo}</Caption>
          <PanoramaViewer src={scene.src} fallbackSrc={scene.fallbackSrc} alt={`${scene.title} — ${scene.subtitle}`} hint={chrome.hint} />
        </figure>
        <figure>
          <Caption>{personal ? L.your : chrome.video}</Caption>
          {personal ? (
            embed(personal).kind === 'iframe' ? (
              <iframe
                src={embed(personal).url}
                title={L.your}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={`${MEDIA_H} w-full rounded-2xl border border-sand-200 bg-green-950`}
              />
            ) : (
              <video controls src={embed(personal).url} className={`${MEDIA_H} w-full rounded-2xl border border-sand-200 bg-green-950 object-cover`} />
            )
          ) : (
            <TourVideo src={scene.videoSrc} poster={scene.fallbackSrc} soonLabel={chrome.videoSoon} />
          )}
        </figure>
      </div>

      {/* personal video controls — only for signed-in pilgrims (the public tour is shared & identical) */}
      {signedIn ? (
        <div className="mt-3 rounded-xl border border-sand-200 bg-sand-50/60 p-3">
          <div className="mb-1.5 text-[12px] font-semibold text-sand-700">{L.your}</div>
          <p className="mb-2 text-[12px] text-sand-500">{L.hint}</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={L.ph}
              className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2 text-[13.5px] focus:border-green-700 focus:outline-none"
            />
            <button type="button" onClick={addVideo} className="rounded-[10px] bg-green-800 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-fast hover:bg-green-700 active:scale-[0.98]">
              {personal ? L.replace : L.add}
            </button>
            {personal ? (
              <button type="button" onClick={removeVideo} className="rounded-[10px] border border-sand-300 bg-white px-4 py-2 text-[13px] font-semibold text-danger-fg transition-colors duration-fast hover:bg-sand-100">
                {L.remove}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-sand-300 bg-sand-50/60 px-3 py-2.5">
          <span className="text-[12.5px] text-sand-600">🎥 {L.signin}</span>
          <Link href="/login?next=/guide/tour" className="rounded-[10px] bg-green-800 px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-colors duration-fast hover:bg-green-700">
            Sign in
          </Link>
        </div>
      )}

      {/* localized scene content */}
      <div key={`${scene.id}-text`} className="mt-4 animate-rise">
        <h2 className="font-serif text-xl font-semibold text-sand-ink">{scene.title}</h2>
        <div className="text-[13.5px] font-medium text-accent-600">{scene.subtitle}</div>
        <p className="mt-2 max-w-[60ch] text-[14.5px] leading-relaxed text-sand-700">{scene.desc}</p>
        <div className="mt-3">
          <ListenButton audioSrc={scene.narrationSrc} text={scene.desc} lang={lang} />
        </div>
      </div>

      {/* scene selector */}
      <div className="mt-5 flex flex-wrap gap-2">
        {scenes.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIdx(i)}
            aria-pressed={i === idx}
            className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors duration-fast active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-focus ${
              i === idx ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-700 hover:bg-sand-50'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>
    </ScreenFrame>
  );
}
