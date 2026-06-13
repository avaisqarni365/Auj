import type { Money } from '@auj/contracts';
import type { ItemKind, PackageItem } from '@auj/core-booking';
import { Button } from '@auj/ui';
import { formatMoney, formatWithPkr } from '../fx';
import { t, type Locale } from '../i18n';

export interface PackageBuilderProps {
  locale: Locale;
  items: PackageItem[];
  totals: Money[];
  onContinue: () => void;
  onBack?: () => void;
}

const ICON: Record<ItemKind, string> = { HOTEL: '🏨', TRANSPORT: '🚌', GROUND: '🕌', FLIGHT: '✈' };
const STEPS = ['Hotel', 'Transport', 'Ground', 'Flight'];

export function PackageBuilder({ locale, items, totals, onContinue, onBack }: PackageBuilderProps) {
  const eur = totals.find((m) => m.currency === 'EUR');
  const kinds = new Set(items.map((i) => i.kind));
  return (
    <div className="relative min-h-screen bg-sand-50 pb-32">
      <div className="sticky top-0 z-10 border-b border-sand-200 bg-sand-50/90 px-5 pb-3 pt-3.5 backdrop-blur">
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Back" onClick={onBack} className="text-xl text-sand-700">
            ←
          </button>
          <span className="text-[15px] font-semibold">Build your package</span>
          <span className="text-[13px] font-semibold text-accent-600">Reset</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((s, i) => {
            const done = kinds.has(['HOTEL', 'TRANSPORT', 'GROUND', 'FLIGHT'][i] as ItemKind);
            return (
              <div key={s} className="flex-1 text-center">
                <div className={`h-1 rounded-full ${done ? 'bg-green-800' : i === 0 ? 'bg-accent-600' : 'bg-sand-200'}`} />
                <div className={`mt-1.5 text-[11px] font-semibold ${done ? 'text-green-800' : 'text-sand-500'}`}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {items.map((c) => (
          <div key={c.offerId} className="flex gap-3 rounded-2xl border border-sand-200 bg-white p-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-[22px]">{ICON[c.kind]}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sand-500">{c.kind}</span>
                <span className="text-xs font-semibold text-accent-600">Swap</span>
              </div>
              <div className="my-0.5 text-[15px] font-semibold">{c.title}</div>
              <div className="flex items-center justify-between pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-fg">✓ Included</span>
                <span className="font-mono text-sm font-semibold">{formatMoney(c.net)}</span>
              </div>
            </div>
          </div>
        ))}
        <div className="rounded-2xl border-[1.5px] border-dashed border-sand-300 p-3.5 text-center text-[13px] font-semibold text-accent-600">
          + Add ground transport or excursions
        </div>
      </div>

      {/* sticky cart */}
      <div className="sticky bottom-0 border-t border-sand-200 bg-white px-[18px] pb-[18px] pt-3.5 shadow-[0_-8px_24px_rgba(42,38,32,0.08)]">
        <div className="mb-3 flex items-end justify-between">
          <span className="text-[15px] font-semibold">{t(locale, 'total')}</span>
          <span className="text-right">
            <span className="font-mono text-2xl font-bold text-green-800">{totals.map((m) => formatMoney(m)).join(' + ') || '€0.00'}</span>
            {eur ? <span className="ms-1 text-xs text-sand-500">{formatWithPkr(eur).split('≈')[1] ? `≈${formatWithPkr(eur).split('≈')[1]}` : ''}</span> : null}
          </span>
        </div>
        <Button className="w-full !py-3.5 text-[15px]" onClick={onContinue}>
          Continue to pilgrims
        </Button>
      </div>
    </div>
  );
}
