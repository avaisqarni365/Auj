import type { CateringOffer, GroundOffer, Money, PackageMode } from '@auj/contracts';
import type { ItemKind, PackageItem } from '@auj/core-booking';
import { Button } from '@auj/ui';
import { formatMoney, formatWithPkr } from '../fx';
import { t, type Locale } from '../i18n';

export interface PackageBuilderProps {
  locale: Locale;
  items: PackageItem[];
  totals: Money[];
  mode?: PackageMode;
  onMode?: (mode: PackageMode) => void;
  rawdahRequested?: boolean;
  onToggleRawdah?: () => void;
  /** Optional add-ons fetched from the connector (ziyarah bundles + meal plans). */
  ziyarah?: GroundOffer[];
  catering?: CateringOffer[];
  /** offerIds currently in the cart, so add-on chips can show selected state. */
  selectedOfferIds?: string[];
  onToggleAddon?: (item: PackageItem) => void;
  onContinue: () => void;
  onBack?: () => void;
}

const ICON: Record<ItemKind, string> = { HOTEL: '🏨', TRANSPORT: '🚌', GROUND: '🕌', FLIGHT: '✈', CATERING: '🍽' };
const STEPS = ['Hotel', 'Transport', 'Ground', 'Flight'];

// Nusuk-parity package modes (see nusuk-umrah-services skill).
const MODES: ReadonlyArray<{ value: PackageMode; label: string; hint: string }> = [
  { value: 'COMPREHENSIVE', label: 'Comprehensive', hint: 'Visa, hotels, transport & ground — all included' },
  { value: 'VISA_OPTIONAL', label: 'Visa optional', hint: 'Bring your own visa; we arrange the rest' },
  { value: 'CUSTOM', label: 'Custom', hint: 'Pick exactly what you need' },
];

export function PackageBuilder({ locale, items, totals, mode = 'COMPREHENSIVE', onMode, rawdahRequested = false, onToggleRawdah, ziyarah = [], catering = [], selectedOfferIds = [], onToggleAddon, onContinue, onBack }: PackageBuilderProps) {
  const selected = new Set(selectedOfferIds);
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

      {/* Package mode (Nusuk parity) */}
      <div className="px-4 pt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-sand-500">Package mode</div>
        <div className="mt-2 flex gap-2">
          {MODES.map((m) => {
            const active = m.value === mode;
            return (
              <button
                key={m.value}
                type="button"
                aria-pressed={active}
                onClick={() => onMode?.(m.value)}
                className={`flex-1 rounded-xl border px-2.5 py-2 text-[12px] font-semibold transition-colors ${
                  active ? 'border-green-800 bg-green-800/5 text-green-800' : 'border-sand-200 bg-white text-sand-600'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[12px] text-sand-500">{MODES.find((m) => m.value === mode)?.hint}</p>
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

        {/* Rawdah (Riyadh ul-Jannah) permit add-on */}
        <button
          type="button"
          aria-pressed={rawdahRequested}
          onClick={onToggleRawdah}
          className={`flex items-center gap-3 rounded-2xl border p-3.5 text-start transition-colors ${
            rawdahRequested ? 'border-green-800 bg-green-800/5' : 'border-sand-200 bg-white'
          }`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-[22px]">🕋</div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold">Rawdah permit</div>
            <div className="text-[12px] text-sand-500">Reserve a Riyadh ul-Jannah (Rawdah) slot in Madinah for every pilgrim.</div>
          </div>
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold ${
              rawdahRequested ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 text-transparent'
            }`}
            aria-hidden
          >
            ✓
          </span>
        </button>

        {ziyarah.length > 0 ? (
          <AddonGroup
            title="Ziyarah bundles"
            hint="Curated guided heritage visits."
            offers={ziyarah.map((z) => ({ icon: '🕌', item: { kind: 'GROUND' as ItemKind, offerId: z.id, title: z.name, net: z.net } }))}
            selected={selected}
            onToggle={onToggleAddon}
          />
        ) : null}

        {catering.length > 0 ? (
          <AddonGroup
            title="Meals & catering"
            hint="Per pilgrim, for the stay."
            offers={catering.map((m) => ({ icon: '🍽', item: { kind: 'CATERING' as ItemKind, offerId: m.id, title: m.name, net: m.net } }))}
            selected={selected}
            onToggle={onToggleAddon}
          />
        ) : null}
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

interface AddonOption {
  icon: string;
  item: PackageItem;
}

function AddonGroup({
  title,
  hint,
  offers,
  selected,
  onToggle,
}: {
  title: string;
  hint: string;
  offers: AddonOption[];
  selected: Set<string>;
  onToggle?: (item: PackageItem) => void;
}) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-3.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-bold">{title}</span>
        <span className="text-[11.5px] text-sand-500">{hint}</span>
      </div>
      <div className="mt-2.5 flex flex-col gap-2">
        {offers.map(({ icon, item }) => {
          const on = selected.has(item.offerId);
          return (
            <button
              key={item.offerId}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle?.(item)}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors ${
                on ? 'border-green-800 bg-green-800/5' : 'border-sand-200 bg-white'
              }`}
            >
              <span className="text-[18px]">{icon}</span>
              <span className="min-w-0 flex-1 text-[13.5px] font-semibold">{item.title}</span>
              <span className="font-mono text-[13px] font-semibold text-green-800">{formatMoney(item.net)}</span>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                  on ? 'border-green-800 bg-green-800 text-white' : 'border-sand-300 text-transparent'
                }`}
                aria-hidden
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
