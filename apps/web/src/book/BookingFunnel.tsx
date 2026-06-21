'use client';

import { useEffect, useReducer, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import type { CateringOffer, GroundOffer, HotelOffer, SearchCriteria } from '@auj/contracts';
import type { Booking, PackageItem, VisaCase } from '@auj/core-booking';
// Import from specific modules (not the barrel) so the client bundle never pulls
// in the in-process backend, which depends on node:crypto via core-booking.
import { Checkout, HomeSearch, MyBooking, PackageBuilder, PilgrimCapture, Results, StripePaymentForm } from './screens';
import { cartTotals, funnelReducer, initialFunnel, type FunnelState, type PilgrimDraft } from './funnel';
import { formatMoney } from './fx';
import { LOCALES as BOOK_LOCALES, type Locale as BookLocale } from './i18n';
import { previewVisaRoute } from './usecases';
import { finalizeBookingAction, pollVisaAction, searchAddonsAction, searchHotelsAction, startCheckoutAction } from './actions';
import { clearBookingDraftAction, saveBookingDraftAction } from './booking-draft-actions';
import type { BookingDraft } from './booking-draft-types';

const SELL_PRICE = { amount: 120000, currency: 'EUR' as const }; // demo sell price, charged in EUR

const DEFAULT_PILGRIM: PilgrimDraft = {
  firstName: 'Imran',
  lastName: 'Ali',
  passportNumber: 'PK1234567',
  nationality: 'PK',
  dob: '1985-04-12',
  gender: 'M',
};

export function BookingFunnel({
  initialCity,
  initialPax,
  initialCheckIn = '',
  initialCheckOut = '',
  initialDraft = null,
}: {
  initialCity: SearchCriteria['city'];
  initialPax: number;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialDraft?: BookingDraft | null;
}) {
  const [state, dispatch] = useReducer(
    funnelReducer,
    { city: initialCity, pax: initialPax, checkIn: initialCheckIn, checkOut: initialCheckOut },
    (init): FunnelState => {
      const base = initialFunnel();
      return { ...base, criteria: { ...base.criteria, city: init.city, pax: init.pax, checkIn: init.checkIn, checkOut: init.checkOut } };
    },
  );
  const [offers, setOffers] = useState<HotelOffer[]>([]);
  const [addons, setAddons] = useState<{ ziyarah: GroundOffer[]; catering: CateringOffer[] }>({ ziyarah: [], catering: [] });
  const [pilgrims, setPilgrims] = useState<PilgrimDraft[]>([DEFAULT_PILGRIM]);
  const [booking, setBooking] = useState<Booking>();
  const [visaCase, setVisaCase] = useState<VisaCase>();
  const [card, setCard] = useState<{ bookingId: string; clientSecret: string; publishableKey: string }>();
  const [pending, start] = useTransition();
  const loc = useLocale();
  const bookLocale: BookLocale = (BOOK_LOCALES as readonly string[]).includes(loc) ? (loc as BookLocale) : 'en';

  // Resume a saved draft once (DB-backed; a CONFIRMED draft is ignored — it already completed).
  useEffect(() => {
    if (initialDraft && initialDraft.state.step !== 'CONFIRMED') {
      dispatch({ type: 'RESTORE', state: initialDraft.state });
      if (initialDraft.pilgrims.length) setPilgrims(initialDraft.pilgrims);
    }
  }, [initialDraft]);

  // Debounced autosave of the booking choices to DB (signed-in; the action no-ops otherwise).
  useEffect(() => {
    if (state.step === 'CONFIRMED') return undefined;
    const id = setTimeout(() => {
      void saveBookingDraftAction({ state, pilgrims });
    }, 1200);
    return () => clearTimeout(id);
  }, [state, pilgrims]);

  const search = (): void =>
    start(async () => {
      setOffers(await searchHotelsAction(state.criteria));
      dispatch({ type: 'GO', step: 'RESULTS' });
    });

  const build = (offer: HotelOffer): void => {
    const item: PackageItem = { kind: 'HOTEL', offerId: offer.id, title: offer.name, net: offer.nightlyNet };
    dispatch({ type: 'ADD_ITEM', item });
    dispatch({ type: 'GO', step: 'BUILDER' });
    start(async () => setAddons(await searchAddonsAction(state.criteria)));
  };

  const toggleAddon = (item: PackageItem): void => {
    if (state.cart.some((i) => i.offerId === item.offerId)) {
      dispatch({ type: 'REMOVE_ITEM', offerId: item.offerId });
    } else {
      dispatch({ type: 'ADD_ITEM', item });
    }
  };

  const confirmPlaced = (placed: { booking: Booking; visaCase: VisaCase }): void => {
    setBooking(placed.booking);
    setVisaCase(placed.visaCase);
    dispatch({ type: 'SET_BOOKING', bookingId: placed.booking.id });
    void clearBookingDraftAction(); // booking placed — drop the resumable draft
  };

  const pay = (): void =>
    start(async () => {
      const result = await startCheckoutAction({
        pilgrims,
        items: state.cart,
        total: SELL_PRICE,
        mode: state.mode,
        ...(state.rawdahRequested ? { rawdahDate: state.criteria.checkIn || '2026-09-02' } : {}),
        ...(state.gift.enabled && state.gift.recipientName.trim()
          ? {
              gift: {
                recipientName: state.gift.recipientName.trim(),
                ...(state.gift.recipientEmail.trim() ? { recipientEmail: state.gift.recipientEmail.trim() } : {}),
                ...(state.gift.message.trim() ? { message: state.gift.message.trim() } : {}),
              },
            }
          : {}),
        ...(() => {
          const reqs = [
            ...state.requests.categories.map((category) => ({ category })),
            ...(state.requests.note.trim() ? [{ category: 'OTHER' as const, note: state.requests.note.trim() }] : []),
          ];
          return reqs.length > 0 ? { specialRequests: reqs } : {};
        })(),
      });
      if (result.status === 'requires_card') {
        setCard({ bookingId: result.bookingId, clientSecret: result.clientSecret, publishableKey: result.publishableKey });
        dispatch({ type: 'GO', step: 'CARD' });
        return;
      }
      confirmPlaced(result.placed);
    });

  /** Card confirmed in the browser → capture + confirm on the server. */
  const finalizeCard = (): void =>
    start(async () => {
      if (!card) return;
      confirmPlaced(await finalizeBookingAction(card.bookingId));
    });

  const refreshVisa = (): void =>
    start(async () => {
      if (booking) setVisaCase(await pollVisaAction(booking.id));
    });

  const back = (step: 'SEARCH' | 'RESULTS' | 'BUILDER' | 'PILGRIMS' | 'CHECKOUT'): (() => void) => () =>
    dispatch({ type: 'GO', step });

  const blankPilgrim = (): PilgrimDraft => ({ firstName: '', lastName: '', passportNumber: '', nationality: 'PK', dob: '1990-01-01', gender: 'M' });
  const goToPilgrims = (): void => {
    const n = Math.max(1, state.criteria.pax);
    setPilgrims((cur) =>
      cur.length === n
        ? cur
        : cur.length > n
          ? cur.slice(0, n)
          : [...cur, ...Array.from({ length: n - cur.length }, blankPilgrim)],
    );
    dispatch({ type: 'GO', step: 'PILGRIMS' });
  };
  const setPilgrimField = (index: number, field: 'firstName' | 'lastName' | 'nationality' | 'passportNumber', value: string): void =>
    setPilgrims((cur) => cur.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  const addPilgrim = (): void => setPilgrims((cur) => [...cur, blankPilgrim()]);
  const removePilgrim = (index: number): void => setPilgrims((cur) => (cur.length > 1 ? cur.filter((_, i) => i !== index) : cur));

  // Results is a multi-column grid on desktop; the other steps read best as a centered column.
  const wide = state.step === 'RESULTS';
  return (
    <div className={`mx-auto w-full ${wide ? 'max-w-6xl' : 'max-w-3xl'} bg-sand-50 shadow-sm`}>
      <div key={state.step} className="animate-rise">
      {state.step === 'SEARCH' && (
        <HomeSearch
          locale={bookLocale}
          criteria={state.criteria}
          onCity={(city: SearchCriteria['city']) => dispatch({ type: 'SET_CRITERIA', criteria: { city } })}
          onPax={(pax: number) => dispatch({ type: 'SET_CRITERIA', criteria: { pax } })}
          onSearch={search}
        />
      )}

      {state.step === 'RESULTS' && (
        <Results locale={bookLocale} criteria={state.criteria} offers={offers} onBuild={build} onBack={back('SEARCH')} />
      )}

      {state.step === 'BUILDER' && (
        <PackageBuilder
          locale={bookLocale}
          items={state.cart}
          totals={cartTotals(state)}
          mode={state.mode}
          onMode={(mode) => dispatch({ type: 'SET_MODE', mode })}
          rawdahRequested={state.rawdahRequested}
          onToggleRawdah={() => dispatch({ type: 'TOGGLE_RAWDAH' })}
          ziyarah={addons.ziyarah}
          catering={addons.catering}
          selectedOfferIds={state.cart.map((i) => i.offerId)}
          onToggleAddon={toggleAddon}
          onContinue={goToPilgrims}
          onBack={back('RESULTS')}
        />
      )}

      {state.step === 'PILGRIMS' && (
        <PilgrimCapture
          locale={bookLocale}
          pilgrims={pilgrims}
          routes={pilgrims.map(previewVisaRoute)}
          onField={setPilgrimField}
          onAdd={addPilgrim}
          onRemove={removePilgrim}
          onContinue={() => dispatch({ type: 'GO', step: 'CHECKOUT' })}
          onBack={back('BUILDER')}
        />
      )}

      {state.step === 'CHECKOUT' && (
        <Checkout
          locale={bookLocale}
          currency={state.currency}
          totalEur={SELL_PRICE}
          onCurrency={(currency) => dispatch({ type: 'SET_CURRENCY', currency })}
          onPay={pay}
          paying={pending}
          onBack={back('PILGRIMS')}
          gift={state.gift}
          onGift={(patch) => dispatch({ type: 'SET_GIFT', gift: patch })}
          requests={state.requests}
          onToggleRequest={(category) => dispatch({ type: 'TOGGLE_REQUEST', category })}
          onRequestNote={(note) => dispatch({ type: 'SET_REQUEST_NOTE', note })}
        />
      )}

      {state.step === 'CARD' && card && (
        <StripePaymentForm
          locale={bookLocale}
          clientSecret={card.clientSecret}
          publishableKey={card.publishableKey}
          amountLabel={formatMoney(SELL_PRICE)}
          onConfirmed={finalizeCard}
          onBack={back('CHECKOUT')}
        />
      )}

      {state.step === 'CONFIRMED' && booking && (
        <div>
          <MyBooking locale={bookLocale} booking={booking} visaCase={visaCase} />
          <div className="bg-sand-50 px-4 pb-6">
            <button
              type="button"
              onClick={refreshVisa}
              disabled={pending}
              className="w-full rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Refresh visa status
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
