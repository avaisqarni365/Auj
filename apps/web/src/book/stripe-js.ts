// Minimal, dependency-free Stripe.js loader. We load the SDK from js.stripe.com (Stripe
// requires their script be served from their domain for PCI SAQ-A — bundling it is not
// allowed), so there is no npm dependency and the offline build/test gate stays green.
// Only the handful of Stripe.js surfaces we actually use are typed here.

export interface StripeElement {
  mount(selectorOrNode: string | HTMLElement): void;
  unmount(): void;
}
export interface StripeElements {
  create(type: 'payment', options?: Record<string, unknown>): StripeElement;
}
export interface ConfirmPaymentResult {
  error?: { message?: string };
  paymentIntent?: { status: string };
}
export interface Stripe {
  elements(options: { clientSecret: string; appearance?: Record<string, unknown> }): StripeElements;
  confirmPayment(opts: {
    elements: StripeElements;
    redirect: 'if_required';
    confirmParams?: Record<string, unknown>;
  }): Promise<ConfirmPaymentResult>;
}

type StripeCtor = (publishableKey: string) => Stripe;
const SRC = 'https://js.stripe.com/v3/';
let scriptPromise: Promise<void> | undefined;

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Stripe.js is browser-only'));
  const w = window as unknown as { Stripe?: StripeCtor };
  if (w.Stripe) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    const onload = (): void => resolve();
    const onerror = (): void => reject(new Error('Failed to load Stripe.js'));
    if (existing) {
      existing.addEventListener('load', onload);
      existing.addEventListener('error', onerror);
      return;
    }
    const el = document.createElement('script');
    el.src = SRC;
    el.async = true;
    el.addEventListener('load', onload);
    el.addEventListener('error', onerror);
    document.head.appendChild(el);
  });
  return scriptPromise;
}

/** Load Stripe.js (once) and return an initialized Stripe instance for the publishable key. */
export async function loadStripe(publishableKey: string): Promise<Stripe> {
  await loadScript();
  const ctor = (window as unknown as { Stripe?: StripeCtor }).Stripe;
  if (!ctor) throw new Error('Stripe.js did not initialize');
  return ctor(publishableKey);
}
