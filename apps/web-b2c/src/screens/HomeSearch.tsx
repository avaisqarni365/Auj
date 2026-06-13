import type { SearchCriteria } from '@auj/contracts';
import { Button, Select } from '@auj/ui';
import { t, type Locale } from '../i18n';
import { Logo, Wordmark } from './Brand';

export interface HomeSearchProps {
  locale: Locale;
  criteria: SearchCriteria;
  onCity: (city: SearchCriteria['city']) => void;
  onPax: (pax: number) => void;
  onSearch: () => void;
}

const TABS = ['Umrah', 'Hajj', 'Ziyarat'];

const POPULAR = [
  { name: 'Umrah Premium', meta: '5★ hotel · near Haram', price: '€2,480', img: 'from-green-600 to-green-900', visa: 'e-Visa', vfg: 'text-success-fg' },
  { name: 'Iraq Ziyarat', meta: 'Najaf & Karbala', price: '€2,120', img: 'from-accent-500 to-accent-700', visa: 'Agent', vfg: 'text-info-fg' },
];

export function HomeSearch({ locale, criteria, onCity, onPax, onSearch }: HomeSearchProps) {
  return (
    <div className="min-h-screen bg-sand-50 pb-8">
      {/* app bar */}
      <div className="flex items-center justify-between px-5 pb-1 pt-4">
        <div className="flex items-center gap-2">
          <Logo />
          <Wordmark />
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 bg-white px-2.5 py-1 text-[13px] font-semibold text-sand-700">
            🌐 {locale.toUpperCase()}
          </span>
          <span className="text-[22px] leading-none text-sand-700">☰</span>
        </div>
      </div>

      {/* hero */}
      <div className="px-5 pb-1 pt-4">
        <h1 className="font-serif text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-sand-ink">
          Begin a sacred journey, with calm.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-sand-500">
          Umrah, Hajj &amp; Ziyarat from across the EU — hotel, transport, ground &amp; flights in one place.
        </p>
      </div>

      {/* search card */}
      <div className="mx-4 mt-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
        <div className="mb-3.5 flex gap-1 rounded-[11px] bg-sand-100 p-1">
          {TABS.map((tab, i) => (
            <span
              key={tab}
              className={
                i === 0
                  ? 'flex-1 rounded-lg bg-white py-2 text-center text-[13px] font-semibold text-green-800 shadow-sm'
                  : 'flex-1 py-2 text-center text-[13px] font-semibold text-sand-500'
              }
            >
              {tab}
            </span>
          ))}
        </div>
        <div className="mb-2.5 grid grid-cols-2 gap-2.5">
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase text-sand-500">From</div>
            <div className="flex items-center justify-between rounded-lg border-[1.5px] border-sand-300 px-3 py-2.5 text-sm font-medium">
              Vilnius <span className="text-sand-500">▾</span>
            </div>
          </div>
          <Select label="Destination" value={criteria.city} onChange={(e) => onCity(e.target.value as SearchCriteria['city'])}>
            <option value="MAKKAH">Makkah</option>
            <option value="MADINAH">Madinah</option>
            <option value="JEDDAH">Jeddah</option>
          </Select>
        </div>
        <div className="mb-2.5">
          <div className="mb-1.5 text-[11px] font-medium uppercase text-sand-500">Dates</div>
          <div className="flex items-center gap-2 rounded-lg border-[1.5px] border-sand-300 px-3 py-2.5 text-sm font-medium">
            <span className="text-accent-600">📅</span> 12 – 26 Sep 2026 · 14 nights
          </div>
        </div>
        <div className="mb-3.5">
          <div className="mb-1.5 text-[11px] font-medium uppercase text-sand-500">{t(locale, 'pilgrims')}</div>
          <div className="flex items-center justify-between rounded-lg border-[1.5px] border-sand-300 px-2 py-1.5">
            <button type="button" aria-label="Decrease" onClick={() => onPax(Math.max(1, criteria.pax - 1))} className="h-[30px] w-[30px] rounded-md border border-sand-200 bg-sand-50 text-[17px] text-green-700">
              −
            </button>
            <span className="text-sm font-semibold">{criteria.pax} pilgrims</span>
            <button type="button" aria-label="Increase" onClick={() => onPax(Math.min(49, criteria.pax + 1))} className="h-[30px] w-[30px] rounded-md bg-green-800 text-[17px] text-white">
              +
            </button>
          </div>
        </div>
        <Button className="w-full !py-3.5 text-[15px] shadow-[0_6px_16px_rgba(15,81,50,0.25)]" onClick={onSearch}>
          {t(locale, 'search')}
        </Button>
      </div>

      {/* popular rail */}
      <div className="flex items-center justify-between px-5 pb-1.5 pt-5">
        <span className="text-[15px] font-semibold text-sand-ink">Popular from Vilnius</span>
        <span className="text-[13px] font-semibold text-accent-600">See all</span>
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-4 pt-1">
        {POPULAR.map((p) => (
          <div key={p.name} className="w-[200px] shrink-0 overflow-hidden rounded-2xl border border-sand-200 bg-white">
            <div className={`relative h-[104px] bg-gradient-to-br ${p.img}`}>
              <span className={`absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold ${p.vfg}`}>{p.visa}</span>
            </div>
            <div className="px-3 py-2.5">
              <div className="text-sm font-semibold">{p.name}</div>
              <div className="mb-2 mt-0.5 text-xs text-sand-500">{p.meta}</div>
              <div className="font-mono text-[15px] font-semibold text-green-800">{p.price}</div>
            </div>
          </div>
        ))}
      </div>

      {/* trust strip */}
      <div className="mx-4 mb-5 flex justify-between gap-4 rounded-xl bg-green-100 px-4 py-3">
        {[
          { icon: '🛡️', label: 'Licensed operator' },
          { icon: '🪪', label: 'e-Visa guidance' },
          { icon: '☎️', label: '24/7 support' },
        ].map((it) => (
          <div key={it.label} className="text-center">
            <div className="text-base">{it.icon}</div>
            <div className="mt-0.5 text-[11px] font-semibold text-success-fg">{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
