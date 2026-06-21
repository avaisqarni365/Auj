// Predictive group cost forecast (migration 03). Pure + unit-tested. Reuses calc.buildAssessment for
// the markup → sell → profit tail (no duplicated pricing formula). Integer cents.
import { buildAssessment, type Assessment } from './calc';

export type Scenario = 'normal' | 'peak' | 'ramadan';
export const SCEN_FACTOR: Record<Scenario, number> = { normal: 1, peak: 1.28, ramadan: 1.55 };
export const SCEN_LABEL: Record<Scenario, string> = { normal: 'Off-peak ×1.0', peak: 'Peak ×1.28', ramadan: 'Ramadan ×1.55' };

export interface ForecastInput {
  flightEachCents: number;
  hotelNightCents: number; // per room, per night
  nights: number;
  roomShare: number; // pilgrims per room
  transportCents: number; // group total
  visaEachCents: number;
  ziyaratEachCents: number;
  foodDayCents: number; // per pilgrim, per day
}

export interface ForecastLine {
  key: string;
  label: string;
  groupCents: number;
  perPaxCents: number;
}

export interface Forecast {
  lines: ForecastLine[];
  grandCents: number;
  perPaxCents: number;
  assessment: Assessment;
}

export interface ForecastDials {
  bufferPct: number;
  markupPct: number;
  feePct: number;
}

const r = (n: number): number => Math.round(n);
export const clampPax = (n: number): number => Math.min(500, Math.max(1, Math.trunc(n) || 1));

/** Forecast a group's cost. The season scenario scales HOTELS and FLIGHTS only. */
export function forecast(i: ForecastInput, pax: number, scen: Scenario, dials: ForecastDials): Forecast {
  const p = clampPax(pax);
  const f = SCEN_FACTOR[scen];
  const rooms = Math.max(1, Math.ceil(p / Math.max(1, Math.trunc(i.roomShare) || 1)));
  const mk = (key: string, label: string, group: number): ForecastLine => ({ key, label, groupCents: group, perPaxCents: r(group / p) });

  const lines: ForecastLine[] = [
    mk('flights', 'Flights', r(i.flightEachCents * f) * p),
    mk('hotels', 'Hotels', r(i.hotelNightCents * f) * Math.max(0, i.nights) * rooms),
    mk('transport', 'Transport', i.transportCents),
    mk('visa', 'Visa', i.visaEachCents * p),
    mk('ziyarat', 'Ziyarat', i.ziyaratEachCents * p),
    mk('food', 'Food', i.foodDayCents * Math.max(0, i.nights) * p),
  ];
  const grand = lines.reduce((s, l) => s + l.groupCents, 0);
  const assessment = buildAssessment({
    costsCents: [grand],
    bufferPct: dials.bufferPct,
    markupPct: dials.markupPct,
    feePct: dials.feePct,
    commissionPct: 0,
    channel: 'B2C',
    pax: p,
  });
  return { lines, grandCents: grand, perPaxCents: r(grand / p), assessment };
}
