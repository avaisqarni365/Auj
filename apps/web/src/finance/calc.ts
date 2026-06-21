// Umrah finance calculator — money-safe engine. All monetary values are INTEGER CENTS (minor units),
// never floats, matching the app's money convention. Pure + unit-tested. Spec:
// umrah-finance-planner/umrah-finance-planner.md.
//
// The spec's formulas have circular deps (payment_fee ↔ selling_price, commission ↔ selling_price),
// so we linearize once with a standard, documented simplification: the percentage fees (payment fee,
// tax) and the commission are taken on the PRICE-BEFORE-FEES (cost+buffer+markup). This keeps a single
// clean pass and yields the intuitive identity profit = markup − discount (fees/tax/commission are
// pass-through). Admins can still see every line in the breakdown.

export type CostBasis = 'per_person' | 'total';

export interface CostItem {
  id: string;
  label: string;
  cents: number;
  basis: CostBasis;
}

export interface FinanceInputs {
  packageName: string;
  packageType: string;
  currency: string;
  adults: number;
  children: number;
  infants: number;
  items: CostItem[];
  bufferPercent: number;
  markupPercent: number;
  fixedMarkupCents: number;
  agentCommissionPercent: number;
  agentCommissionFixedCents: number;
  paymentFeePercent: number;
  taxPercent: number;
  discountCents: number;
  depositCents: number;
}

export interface Breakdown {
  travellers: number;
  baseCostCents: number;
  bufferCents: number;
  costWithBufferCents: number;
  markupCents: number;
  priceBeforeFeesCents: number;
  agentCommissionCents: number;
  paymentFeeCents: number;
  taxCents: number;
  discountCents: number;
  netCostCents: number;
  sellingPriceCents: number;
  profitCents: number;
  marginPct: number;
  perPersonCents: number;
  depositCents: number;
  balanceDueCents: number;
}

const r = (n: number): number => Math.round(n);

export function computeFinance(i: FinanceInputs): Breakdown {
  const travellers = Math.max(0, Math.trunc(i.adults) + Math.trunc(i.children) + Math.trunc(i.infants));

  const baseCost = i.items.reduce((sum, it) => sum + (it.basis === 'per_person' ? it.cents * travellers : it.cents), 0);
  const buffer = r((baseCost * i.bufferPercent) / 100);
  const costWithBuffer = baseCost + buffer;

  const markup = r(i.fixedMarkupCents + (costWithBuffer * i.markupPercent) / 100);
  const priceBeforeFees = costWithBuffer + markup;

  const agentCommission = r(i.agentCommissionFixedCents + (priceBeforeFees * i.agentCommissionPercent) / 100);
  const paymentFee = r((priceBeforeFees * i.paymentFeePercent) / 100);
  const tax = r((priceBeforeFees * i.taxPercent) / 100);
  const discount = Math.max(0, i.discountCents);

  const netCost = costWithBuffer + paymentFee; // spec: base + buffer + payment_fee
  const sellingPrice = priceBeforeFees + agentCommission + paymentFee + tax - discount;
  const profit = sellingPrice - netCost - agentCommission - tax; // == markup − discount
  const marginPct = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const perPerson = travellers > 0 ? r(sellingPrice / travellers) : 0;
  const balanceDue = sellingPrice - i.depositCents;

  return {
    travellers,
    baseCostCents: baseCost,
    bufferCents: buffer,
    costWithBufferCents: costWithBuffer,
    markupCents: markup,
    priceBeforeFeesCents: priceBeforeFees,
    agentCommissionCents: agentCommission,
    paymentFeeCents: paymentFee,
    taxCents: tax,
    discountCents: discount,
    netCostCents: netCost,
    sellingPriceCents: sellingPrice,
    profitCents: profit,
    marginPct,
    perPersonCents: perPerson,
    depositCents: i.depositCents,
    balanceDueCents: balanceDue,
  };
}

/** Parse a user-typed decimal amount (e.g. "480.5") into integer cents. */
export function toCents(input: string | number): number {
  const n = typeof input === 'number' ? input : Number.parseFloat(input);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Format integer cents as a localized currency string. */
export function fmt(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 2 }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

// --- Deal-by-deal self-assessment (migration 02) -------------------------------------------------
export type Channel = 'B2C' | 'B2B';

export interface AssessmentInput {
  costsCents: number[];
  bufferPct: number;
  markupPct: number;
  feePct: number;
  commissionPct: number;
  channel: Channel;
  pax: number;
}

export interface Assessment {
  baseCents: number;
  bufferCents: number;
  markupCents: number;
  feeCents: number;
  commissionCents: number;
  sellingCents: number;
  profitCents: number;
  marginPct: number;
  perPilgrimCents: number;
}

/** Money-in / money-out / profit for one deal. Decimals (integer cents); commission only on B2B. */
export function buildAssessment(i: AssessmentInput): Assessment {
  const base = i.costsCents.reduce((s, c) => s + c, 0);
  const buffer = r((base * i.bufferPct) / 100);
  const markup = r(((base + buffer) * i.markupPct) / 100);
  const fee = r(((base + buffer + markup) * i.feePct) / 100);
  const commission = i.channel === 'B2B' ? r(((base + buffer + markup + fee) * i.commissionPct) / 100) : 0;
  const selling = base + buffer + markup + fee + commission;
  const profit = selling - base - buffer - fee - commission; // == markup
  const marginPct = selling > 0 ? (profit / selling) * 100 : 0;
  const pax = Math.max(1, Math.trunc(i.pax));
  return {
    baseCents: base,
    bufferCents: buffer,
    markupCents: markup,
    feeCents: fee,
    commissionCents: commission,
    sellingCents: selling,
    profitCents: profit,
    marginPct,
    perPilgrimCents: r(selling / pax),
  };
}

export const CURRENCIES = ['EUR', 'GBP', 'USD', 'PKR', 'SAR'] as const;
export const PACKAGE_TYPES = ['Economy', 'Standard', 'Premium', 'Ramadan', 'Family', 'Group', 'Custom'] as const;

/** The standard Umrah cost categories (manual entry, all zero to start). */
export function defaultItems(): CostItem[] {
  const mk = (label: string, basis: CostBasis): CostItem => ({ id: `${label}-${basis}`, label, cents: 0, basis });
  return [
    mk('Flights', 'per_person'),
    mk('Visa', 'per_person'),
    mk('Makkah hotel', 'total'),
    mk('Madinah hotel', 'total'),
    mk('Transport', 'total'),
    mk('Ziyarat', 'total'),
    mk('Guide', 'total'),
    mk('Food', 'total'),
    mk('Insurance', 'per_person'),
  ];
}

export function defaultInputs(): FinanceInputs {
  return {
    packageName: '',
    packageType: 'Standard',
    currency: 'EUR',
    adults: 1,
    children: 0,
    infants: 0,
    items: defaultItems(),
    bufferPercent: 5,
    markupPercent: 12,
    fixedMarkupCents: 0,
    agentCommissionPercent: 0,
    agentCommissionFixedCents: 0,
    paymentFeePercent: 2,
    taxPercent: 0,
    discountCents: 0,
    depositCents: 0,
  };
}
