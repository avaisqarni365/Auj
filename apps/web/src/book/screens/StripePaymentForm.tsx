'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@auj/ui';
import { loadStripe, type Stripe, type StripeElements } from '../stripe-js';
import { t, type Locale } from '../i18n';
import { ScreenHeader } from './Brand';

export interface StripePaymentFormProps {
  locale: Locale;
  clientSecret: string;
  publishableKey: string;
  amountLabel: string;
  /** Called once the card is confirmed (intent is authorized) so the server can capture. */
  onConfirmed: () => void;
  onBack?: () => void;
}

/**
 * Real card collection via Stripe.js: mounts the Payment Element, confirms the card
 * (manual-capture → the intent becomes `requires_capture`), then hands control back so
 * the server captures. PANs never touch our code — the iframe is served by Stripe.
 */
export function StripePaymentForm({ locale, clientSecret, publishableKey, amountLabel, onConfirmed, onBack }: StripePaymentFormProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<Stripe>();
  const elementsRef = useRef<StripeElements>();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    loadStripe(publishableKey)
      .then((stripe) => {
        if (cancelled || !mountRef.current) return;
        const elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });
        const paymentEl = elements.create('payment');
        paymentEl.mount(mountRef.current);
        stripeRef.current = stripe;
        elementsRef.current = elements;
        setReady(true);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load the payment form');
      });
    return () => {
      cancelled = true;
    };
  }, [clientSecret, publishableKey]);

  const submit = async (): Promise<void> => {
    const stripe = stripeRef.current;
    const elements = elementsRef.current;
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(undefined);
    try {
      const result = await stripe.confirmPayment({ elements, redirect: 'if_required' });
      if (result.error) {
        setError(result.error.message ?? 'Your card could not be confirmed');
        setSubmitting(false);
        return;
      }
      const status = result.paymentIntent?.status;
      // Manual-capture intents land on `requires_capture`; `succeeded` covers auto-capture.
      if (status === 'requires_capture' || status === 'succeeded') {
        onConfirmed();
        return; // keep the spinner until the parent advances
      }
      setError(`Unexpected payment status: ${status ?? 'unknown'}`);
      setSubmitting(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Payment failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50">
      <ScreenHeader title={t(locale, 'checkout')} onBack={onBack} right={<span className="text-success-fg">🔒 Secure</span>} />
      <div className="p-4">
        <div className="mb-4 rounded-2xl border border-sand-200 bg-white p-4">
          <div className="mb-1 text-[13px] font-bold">Card details</div>
          <p className="mb-3 text-[12px] text-sand-500">Processed securely by Stripe. We never see your card number.</p>
          <div ref={mountRef} className="min-h-[44px]" aria-busy={!ready} />
          {!ready && !error ? <p className="mt-2 text-[12px] text-sand-400">Loading secure card form…</p> : null}
        </div>

        {error ? (
          <div role="alert" className="mb-4 flex items-start gap-2 rounded-[10px] border border-danger-fg/30 bg-danger-bg px-3 py-2.5">
            <span className="text-sm">⚠️</span>
            <span className="text-xs leading-snug text-danger-fg">{error}</span>
          </div>
        ) : null}

        <Button
          className="w-full !py-3.5 text-[15px] shadow-[0_6px_16px_rgba(15,81,50,0.25)]"
          onClick={submit}
          disabled={!ready || submitting}
        >
          {submitting ? 'Processing…' : `${t(locale, 'pay')} ${amountLabel}`}
        </Button>
        <p className="mt-3 text-center text-[11.5px] text-sand-500">By paying you accept AUJ&apos;s terms &amp; the pilgrimage conditions.</p>
      </div>
    </div>
  );
}
