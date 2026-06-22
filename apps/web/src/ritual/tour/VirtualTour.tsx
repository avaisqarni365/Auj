'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { ScreenFrame } from '../../components/ScreenFrame';
import { tourChrome, tourScenes } from './scenes';
import { RITUAL_LOCALES, isRtlLang, ui } from '../i18n';
import { useRitualLang } from '../useRitualLang';
import { ListenButton } from '../ListenButton';
import { deleteTourVideoAction, saveTourVideoAction } from './tour-video-actions';
import type { ContentOverrides } from '../content-overrides';

// Personal step-video panel + du'a copy, localized (from AUJ Virtual Tour.dc.html).
const VL: Record<string, { your: string; ph: string; add: string; replace: string; remove: string; signin: string; hint: string; step: string; of: string; duaTitle: string; noDua: string; dua: string; walk: string }> = {
  en: { your: 'Your video', ph: 'Paste a video link (YouTube, Vimeo, MP4)', add: 'Add link', replace: 'Replace', remove: 'Remove', signin: 'Sign in to add your own video for each step', hint: 'Attach your own clip — it plays here and only you see it.', step: 'Step', of: 'of', duaTitle: "DU'A FOR THIS STEP", noDua: 'There is no fixed du‘a for this step — make your own heartfelt supplication, and send blessings upon the Prophet ﷺ.', dua: "Du'a", walk: 'Play virtual walk' },
  ar: { your: 'الفيديو الخاص بك', ph: 'الصق رابط فيديو (YouTube، Vimeo، MP4)', add: 'إضافة رابط', replace: 'استبدال', remove: 'إزالة', signin: 'سجّل الدخول لإضافة الفيديو الخاص بك لكل خطوة', hint: 'أضف مقطعك الخاص — يظهر هنا وتراه أنت وحدك.', step: 'خطوة', of: 'من', duaTitle: 'دعاء هذه الخطوة', noDua: 'لا يوجد دعاء محدّد لهذه الخطوة — ادعُ بما في قلبك وصلِّ على النبي ﷺ.', dua: 'دعاء', walk: 'تشغيل الجولة' },
  ur: { your: 'آپ کی ویڈیو', ph: 'ویڈیو لنک پیسٹ کریں (YouTube، Vimeo، MP4)', add: 'لنک شامل کریں', replace: 'تبدیل کریں', remove: 'ہٹائیں', signin: 'ہر مرحلے کے لیے اپنی ویڈیو شامل کرنے کے لیے سائن اِن کریں', hint: 'اپنی ویڈیو لگائیں — یہ یہاں چلے گی اور صرف آپ دیکھیں گے۔', step: 'مرحلہ', of: 'از', duaTitle: 'اس مرحلے کی دعا', noDua: 'اس مرحلے کے لیے کوئی مقررہ دعا نہیں — اپنے دل سے دعا کریں اور نبی ﷺ پر درود بھیجیں۔', dua: 'دعا', walk: 'ورچوئل سیر چلائیں' },
  tr: { your: 'Senin videon', ph: 'Bir video bağlantısı yapıştır (YouTube, Vimeo, MP4)', add: 'Bağlantı ekle', replace: 'Değiştir', remove: 'Kaldır', signin: 'Her adıma kendi videonu eklemek için giriş yap', hint: 'Kendi klibini ekle — burada oynar ve yalnızca sen görürsün.', step: 'Adım', of: '/', duaTitle: 'BU ADIM İÇİN DUA', noDua: 'Bu adım için sabit bir dua yoktur — kendi içten duanı et ve Peygamber’e ﷺ salât getir.', dua: 'Dua', walk: 'Sanal turu oynat' },
  de: { your: 'Dein Video', ph: 'Videolink einfügen (YouTube, Vimeo, MP4)', add: 'Link hinzufügen', replace: 'Ersetzen', remove: 'Entfernen', signin: 'Melde dich an, um dein eigenes Video je Schritt hinzuzufügen', hint: 'Füge deinen eigenen Clip hinzu — er läuft hier und nur du siehst ihn.', step: 'Schritt', of: 'von', duaTitle: 'BITTGEBET FÜR DIESEN SCHRITT', noDua: 'Für diesen Schritt gibt es kein festes Bittgebet — sprich dein eigenes und sende Segen auf den Propheten ﷺ.', dua: 'Bittgebet', walk: 'Virtuellen Rundgang abspielen' },
};
const vl = (lang: string) => VL[lang] ?? VL.en!;

