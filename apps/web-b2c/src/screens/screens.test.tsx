import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { HotelOffer } from '@auj/contracts';
import { Results } from './Results';
import { PilgrimCapture } from './PilgrimCapture';
import { Checkout } from './Checkout';

const noop = (): void => undefined;

const offer: HotelOffer = {
  id: 'h1', name: 'Swissotel Makkah', city: 'MAKKAH', starRating: 5,
  nightlyNet: { amount: 95000, currency: 'SAR' }, nusukApproved: true,
};

describe('B2C screens', () => {
  it('Results lists offers with a Nusuk pill and price', () => {
    const html = renderToStaticMarkup(<Results locale="en" offers={[offer]} onBuild={noop} />);
    expect(html).toContain('Swissotel Makkah');
    expect(html).toContain('Nusuk');
    expect(html).toContain('SAR');
  });

  it('PilgrimCapture surfaces the e-Visa route for an EU passport', () => {
    const html = renderToStaticMarkup(
      <PilgrimCapture
        locale="en" firstName="Greta" nationality="LT" passportNumber="LT9"
        route={{ route: 'EVISA_DIRECT', warnings: [] }}
        onField={noop} onContinue={noop}
      />,
    );
    expect(html).toContain('e-Visa');
    expect(html).toContain('bg-success-bg');
  });

  it('PilgrimCapture surfaces the agent channel for a PK passport', () => {
    const html = renderToStaticMarkup(
      <PilgrimCapture
        locale="en" firstName="Imran" nationality="PK" passportNumber="PK1"
        route={{ route: 'AGENT_CHANNEL', warnings: [] }}
        onField={noop} onContinue={noop}
      />,
    );
    expect(html).toContain('Agent channel');
  });

  it('Checkout shows EUR total with a PKR equivalent and EUR disclaimer', () => {
    const html = renderToStaticMarkup(
      <Checkout locale="en" currency="EUR" totalEur={{ amount: 120000, currency: 'EUR' }} onCurrency={noop} onPay={noop} />,
    );
    expect(html).toContain('€1,200.00');
    expect(html).toContain('≈ ₨');
    expect(html).toContain('charged in EUR');
  });
});
