import type { VisaRouting } from '@auj/visa-router';
import { Button, Card, Input, StatusPill } from '@auj/ui';
import { t, type Locale } from '../i18n';

export interface PilgrimCaptureProps {
  locale: Locale;
  firstName: string;
  nationality: string;
  passportNumber: string;
  route: VisaRouting;
  onField: (field: 'firstName' | 'nationality' | 'passportNumber', value: string) => void;
  onContinue: () => void;
}

export function PilgrimCapture({ locale, firstName, nationality, passportNumber, route, onField, onContinue }: PilgrimCaptureProps) {
  const evisa = route.route === 'EVISA_DIRECT';
  return (
    <div className="grid gap-3">
      <Card className="bg-green-100 p-4">
        <div className="text-xs text-sand-500">{t(locale, 'visa_route')}</div>
        <div className="mt-1">
          <StatusPill tone={evisa ? 'success' : 'info'}>
            {evisa ? t(locale, 'visa_evisa') : t(locale, 'visa_agent')}
          </StatusPill>
        </div>
        {route.warnings.map((w) => (
          <p key={w} className="mt-1 text-xs text-warning-fg">
            {w}
          </p>
        ))}
      </Card>
      <Card className="grid gap-3 p-4">
        <Input label="First name" value={firstName} onChange={(e) => onField('firstName', e.target.value)} />
        <Input label="Nationality (ISO-2)" value={nationality} onChange={(e) => onField('nationality', e.target.value)} />
        <Input label="Passport number" className="font-mono" value={passportNumber} onChange={(e) => onField('passportNumber', e.target.value)} />
        <Button onClick={onContinue}>{t(locale, 'continue')}</Button>
      </Card>
    </div>
  );
}