function embed(url: string): { kind: 'iframe' | 'video'; url: string } {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) return { kind: 'iframe', url: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(\d+)/i);
  if (vm) return { kind: 'iframe', url: `https://player.vimeo.com/video/${vm[1]}` };
  return { kind: 'video', url };
}

export function VirtualTour({ overrides = {}, signedIn = false, initialVideos = {} }: { overrides?: ContentOverrides; signedIn?: boolean; initialVideos?: Record<string, string> }) {
  const [lang, setLang] = useRitualLang();
  const rtl = isRtlLang(lang);
  const chrome = tourChrome(lang);
  const L = vl(lang);
  const localize = (l: string) =>
    tourScenes(l).map((s) => {
      const o = overrides[`tour:${s.id}`]?.[l] ?? {};
      return { ...s, title: o.title?.trim() || s.title, subtitle: o.subtitle?.trim() || s.subtitle, desc: o.intro?.trim() || s.desc };
    });
  const scenes = localize(lang);
  const arScenes = localize('ar');
  const total = scenes.length;
  const [idx, setIdx] = useState(0);
  const scene = scenes[idx] ?? scenes[0];
  const ar = arScenes[idx] ?? arScenes[0];

  const [videos, setVideos] = useState<Record<string, string>>(initialVideos);
  const [draft, setDraft] = useState('');
  const [, startSave] = useTransition();
  const [showDua, setShowDua] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { setPlaying(false); setShowDua(false); }, [idx]);

  if (!scene || !ar) return null;
  const personal = videos[scene.id];
  const num = String(idx + 1).padStart(2, '0');

  const addVideo = (): void => {
    const url = draft.trim();
    if (!url) return;
    const sid = scene.id;
    setVideos((v) => ({ ...v, [sid]: url }));
    setDraft('');
    startSave(async () => { await saveTourVideoAction(sid, url); });
  };
  const removeVideo = (): void => {
    const sid = scene.id;
    setVideos((v) => { const n = { ...v }; delete n[sid]; return n; });
    startSave(async () => { await deleteTourVideoAction(sid); });
  };

  return (
    <ScreenFrame label={ui(lang).virtualTour} tag={`${num} / ${String(total).padStart(2, '0')}`} dir={rtl ? 'rtl' : 'ltr'} maxWidth="max-w-[1000px]" bodyClassName="p-[clamp(16px,3vw,28px)]">
      {/* header + guide link */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[clamp(24px,3.4vw,34px)] font-semibold tracking-[-0.02em] text-sand-ink">{ui(lang).virtualTour}</h1>
          <p className="mt-1 text-[14.5px] text-sand-500">{chrome.subtitle}</p>
        </div>
        <Link href="/guide" className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-green-700 transition-colors duration-fast hover:border-green-500 hover:bg-green-50">
          {chrome.back} →
        </Link>
      </div>

      {/* language switcher */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-sand-200 bg-sand-50/60 px-3 py-2.5">
        <span className="text-[12.5px] font-semibold text-sand-500">🌐 {RITUAL_LOCALES.find((l) => l.code === lang)?.label ?? 'Language'}</span>
        <div className="flex flex-wrap gap-1.5">
          {RITUAL_LOCALES.filter((l) => l.code !== 'lt').map((l) => (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              onClick={() => setLang(l.code)}
              className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-fast ${lang === l.code ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-700 hover:border-green-500'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* numbered stepper */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {scenes.map((s, i) => (
          <button
            key={s.id}
            type="button"
            title={s.title}
            onClick={() => setIdx(i)}
            className={`grid h-[34px] w-[34px] place-items-center rounded-full border-2 font-mono text-[13px] font-semibold transition-colors duration-fast ${
              i === idx ? 'border-green-800 bg-green-800 text-white' : i < idx ? 'border-green-500 bg-green-100 text-green-800' : 'border-sand-300 bg-white text-sand-500 hover:border-green-500'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* step header */}
      <div key={`${scene.id}-head`} className="animate-rise mb-3.5 flex flex-wrap items-center gap-3.5">
        <span className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-2xl bg-green-800 font-mono text-[23px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(15,81,50,0.5)]">{num}</span>
        <div className="min-w-[180px] flex-1" dir={rtl ? 'rtl' : 'ltr'}>
          <h2 className="font-serif text-[clamp(20px,2.6vw,27px)] font-semibold leading-[1.18] tracking-[-0.02em] text-sand-ink">{scene.title}</h2>
          <div className="mt-0.5 text-[14.5px] font-semibold text-gold">{scene.subtitle}</div>
        </div>
        <div className="flex gap-2">
          <ListenButton audioSrc={scene.narrationSrc} text={scene.desc} lang={lang} />
          <button type="button" onClick={() => setShowDua((d) => !d)} className={`inline-flex items-center gap-2 rounded-xl border-[1.5px] px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors duration-fast ${showDua ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-green-800 hover:bg-green-50'}`}>
            ❤ {L.dua}
          </button>
        </div>
      </div>

      {/* lead body */}
      <p key={`${scene.id}-body`} dir={rtl ? 'rtl' : 'ltr'} className="animate-rise mb-4 max-w-[760px] text-[15.5px] leading-relaxed text-sand-700">{scene.desc}</p>

      {/* dark virtual screen: media + bilingual text */}
      <div className="grid overflow-hidden rounded-[18px] border border-sand-200 shadow-[0_26px_60px_-30px_rgba(42,38,32,0.5)] md:grid-cols-2">
        {/* media side */}
        <div className="relative min-h-[300px] overflow-hidden bg-green-950">
          <img src={scene.src} alt="" aria-hidden onError={(e) => { (e.currentTarget as HTMLImageElement).src = scene.fallbackSrc; }} className="absolute inset-[-7%] h-[114%] w-[114%] object-cover blur-xl brightness-50" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-green-950/50 to-green-900/70" />
          {personal ? (
            embed(personal).kind === 'iframe' ? (
              <iframe src={embed(personal).url} title={L.your} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 z-10 h-full w-full border-0 bg-black" />
            ) : (
              <video controls src={embed(personal).url} className="absolute inset-0 z-10 h-full w-full bg-black object-cover" />
            )
          ) : playing ? (
            <video autoPlay controls poster={scene.fallbackSrc} src={scene.videoSrc} onError={() => setPlaying(false)} className="absolute inset-0 z-10 h-full w-full bg-black object-cover" />
          ) : (
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
              <span className="self-start rounded-full bg-green-950/55 px-3 py-1.5 font-mono text-[10.5px] tracking-[0.12em] text-green-50 backdrop-blur">VIDEO · {num} / {String(total).padStart(2, '0')}</span>
              <button type="button" onClick={() => setPlaying(true)} aria-label={L.walk} className="absolute inset-0 m-auto grid h-[74px] w-[74px] place-items-center rounded-full bg-green-800/90 shadow-[0_14px_34px_rgba(0,0,0,0.4)] transition-transform duration-fast hover:scale-105">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M8 5v14l11-7z" /></svg>
              </button>
              <span className="self-start font-mono text-[11px] text-white/70">{chrome.hint}</span>
            </div>
          )}
        </div>

        {/* bilingual text side */}
        <div className="flex flex-col gap-3.5 bg-green-900 p-[clamp(18px,2.4vw,26px)]">
          <div className="flex items-center gap-2.5">
            <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-white/15 bg-green-800 font-mono text-lg font-semibold text-white">{num}</span>
            <div className="font-mono text-[10.5px] tracking-[0.12em] text-gold">{L.step.toUpperCase()} {idx + 1} {L.of.toUpperCase()} {total}</div>
          </div>
          {/* Arabic — always */}
          <div dir="rtl" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-gold">{ar.subtitle}</span>
              <span className="rounded-md bg-green-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-green-800">AR</span>
            </div>
            <h3 className="mb-2 font-serif text-[clamp(20px,2.4vw,26px)] font-semibold leading-[1.4] text-white">{ar.title}</h3>
            <p className="text-[clamp(14px,1.5vw,16px)] leading-[1.8] text-white/90">{ar.desc}</p>
          </div>
          {/* chosen language — when not Arabic */}
          {lang !== 'ar' ? (
            <div dir={rtl ? 'rtl' : 'ltr'} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-gold">{scene.subtitle}</span>
                <span className="rounded-md bg-green-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-green-800">{lang}</span>
              </div>
              <h3 className="mb-1.5 font-serif text-[clamp(18px,2.2vw,23px)] font-semibold leading-tight text-white">{scene.title}</h3>
              <p className="text-[clamp(13.5px,1.5vw,16px)] leading-relaxed text-white/90">{scene.desc}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* big walk button */}
      <button type="button" onClick={() => setPlaying((p) => !p)} className="mt-3.5 flex w-full items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-green-700/30 bg-green-50 px-4 py-3.5 text-[14.5px] font-semibold text-green-800 transition-colors duration-fast hover:bg-green-100">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>{playing ? <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></> : <path d="M8 5v14l11-7z" />}</svg>
        {L.walk}
      </button>

      {/* du'a panel */}
      {showDua ? (
        <div className="relative mt-4 overflow-hidden rounded-[18px] border border-green-800 bg-gradient-to-br from-green-900 to-green-950 p-[clamp(18px,3vw,26px)] text-green-50">
          <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(200,162,74,0.18),transparent_70%)]" />
          <div className="relative font-mono text-xs tracking-[0.1em] text-gold">{L.duaTitle}</div>
          <p dir={rtl ? 'rtl' : 'ltr'} className="relative mt-3 text-[15px] leading-relaxed text-green-100/90">{L.noDua}</p>
        </div>
      ) : null}

      {/* personal step-video */}
      {signedIn ? (
        <div className="mt-4 rounded-2xl border border-sand-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-green-100 text-green-800">🎥</span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-sand-ink">{L.your}</div>
              <div className="text-[12.5px] text-sand-500">{L.hint}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={L.ph} dir="ltr" className="min-w-0 flex-1 rounded-[11px] border-[1.5px] border-sand-300 bg-white px-3 py-2.5 text-[13.5px] focus:border-green-700 focus:outline-none" />
            <button type="button" onClick={addVideo} className="rounded-[11px] bg-green-800 px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors duration-fast hover:bg-green-700">{personal ? L.replace : L.add}</button>
            {personal ? <button type="button" onClick={removeVideo} className="rounded-[11px] border border-sand-300 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-danger-fg hover:bg-sand-100">{L.remove}</button> : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-sand-300 bg-sand-50/60 px-4 py-3">
          <span className="text-[12.5px] text-sand-600">🎥 {L.signin}</span>
          <Link href="/login?next=/guide/tour" className="rounded-[11px] bg-green-800 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-green-700">Sign in</Link>
        </div>
      )}

      {/* prev / next */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-sand-300 bg-white px-5 py-3 text-sm font-semibold text-green-800 transition-colors hover:bg-sand-50 disabled:cursor-default disabled:text-sand-300">
          ‹ {idx > 0 ? scenes[idx - 1]?.title : ''}
        </button>
        <button type="button" onClick={() => setIdx((i) => Math.min(total - 1, i + 1))} disabled={idx === total - 1} className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,81,50,0.26)] transition-colors hover:bg-green-700 disabled:cursor-default disabled:bg-sand-300">
          {idx < total - 1 ? scenes[idx + 1]?.title : 'Done'} <span aria-hidden>→</span>
        </button>
      </div>
    </ScreenFrame>
  );
}
