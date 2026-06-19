'use client';

import { useEffect, useState } from 'react';
import { deleteDua, exportDuas, listDuas, saveDua, togglePin, type PersonalDua } from './personal-duas-store';
import { ui } from './i18n';

const LANGS: { code: string; label: string; rtl?: boolean }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية', rtl: true },
  { code: 'ur', label: 'اردو', rtl: true },
  { code: 'tr', label: 'Türkçe' },
  { code: 'de', label: 'Deutsch' },
];

const isRtl = (code: string): boolean => code === 'ar' || code === 'ur';

export function PersonalDuaPanel({ stepKey, uiLang = 'en' }: { stepKey: string; uiLang?: string }) {
  const [list, setList] = useState<PersonalDua[]>([]);
  const [text, setText] = useState('');
  const [translit, setTranslit] = useState('');
  const [meaning, setMeaning] = useState('');
  const [note, setNote] = useState('');
  const [lang, setLang] = useState('en');
  const [editingId, setEditingId] = useState<string | undefined>();

  const reload = (): void => setList(listDuas(stepKey));

  const clearForm = (): void => {
    setText('');
    setTranslit('');
    setMeaning('');
    setNote('');
    setEditingId(undefined);
  };

  useEffect(() => {
    reload();
    clearForm();
  }, [stepKey]);

  const submit = (): void => {
    const saved = saveDua({
      id: editingId,
      stepKey,
      text,
      lang,
      translit: translit.trim() || undefined,
      meaning: meaning.trim() || undefined,
      note: note.trim() || undefined,
    });
    if (!saved) return;
    clearForm();
    reload();
  };

  const edit = (d: PersonalDua): void => {
    setEditingId(d.id);
    setText(d.text);
    setLang(d.lang);
    setTranslit(d.translit ?? '');
    setMeaning(d.meaning ?? '');
    setNote(d.note ?? '');
  };

  const remove = (id: string): void => {
    deleteDua(id);
    if (editingId === id) clearForm();
    reload();
  };

  const pin = (id: string): void => {
    togglePin(id);
    reload();
  };

  const download = (): void => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([exportDuas()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-umrah-duas.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 rounded-2xl border border-sand-200 bg-sand-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[13px] font-bold text-sand-ink">📿 {ui(uiLang).myDuas}</div>
        {listDuas().length > 0 ? (
          <button type="button" onClick={download} className="text-[12px] font-semibold text-accent-600 hover:underline">
            Export all
          </button>
        ) : null}
      </div>
      <p className="mt-0.5 text-[12px] text-sand-500">Write your own du‘a or intention for this step, in your language. Saved privately on this device.</p>

      <div className="mt-3 rounded-xl border border-sand-200 bg-white p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          dir={isRtl(lang) ? 'rtl' : 'ltr'}
          rows={3}
          placeholder="Write your du‘a, intention, or a name to pray for…"
          className={`w-full rounded-lg border-[1.5px] border-sand-300 px-3 py-2 text-[14px] focus:border-green-700 focus:outline-none ${isRtl(lang) ? 'text-right font-arabic' : ''}`}
        />
        <input value={translit} onChange={(e) => setTranslit(e.target.value)} placeholder="Transliteration (optional)" className="mt-2 w-full rounded-lg border-[1.5px] border-sand-300 px-3 py-2 text-[13.5px] italic focus:border-green-700 focus:outline-none" />
        <input value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="Meaning / translation (optional)" className="mt-2 w-full rounded-lg border-[1.5px] border-sand-300 px-3 py-2 text-[13.5px] focus:border-green-700 focus:outline-none" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Family names / personal note (optional)" className="mt-2 w-full rounded-lg border-[1.5px] border-sand-300 px-3 py-2 text-[13.5px] focus:border-green-700 focus:outline-none" />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-lg border border-sand-300 bg-white px-2 py-1.5 text-[12.5px] font-semibold text-sand-700"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim()}
            className="rounded-lg bg-green-800 px-4 py-1.5 text-[13px] font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-40"
          >
            {editingId ? 'Update' : 'Save du‘a'}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={clearForm}
              className="rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-[13px] font-semibold text-sand-600 hover:bg-sand-100"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      {list.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {list.map((d) => {
            const rtl = isRtl(d.lang);
            return (
              <li key={d.id} className="rounded-xl border border-sand-200 bg-white p-3">
                <p dir={rtl ? 'rtl' : 'ltr'} className={`text-[14px] leading-relaxed text-sand-ink ${rtl ? 'text-right font-arabic' : ''}`}>
                  {d.pinned ? '📌 ' : ''}
                  {d.text}
                </p>
                {d.translit ? <p className="mt-1 text-[12.5px] italic text-sand-600">{d.translit}</p> : null}
                {d.meaning ? <p className="mt-0.5 text-[12.5px] text-sand-600">“{d.meaning}”</p> : null}
                {d.note ? <p className="mt-1 text-[11.5px] text-sand-500">📝 {d.note}</p> : null}
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px]">
                  <span className="uppercase tracking-wider text-sand-400">{d.lang}</span>
                  <button type="button" onClick={() => pin(d.id)} className="font-semibold text-sand-600 hover:text-green-800">
                    {d.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button type="button" onClick={() => edit(d)} className="font-semibold text-accent-600 hover:underline">
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(d.id)} className="font-semibold text-danger-fg hover:underline">
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
