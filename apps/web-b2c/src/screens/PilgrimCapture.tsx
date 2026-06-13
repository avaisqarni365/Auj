import type { VisaRouting } from '@auj/visa-router';
import { Button, Input, StatusPill } from '@auj/ui';
import { t, type Locale } from '../i18n';
import { ScreenHeader } from './Brand';

export interface PilgrimCaptureProps {
  locale: Locale;
  firstName: string;
  nationality: string;
  passportNumber: string;
  route: VisaRouting;
  onField: (field: 'firstName' | 'nationality' | 'passportNumber', value: string) => void;
  onContinue: () => void;
  onBack?: () => void;
}

export function PilgrimCapture({ locale, firstName, nationality, passportNumber, route, onField, onContinue, onBack }: PilgrimCaptureProps) {
  const evisa = route.route === 'EVISA_DIRECT';
  return (
    <div className="min-h-screen bg-sand-50">
      <ScreenHeader title="Pilgrim 1 of 4" onBack={onBack} right="Save" />
      <div className="px-5 pt-3">
        <div className="flex gap-1.5">
          <span className="h-1 flex-1 rounded-full bg-green-800" />
          <span className="h-1 flex-1 rounded-full bg-sand-200" />
          <span className="h-1 flex-1 rounded-full bg-sand-200" />
          <span className="h-1 flex-1 rounded-full bg-sand-200" />
        </div>
      </div>

      <div className="p-4">
        {/* VISA ROUTE INDICATOR */}
        <div className="mb-4 rounded-2xl border border-green-100 bg-gradient-to-br from-green-100 to-green-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-success-fg">{t(locale, 'visa_route')}</span>
            <span className="text-[11px] text-sand-500">· auto-detected from nationality</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex h-[42px] w-[42px] items-center justify-center rounded-xl text-xl ${evisa ? 'bg-success' : 'bg-info'}`}>🪪</div>
            <div className="flex-1">
              <div className="text-[15px] font-bold text-green-900">{evisa ? `${t(locale, 'visa_evisa')} route` : t(locale, 'visa_agent')}</div>
              <div className="text-[12.5px] leading-snug text-success-fg">
                {evisa
                  ? 'EU passport — issued online in ~3 days. No agent appointment needed.'
                  : 'Routed via a MoRA-licensed operator + Nusuk Masar.'}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <StatusPill tone={evisa ? 'success' : 'info'}>{evisa ? t(locale, 'visa_evisa') : t(locale, 'visa_agent')}</StatusPill>
            <div className="flex gap-1.5 rounded-[10px] bg-white/60 p-1 text-[12px] font-semibold">
              <span className={`rounded-[7px] px-3 py-1.5 ${evisa ? 'bg-success text-white' : 'text-sand-500'}`}>● {t(locale, 'visa_evisa')}</span>
              <span className={`rounded-[7px] px-3 py-1.5 ${!evisa ? 'bg-info text-white' : 'text-accent-700'}`}>{t(locale, 'visa_agent')}</span>
            </div>
          </div>
          {route.warnings.map((w) => (
            <p key={w} className="mt-2 text-xs text-warning-fg">
              {w}
            </p>
          ))}
        </div>

        <div className="mb-3 text-[13px] font-bold text-sand-700">Pilgrim details</div>
        <div className="grid gap-3">
          <Input label="Full name (as in passport)" value={firstName} onChange={(e) => onField('firstName', e.target.value)} />
          <div className="grid grid-cols-2 gap-2.5">
            <Input label="Nationality (ISO-2)" value={nationality} onChange={(e) => onField('nationality', e.target.value)} />
            <Input label="Date of birth" defaultValue="04 / 11 / 1990" readOnly />
          </div>
          <Input label="Passport number" className="font-mono" value={passportNumber} onChange={(e) => onField('passportNumber', e.target.value)} />
        </div>

        <div className="mb-2.5 mt-4 text-[13px] font-bold text-sand-700">Documents</div>
        <div className="grid gap-2.5">
          <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-green-100 bg-green-50 px-3.5 py-3">
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-green-100 text-[17px]">📄</div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold">Passport scan</div>
              <div className="text-[11.5px] text-success-fg">passport.jpg · uploaded</div>
            </div>
            <span className="text-lg text-success">✓</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-dashed border-sand-300 bg-white px-3.5 py-3">
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-sand-100 text-[17px]">📷</div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold">Visa photo</div>
              <div className="text-[11.5px] text-sand-500">White background · 45×35mm</div>
            </div>
            <span className="text-xs font-semibold text-accent-600">Upload</span>
          </div>
        </div>

        <Button className="mt-4 w-full !py-3.5 text-[15px]" onClick={onContinue}>
          {t(locale, 'continue')}
        </Button>
      </div>
    </div>
  );
}
