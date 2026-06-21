'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { ui } from './i18n';
import { DictateButton } from './DictateButton';
import { deleteMyDuaAction, listMyDuasAction, saveMyDuaAction, togglePinDuaAction } from './personal-duas-actions';
import type { PersonalDua } from './personal-duas-types';

const LANGS: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'ur', label: 'اردو' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'de', label: 'Deutsch' },
];
const isRtl = (c: string): boolean => c === 'ar' || c === 'ur';

export function PersonalDuaPanel({ stepKey, uiLang = 'en', signedIn = false }: { stepKey: string; uiLang?: string; signedIn?: boolean }) {
  const [list, setList] = useState<PersonalDua[]>([]);
  const [text, setText] = useState('');
  const [translit, setTranslit] = useState('');
  const [meaning, setMeaning] = useState('');
  const [note, setNote] = useState('');
  const [lang, setLang] = useState('en');
  const [editingId, setEditingId] = useState<string | undefined>();
  const [pending, start] = useTransition();

  const clearForm = (): void => {
    setText(''); setTranslit(''); setMeaning(''); setNote(''); setEditingId(undefined);
  };
  const reload = (): void => {
    listMyDuasAction(stepKey).then(setList).catch(() => setList([]));
  };

  useEffect(() => {
    if (signedIn) reload();
    else setList([]);
    clearForm();
  }, [stepKey, signedIn]);

  if (!signedIn) {
    return (
      <div className="mt-4 rounded-2xl border border-sand-200 bg-sand-50 p-4 text-center">
        <div className="text-[13px] font-bold text-sand-ink">📿 {ui(uiLang).myDuas}</div>
        <p className="mt-1 text-[12.5px] text-sand-500">Sign in to write and save your personal du‘as for this step.</p>
        <Link href="/login?next=/guide" className="mt-3 inline-block rounded-xl bg-green-800 px-5 py-2 text-[13px] font-semibold text-white hover:bg-green-700">Sign in to save</Link>
      </div>
    );
  }

  const submit = (): void =>
    start(async () => {
      const saved = await saveMyDuaAction({ id: editingId, stepKey, text, lang, translit: translit.trim() || undefined, meaning: meaning.trim() || undefined, note: note.trim() || undefined });
      if (!saved) return;
      clearForm();
      reload();
    });
  const edit = (d: PersonalDua): void => {
    setEditingId(d.id); setText(d.text); setLang(d.lang); setTranslit(d.translit ?? ''); setMeaning(d.meaning ?? ''); setNote(d.note ?? '');
  };
  const remove = (id: string): void => start(async () => { await deleteMyDuaAction(id); if (editingId === id) clearForm(); reload(); });
  const pin = (id: string): void => start(async () => { await togglePinDuaAction(id); reload(); });
  const download = (): void => {
    start(async () => {
      const all = await listMyDuasAction();
      if (typeof window === 'undefined') return;
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'my-umrah-duas.json'; a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="mt-4 rounded-2xl border border-sand-200 bg-sand-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[13px] font-bold text-sand-ink">📿 {ui(uiLang).myDuas}</div>
        {list.length > 0 ? <button type="button" onClick={download} className="text-[12px] font-semibold text-accent-600 hover:underline">Export all</button> : null}
      </div>
      <p className="mt-0.5 text-[12px] text-sand-500">Write your own du‘a or intention for this step. Saved to your account.</p>

      <div className="mt-3 rounded-xl border border-sand-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11.5px] text-sand-500">Type or speak your du‘a</span>
          <DictateButton lang={lang} onText={(t) => setText((p) => (p ? `${p} ${t}` : t))} />
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} dir={isRtl(lang) ? 'rtl' : 'ltr'} rows={3} placeholder="Write your du‘a, intention, or a name to pray for…" className={`w-full rounded-lg border-[1.5px] border-sand-300 px-3 py-2 text-[14px] focus:border-green-700 focus:outline-none ${isRtl(lang) ? 'text-right font-arabic' : ''}`} />
        <input value={translit} onChange={(e) => setTranslit(e.target.value)} placeholder="Transliteration (optional)" className="mt-2 w-full rounded-lg border-[1.5px] border-sand-300 px-3 py-2 text-[13.5px] italic focus:border-green-700 focus:outline-none" />
        <input value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="Meaning / translation (optional)" className="mt-2 w-full rounded-lg border-[1.5px] border-sand-300 px-3 py-2 text-[13.5px] focus:border-green-700 focus:outline-none" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Family names / personal note (optional)" className="mt-2 w-full rounded-lg border-[1.5px] border-sand-300 px-3 py-2 text-[13.5px] focus:border-green-700 focus:outline-none" />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-lg border border-sand-300 bg-white px-2 py-1.5 text-[12.5px] font-semibold text-sand-700">
            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button type="button" onClick={submit} disabled={!text.trim() || pending} className="rounded-lg bg-green-800 px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-green-700 active:scale-[0.98] disabled:opacity-40">{editingId ? 'Update' : 'Save du‘a'}</button>
          {editingId ? <button type="button" onClick={clearForm} className="rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-[13px] font-semibold text-sand-600 hover:bg-sand-100">Cancel</button> : null}
        </div>
      </div>

      {list.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {list.map((d) => {
            const rtl = isRtl(d.lang);
            return (
              <li key={d.id} className="rounded-xl border border-sand-200 bg-white p-3">
                <p dir={rtl ? 'rtl' : 'ltr'} className={`text-[14px] leading-relaxed text-sand-ink ${rtl ? 'text-right font-arabic' : ''}`}>{d.pinned ? '📌 ' : ''}{d.text}</p>
                {d.translit ? <p className="mt-1 text-[12.5px] italic text-sand-600">{d.translit}</p> : null}
                {d.meaning ? <p className="mt-0.5 text-[12.5px] text-sand-600">“{d.meaning}”</p> : null}
                {d.note ? <p className="mt-1 text-[11.5px] text-sand-500">📝 {d.note}</p> : null}
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px]">
                  <span className="uppercase tracking-wider text-sand-400">{d.lang}</span>
                  <button type="button" onClick={() => pin(d.id)} className="font-semibold text-sand-600 hover:text-green-800">{d.pinned ? 'Unpin' : 'Pin'}</button>
                  <button type="button" onClick={() => edit(d)} className="font-semibold text-accent-600 hover:underline">Edit</button>
                  <button type="button" onClick={() => remove(d.id)} className="font-semibold text-danger-fg hover:underline">Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
