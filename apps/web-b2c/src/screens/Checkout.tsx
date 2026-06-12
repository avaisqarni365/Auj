import type { Money } from '@auj/contracts';
import { Button, Card, SegmentedControl } from '@auj/ui';
import { formatMoney, formatWithPkr } from '../fx';
import { t, type Locale } from '../i18n';

export interface CheckoutProps {
  locale: Locale;
  currency: 'EUR' | 'PKR';
  totalEur: Money;
  onCurrency: (currency: 'EUR' | 'PKR') => void;
  onPay: () => void;
  paying?: boolean;
}

export function Checkout({ locale, currency, totalEur, onCurrency, onPay, paying }: CheckoutProps) {
  return (
    <Card className="grid gap-4 p-5">
      <SegmentedControl
        value={currency}
        onChange={onCurrency}
        options={[
          { value: 'EUR', label: '€ EUR' },
          { value: 'PKR', label: '₨ PKR' },
        ]}
      />
      <div>
        <div className="text-xs text-sand-500">{t(locale, 'total')}</div>
        <div className="font-mono text-2xl text-green-800">{formatMoney(totalEur)}</div>
        <div className="text-xs text-sand-500">{formatWithPkr(totalEur)}</div>
      </div>
      <p className="rounded-lg bg-accent-100 p-3 text-xs text-accent-700">
        PKR is indicative at today&apos;s rate; your card is charged in EUR.
      </p>
      <Button onClick={onPay} disabled={paying}>
        {t(locale, 'pay')} {formatMoney(totalEur)}
      </Button>
    </Card>
  );
}
