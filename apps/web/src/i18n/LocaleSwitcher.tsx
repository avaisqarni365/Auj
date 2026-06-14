'use client';

import { LOCALES, LOCALE_LABELS } from './locales';
import { setLocaleAction } from './actions';

/** Language picker — submits a server action that sets the cookie and re-renders the app. */
export function LocaleSwitcher({ current }: { current: string }) {
  return (
    <form action={setLocaleAction}>
      <select
        name="locale"
        defaultValue={current}
        aria-label="Language"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-sand-200 bg-white px-2.5 py-2 text-[13.5px] font-semibold text-sand-700 hover:bg-sand-100"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            🌐 {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </form>
  );
}
