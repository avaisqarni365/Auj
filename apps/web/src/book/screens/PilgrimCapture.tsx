import type { VisaRouting } from '@auj/visa-router';
import { Button, Input, StatusPill } from '@auj/ui';
import { t, type Locale } from '../i18n';
import type { PilgrimDraft } from '../funnel';
import { ScreenHeader } from './Brand';

export type PilgrimField = 'firstName' | 'lastName' | 'nationality' | 'passportNumber';

export interface PilgrimCaptureProps {
  locale: Locale;
  pilgrims: PilgrimDraft[];
  routes: VisaRouting[]; // visa route per pilgrim (same index)
  onField: (index: number, field: PilgrimField, value: string) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  maxPilgrims?: number;
}

export function PilgrimCapture({ locale, pilgrims, routes, onField, onAdd, onRemove, onContinue, onBack, maxPilgrims = 49 }: PilgrimCaptureProps) {
  return (
    <div className="min-h-screen bg-sand-50">
      <ScreenHeader title={`${t(locale, 'pilgrims')} · ${pilgrims.length}`} onBack={onBack} right="Save" />

      <div className="p-4">
        <div className="grid gap-4">
          {pilgrims.map((p, i) => {
            const route = routes[i]?.route ?? 'AGENT_CHANNEL';
            const evisa = route === 'EVISA_DIRECT';
            return (
              <div key={i} className="rounded-2xl border border-sand-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-sand-700">{t(locale, 'pilgrims')} {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <StatusPill tone={evisa ? 'success' : 'info'}>{evisa ? t(locale, 'visa_evisa') : t(locale, 'visa_agent')}</StatusPill>
                    {pilgrims.length > 1 && onRemove ? (
                      <button type="button" aria-label={`Remove pilgrim ${i + 1}`} onClick={() => onRemove(i)} className="text-[13px] font-semibold text-danger-fg">
                        ✕
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <Input label="First name" value={p.firstName} onChange={(e) => onField(i, 'firstName', e.target.value)} />
                    <Input label="Last name" value={p.lastName} onChange={(e) => onField(i, 'lastName', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Input label="Nationality (ISO-2)" value={p.nationality} onChange={(e) => onField(i, 'nationality', e.target.value)} />
                    <Input label="Passport number" className="font-mono" value={p.passportNumber} onChange={(e) => onField(i, 'passportNumber', e.target.value)} />
                  </div>
                </div>

                {(routes[i]?.warnings ?? []).map((w) => (
                  <p key={w} className="mt-2 text-xs text-warning-fg">{w}</p>
                ))}
              </div>
            );
          })}
        </div>

        {onAdd && pilgrims.length < maxPilgrims ? (
          <button
            type="button"
            onClick={onAdd}
            className="mt-3 w-full rounded-2xl border-[1.5px] border-dashed border-sand-300 py-3 text-[13px] font-semibold text-accent-600"
          >
            + Add pilgrim
          </button>
        ) : null}

        <p className="mt-3 text-[12px] text-sand-500">Visa route is auto-detected per pilgrim from nationality (EU → e-Visa; others → agent channel).</p>

        <Button className="mt-4 w-full !py-3.5 text-[15px]" onClick={onContinue}>
          {t(locale, 'continue')}
        </Button>
      </div>
    </div>
  );
}
