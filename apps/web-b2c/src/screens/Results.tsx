import type { HotelOffer } from '@auj/contracts';
import { Button, Card, StatusPill } from '@auj/ui';
import { formatMoney } from '../fx';
import { t, type Locale } from '../i18n';

export interface ResultsProps {
  locale: Locale;
  offers: HotelOffer[];
  onBuild: (offer: HotelOffer) => void;
}

export function Results({ locale, offers, onBuild }: ResultsProps) {
  return (
    <div className="grid gap-3">
      {offers.map((o) => (
        <Card key={o.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sand-ink">{o.name}</h3>
                {o.nusukApproved ? <StatusPill tone="success">Nusuk</StatusPill> : null}
              </div>
              <p className="text-sm text-warning">{'★'.repeat(o.starRating)}</p>
            </div>
            <div className="text-right">
              <div className="font-mono text-green-800">{formatMoney(o.nightlyNet)}</div>
              <div className="text-xs text-sand-500">{t(locale, 'per_pilgrim')}</div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={() => onBuild(o)}>
              {t(locale, 'build_package')}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
