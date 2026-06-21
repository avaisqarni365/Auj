import type { Currency, Money, PackageMode, SearchCriteria } from '@auj/contracts';
import type { PackageItem, SpecialRequestCategory } from '@auj/core-booking';

// Local copy so this module stays free of any value import from core-booking,
// keeping the funnel safe to bundle into the browser (core-booking pulls node:crypto).
function sumByCurrency(amounts: Money[]): Money[] {
  const totals = new Map<Currency, number>();
  for (const m of amounts) totals.set(m.currency, (totals.get(m.currency) ?? 0) + m.amount);
  return [...totals.entries()].map(([currency, amount]) => ({ amount, currency }));
}

export type FunnelStep = 'SEARCH' | 'RESULTS' | 'BUILDER' | 'PILGRIMS' | 'CHECKOUT' | 'CARD' | 'CONFIRMED';

export interface PilgrimDraft {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dob: string;
  gender: 'M' | 'F';
  residenceCountry?: string;
  residencePermit?: boolean;
}

export interface FunnelState {
  step: FunnelStep;
  channel: 'PILGRIMAGE' | 'TRAVEL';
  /** Nusuk-parity package mode: comprehensive (everything), visa-optional, or custom. */
  mode: PackageMode;
  /** Whether the pilgrim requested a Rawdah (Riyadh ul-Jannah) permit add-on. */
  rawdahRequested: boolean;
  /** Gift Umrah: when enabled, the booking is bought for a recipient (voucher issued). */
  gift: { enabled: boolean; recipientName: string; recipientEmail: string; message: string };
  /** Personalization: selected special-request categories + a free-text note. */
  requests: { categories: SpecialRequestCategory[]; note: string };
  criteria: SearchCriteria;
  cart: PackageItem[];
  pilgrims: PilgrimDraft[];
  currency: 'EUR' | 'PKR';
  bookingId?: string;
}

export type FunnelAction =
  | { type: 'SET_CRITERIA'; criteria: Partial<SearchCriteria> }
  | { type: 'GO'; step: FunnelStep }
  | { type: 'SET_MODE'; mode: PackageMode }
  | { type: 'TOGGLE_RAWDAH' }
  | { type: 'SET_GIFT'; gift: Partial<FunnelState['gift']> }
  | { type: 'TOGGLE_REQUEST'; category: SpecialRequestCategory }
  | { type: 'SET_REQUEST_NOTE'; note: string }
  | { type: 'ADD_ITEM'; item: PackageItem }
  | { type: 'REMOVE_ITEM'; offerId: string }
  | { type: 'SET_PILGRIMS'; pilgrims: PilgrimDraft[] }
  | { type: 'SET_CURRENCY'; currency: 'EUR' | 'PKR' }
  | { type: 'SET_BOOKING'; bookingId: string }
  | { type: 'RESTORE'; state: FunnelState };

export function initialFunnel(): FunnelState {
  return {
    step: 'SEARCH',
    channel: 'PILGRIMAGE',
    mode: 'COMPREHENSIVE',
    rawdahRequested: false,
    gift: { enabled: false, recipientName: '', recipientEmail: '', message: '' },
    requests: { categories: [], note: '' },
    criteria: { city: 'MAKKAH', checkIn: '', checkOut: '', pax: 1 },
    cart: [],
    pilgrims: [],
    currency: 'EUR',
  };
}

export function funnelReducer(state: FunnelState, action: FunnelAction): FunnelState {
  switch (action.type) {
    case 'SET_CRITERIA':
      return { ...state, criteria: { ...state.criteria, ...action.criteria } };
    case 'GO':
      return { ...state, step: action.step };
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'TOGGLE_RAWDAH':
      return { ...state, rawdahRequested: !state.rawdahRequested };
    case 'SET_GIFT':
      return { ...state, gift: { ...state.gift, ...action.gift } };
    case 'TOGGLE_REQUEST':
      return {
        ...state,
        requests: {
          ...state.requests,
          categories: state.requests.categories.includes(action.category)
            ? state.requests.categories.filter((c) => c !== action.category)
            : [...state.requests.categories, action.category],
        },
      };
    case 'SET_REQUEST_NOTE':
      return { ...state, requests: { ...state.requests, note: action.note } };
    case 'ADD_ITEM':
      if (state.cart.some((i) => i.offerId === action.item.offerId)) return state;
      return { ...state, cart: [...state.cart, action.item] };
    case 'REMOVE_ITEM':
      return { ...state, cart: state.cart.filter((i) => i.offerId !== action.offerId) };
    case 'SET_PILGRIMS':
      return { ...state, pilgrims: action.pilgrims };
    case 'SET_CURRENCY':
      return { ...state, currency: action.currency };
    case 'SET_BOOKING':
      return { ...state, bookingId: action.bookingId, step: 'CONFIRMED' };
    case 'RESTORE':
      // Restore a saved draft; RESULTS needs re-fetched offers, so land on SEARCH there.
      return { ...action.state, step: action.state.step === 'RESULTS' ? 'SEARCH' : action.state.step };
    default:
      return state;
  }
}

/** Net subtotal per currency for the current cart. */
export function cartTotals(state: FunnelState): Money[] {
  return sumByCurrency(state.cart.map((i) => i.net));
}
