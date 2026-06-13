import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { HotelOffer } from '@auj/contracts';
import { Results } from './Results';
import { PilgrimCapture } from './PilgrimCapture';
import { Checkout } from './Checkout';
import { PackageBuilder } from './PackageBuilder';
import { MyBooking } from './MyBooking';
import type { Booking } from '@auj/core-booking';

const noop = (): void => undefined;

const offer: HotelOffer = {
  id: 'h1', name: 'Swissotel Makkah', city: 'MAKKAH', starRating: 5,
  nightlyNet: { amount: 95000, currency: 'SAR' }, nusukApproved: true,
};

describe('B2C screens', () => {
  it('Results lists offers with a Nusuk pill and price', () => {
    const html = renderToStaticMarkup(
      <Results locale="en" criteria={{ city: 'MAKKAH', checkIn: '', checkOut: '', pax: 4 }} offers={[offer]} onBuild={noop} />,
    );
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

  it('PackageBuilder offers the Nusuk package modes and the Rawdah permit add-on', () => {
    const html = renderToStaticMarkup(
      <PackageBuilder locale="en" items={[]} totals={[]} mode="VISA_OPTIONAL" rawdahRequested onContinue={noop} />,
    );
    expect(html).toContain('Package mode');
    expect(html).toContain('Comprehensive');
    expect(html).toContain('Visa optional');
    expect(html).toContain('Rawdah permit');
    expect(html).toContain('Bring your own visa'); // active mode hint
  });

  it('MyBooking renders a confirmed Rawdah permit and the package mode', () => {
    const booking: Booking = {
      id: 'bk1', customerId: 'c1', channel: 'PILGRIMAGE', mode: 'COMPREHENSIVE', status: 'CONFIRMED',
      pilgrimIds: ['p1'], items: [], createdAt: 't0', updatedAt: 't1',
      rawdah: { permitRef: 'RWD-123', slotId: 's1', startsAt: '2026-09-02T03:00:00.000Z', pilgrimIds: ['p1'], status: 'CONFIRMED' },
    };
    const html = renderToStaticMarkup(<MyBooking locale="en" booking={booking} />);
    expect(html).toContain('Rawdah permit');
    expect(html).toContain('RWD-123');
    expect(html).toContain('Comprehensive package');
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
