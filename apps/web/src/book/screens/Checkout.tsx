import type { Money } from '@auj/contracts';
import { Button } from '@auj/ui';
import { formatMoney, formatWithPkr } from '../fx';
import { t, type Locale } from '../i18n';
import { ScreenHeader } from './Brand';

export interface CheckoutProps {
  locale: Locale;
  currency: 'EUR' | 'PKR';
  totalEur: Money;
  onCurrency: (currency: 'EUR' | 'PKR') => void;
  onPay: () => void;
  paying?: boolean;
  onBack?: () => void;
}

export function Checkout({ locale, currency, totalEur, onCurrency, onPay, paying, onBack }: CheckoutProps) {
  const pkr = formatWithPkr(totalEur).split('≈')[1]?.trim();
  return (
    <div className="min-h-screen bg-sand-50">
      <ScreenHeader title={t(locale, 'checkout')} onBack={onBack} right={<span className="text-success-fg">🔒 Secure</span>} />
      <div className="p-4">
        {/* currency switch */}
        <div className="mb-3.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-sand-700">Pay in</span>
          <div className="flex gap-1 rounded-[10px] bg-sand-100 p-1">
            {(['EUR', 'PKR'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onCurrency(c)}
                className={`rounded-[7px] px-4 py-1.5 text-[13px] font-semibold ${currency === c ? 'bg-green-800 text-white' : 'text-sand-500'}`}
              >
                {c === 'EUR' ? '€ EUR' : '₨ PKR'}
              </button>
            ))}
          </div>
        </div>

        {/* order summary */}
        <div className="mb-3.5 rounded-2xl border border-sand-200 bg-white p-4">
          <div className="mb-3 text-[13px] font-bold">Order summary</div>
          {[
            { label: 'Package (4 pilgrims)', value: totalEur },
          ].map((l) => (
            <div key={l.label} className="flex items-center justify-between border-b border-sand-100 py-1.5">
              <span className="text-[13.5px] text-sand-700">{l.label}</span>
              <span className="font-mono text-[13.5px]">{formatMoney(l.value)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3">
            <div>
              <div className="text-[15px] font-bold">{t(locale, 'total')}</div>
              <div className="text-[11px] text-sand-500">incl. taxes &amp; visa fees</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[22px] font-bold text-green-800">{formatMoney(totalEur)}</div>
              <div className="font-mono text-xs text-sand-500">≈ {pkr}</div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-[10px] bg-accent-100 px-3 py-2.5">
          <span className="text-sm">ℹ️</span>
          <span className="text-xs leading-snug text-accent-700">PKR shown at today&apos;s rate (1 € = ₨310.8). Card is charged in EUR.</span>
        </div>

        {/* payment methods */}
        <div className="mb-2.5 text-[13px] font-bold">Payment method</div>
        <div className="mb-4 grid gap-2.5">
          <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-accent-600 bg-white px-3.5 py-3 shadow-focus">
            <span className="h-[18px] w-[18px] rounded-full border-[5px] border-accent-600" />
            <span className="flex-1 text-sm font-semibold">Card · Visa / Mastercard</span>
            <span className="text-[17px]">💳</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-sand-300 bg-white px-3.5 py-3">
            <span className="h-[18px] w-[18px] rounded-full border-2 border-sand-300" />
            <span className="flex-1 text-sm font-semibold">SEPA bank transfer</span>
            <span className="text-[17px]">🏦</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-sand-300 bg-white px-3.5 py-3">
            <span className="h-[18px] w-[18px] rounded-full border-2 border-sand-300" />
            <span className="flex-1 text-sm font-semibold">Pay deposit · 20% now</span>
            <span className="text-xs font-semibold text-warning">20%</span>
          </div>
        </div>

        <Button className="w-full !py-3.5 text-[15px] shadow-[0_6px_16px_rgba(15,81,50,0.25)]" onClick={onPay} disabled={paying}>
          {t(locale, 'pay')} {formatMoney(totalEur)}
        </Button>
        <p className="mt-3 text-center text-[11.5px] text-sand-500">By paying you accept AUJ&apos;s terms &amp; the pilgrimage conditions.</p>
      </div>
    </div>
  );
}
