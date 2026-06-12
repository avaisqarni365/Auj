import type { Money } from '@auj/contracts';
import type { PackageItem } from '@auj/core-booking';
import { Button, Card } from '@auj/ui';
import { formatMoney, formatWithPkr } from '../fx';
import { t, type Locale } from '../i18n';

export interface PackageBuilderProps {
  locale: Locale;
  items: PackageItem[];
  totals: Money[];
  onContinue: () => void;
}

export function PackageBuilder({ locale, items, totals, onContinue }: PackageBuilderProps) {
  const eur = totals.find((m) => m.currency === 'EUR');
  return (
    <div className="grid gap-3">
      {items.map((i) => (
        <Card key={i.offerId} className="flex items-center justify-between p-4">
          <div>
            <div className="text-xs uppercase text-sand-500">{i.kind}</div>
            <div className="text-sand-ink">{i.title}</div>
          </div>
          <div className="font-mono text-sand-700">{formatMoney(i.net)}</div>
        </Card>
      ))}
      <Card className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs text-sand-500">{t(locale, 'total')}</div>
          <div className="font-mono text-lg text-green-800">{totals.map((m) => formatMoney(m)).join(' + ') || '—'}</div>
          {eur ? <div className="text-xs text-sand-500">{formatWithPkr(eur)}</div> : null}
        </div>
        <Button onClick={onContinue}>{t(locale, 'continue')}</Button>
      </Card>
    </div>
  );
}
