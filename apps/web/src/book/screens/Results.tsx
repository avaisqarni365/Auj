import { useMemo, useState, type ReactNode } from 'react';
import type { HotelOffer, SearchCriteria } from '@auj/contracts';
import { Button, StatusPill } from '@auj/ui';
import { formatMoney } from '../fx';
import { t, type Locale } from '../i18n';
import { Scene } from '../../components/Scene';
import type { SceneName } from '../../scenes';

/** Themed scene by destination city (real hotel photography drops in via the scenes manifest). */
function sceneForCity(city: string): SceneName {
  return city.toUpperCase() === 'MADINAH' ? 'madinah' : 'makkah';
}

type Sort = 'recommended' | 'distance' | 'price';
const SORT_LABEL: Record<Sort, string> = { recommended: 'Recommended', distance: 'Distance to Haram', price: 'Price' };

function sortOffers(offers: HotelOffer[], sort: Sort): HotelOffer[] {
  if (sort === 'recommended') return offers;
  const copy = [...offers];
  if (sort === 'distance') {
    return copy.sort((a, b) => (a.distanceToHaramM ?? Infinity) - (b.distanceToHaramM ?? Infinity));
  }
  return copy.sort((a, b) => a.nightlyNet.amount - b.nightlyNet.amount);
}

export interface ResultsProps {
  locale: Locale;
  criteria: SearchCriteria;
  offers: HotelOffer[];
  onBuild: (offer: HotelOffer) => void;
  onBack?: () => void;
}

const GRADIENTS = ['from-green-600 to-green-900', 'from-accent-500 to-accent-700', 'from-green-700 to-green-950'];

export function Results({ locale, criteria, offers, onBuild, onBack }: ResultsProps) {
  const [sort, setSort] = useState<Sort>('recommended');
  const sorted = useMemo(() => sortOffers(offers, sort), [offers, sort]);
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="sticky top-0 z-10 bg-sand-50/90 px-5 pt-3 backdrop-blur">
        <div className="flex items-center justify-between pb-2.5">
          <button type="button" aria-label="Back" onClick={onBack} className="text-xl text-sand-700">
            ←
          </button>
          <div className="text-center">
            <div className="text-sm font-semibold capitalize">{`Umrah · ${criteria.city.toLowerCase()}`}</div>
            <div className="text-xs text-sand-500">{criteria.pax} pilgrims</div>
          </div>
          <span className="text-[13px] font-semibold text-accent-600">Edit</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3">
          <span className="shrink-0 rounded-full bg-green-800 px-3 py-1.5 text-xs font-semibold text-white">⚙ Filters · 2</span>
          <button
            type="button"
            aria-pressed={sort === 'distance'}
            onClick={() => setSort((s) => (s === 'distance' ? 'recommended' : 'distance'))}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${sort === 'distance' ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 bg-white text-sand-700'}`}
          >
            🕋 Near Haram
          </button>
          {['≤ €2,500', '5★ hotels'].map((f) => (
            <span key={f} className="shrink-0 rounded-full border border-sand-300 bg-white px-3 py-1.5 text-xs font-semibold text-sand-700">
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-2 pt-1">
        <span className="text-[13px] text-sand-500">
          <strong className="text-sand-ink">{offers.length} packages</strong> found
        </span>
        <label className="flex items-center gap-1.5 text-[13px] font-semibold text-sand-700">
          Sort:
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-sand-300 bg-white px-1.5 py-1 text-[13px] font-semibold text-sand-700"
          >
            {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
              <option key={s} value={s}>{SORT_LABEL[s]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 px-4 pb-6 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((o, i) => (
          <div key={o.id} className="overflow-hidden rounded-[18px] border border-sand-200 bg-white shadow-sm">
            <div className={`relative h-[130px] overflow-hidden bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}>
              <Scene name={sceneForCity(criteria.city)} className="absolute inset-0 h-full w-full object-cover" />
              {o.nusukApproved ? (
                <span className="absolute left-2.5 top-2.5">
                  <StatusPill tone="success">Nusuk</StatusPill>
                </span>
              ) : null}
              <span className="absolute right-2.5 top-2.5 rounded-[10px] bg-white/90 px-1.5 py-1 text-lg">♡</span>
            </div>
            <div className="px-4 pb-4 pt-3.5">
              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <div className="text-base font-semibold leading-tight">{o.name}</div>
                  <div className="mt-0.5 text-xs text-warning">{'★'.repeat(o.starRating)}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-lg font-semibold text-green-800">{formatMoney(o.nightlyNet)}</div>
                  <div className="text-[11px] text-sand-500">{t(locale, 'per_pilgrim')}</div>
                </div>
              </div>
              <div className="my-3 flex flex-wrap gap-1.5">
                {o.distanceToHaramM != null ? <Chip>🕋 {o.distanceToHaramM} m to Haram</Chip> : null}
                {o.nusukApproved ? <Chip>✓ Nusuk-approved</Chip> : null}
                <Chip>🚌 Transfers</Chip>
              </div>
              <div className="flex gap-2.5">
                <Button variant="secondary" size="sm" className="flex-1 !py-2.5">
                  Details
                </Button>
                <Button size="sm" className="flex-[1.4] !py-2.5" onClick={() => onBuild(o)}>
                  {t(locale, 'build_package')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-[7px] bg-sand-100 px-2.5 py-1 text-[11.5px] text-sand-700">{children}</span>;
}
