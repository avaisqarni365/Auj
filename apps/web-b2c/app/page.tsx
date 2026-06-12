'use client';

import { useReducer, useState, useTransition } from 'react';
import type { HotelOffer, SearchCriteria } from '@auj/contracts';
import type { Booking, PackageItem, VisaCase } from '@auj/core-booking';
// Import from specific modules (not the barrel) so the client bundle never pulls
// in the in-process backend, which depends on node:crypto via core-booking.
import { Checkout, HomeSearch, MyBooking, PackageBuilder, PilgrimCapture, Results } from '../src/screens';
import { cartTotals, funnelReducer, initialFunnel, type PilgrimDraft } from '../src/funnel';
import { previewVisaRoute } from '../src/usecases';
import { placeBookingAction, pollVisaAction, searchHotelsAction } from './actions';

const SELL_PRICE = { amount: 120000, currency: 'EUR' as const }; // demo sell price, charged in EUR

const DEFAULT_PILGRIM: PilgrimDraft = {
  firstName: 'Imran',
  lastName: 'Ali',
  passportNumber: 'PK1234567',
  nationality: 'PK',
  dob: '1985-04-12',
  gender: 'M',
};

export default function Page() {
  const [state, dispatch] = useReducer(funnelReducer, undefined, initialFunnel);
  const [offers, setOffers] = useState<HotelOffer[]>([]);
  const [pilgrim, setPilgrim] = useState<PilgrimDraft>(DEFAULT_PILGRIM);
  const [booking, setBooking] = useState<Booking>();
  const [visaCase, setVisaCase] = useState<VisaCase>();
  const [pending, start] = useTransition();

  const search = (): void =>
    start(async () => {
      setOffers(await searchHotelsAction(state.criteria));
      dispatch({ type: 'GO', step: 'RESULTS' });
    });

  const build = (offer: HotelOffer): void => {
    const item: PackageItem = { kind: 'HOTEL', offerId: offer.id, title: offer.name, net: offer.nightlyNet };
    dispatch({ type: 'ADD_ITEM', item });
    dispatch({ type: 'GO', step: 'BUILDER' });
  };

  const pay = (): void =>
    start(async () => {
      const placed = await placeBookingAction({
        customer: { fullName: `${pilgrim.firstName} ${pilgrim.lastName}`, email: 'demo@auj.example' },
        pilgrims: [pilgrim],
        items: state.cart,
        total: SELL_PRICE,
      });
      setBooking(placed.booking);
      setVisaCase(placed.visaCase);
      dispatch({ type: 'SET_BOOKING', bookingId: placed.booking.id });
    });

  const refreshVisa = (): void =>
    start(async () => {
      if (booking) setVisaCase(await pollVisaAction(booking.id));
    });

  return (
    <main className="mx-auto max-w-md p-4">
      <header className="mb-4 flex items-center justify-between">
        <span className="font-serif text-xl font-semibold text-green-800">AUJ</span>
        <span className="text-xs text-sand-500">{state.step.toLowerCase()}</span>
      </header>

      {state.step === 'SEARCH' && (
        <HomeSearch
          locale="en"
          criteria={state.criteria}
          onCity={(city: SearchCriteria['city']) => dispatch({ type: 'SET_CRITERIA', criteria: { city } })}
          onPax={(pax: number) => dispatch({ type: 'SET_CRITERIA', criteria: { pax } })}
          onSearch={search}
        />
      )}

      {state.step === 'RESULTS' && <Results locale="en" offers={offers} onBuild={build} />}

      {state.step === 'BUILDER' && (
        <PackageBuilder
          locale="en"
          items={state.cart}
          totals={cartTotals(state)}
          onContinue={() => dispatch({ type: 'GO', step: 'PILGRIMS' })}
        />
      )}

      {state.step === 'PILGRIMS' && (
        <PilgrimCapture
          locale="en"
          firstName={pilgrim.firstName}
          nationality={pilgrim.nationality}
          passportNumber={pilgrim.passportNumber}
          route={previewVisaRoute(pilgrim)}
          onField={(field, value) => setPilgrim((p) => ({ ...p, [field]: value }))}
          onContinue={() => dispatch({ type: 'GO', step: 'CHECKOUT' })}
        />
      )}

      {state.step === 'CHECKOUT' && (
        <Checkout
          locale="en"
          currency={state.currency}
          totalEur={SELL_PRICE}
          onCurrency={(currency) => dispatch({ type: 'SET_CURRENCY', currency })}
          onPay={pay}
          paying={pending}
        />
      )}

      {state.step === 'CONFIRMED' && booking && (
        <div className="grid gap-3">
          <MyBooking locale="en" booking={booking} visaCase={visaCase} />
          <button
            type="button"
            onClick={refreshVisa}
            disabled={pending}
            className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Refresh visa status
          </button>
        </div>
      )}
    </main>
  );
}
