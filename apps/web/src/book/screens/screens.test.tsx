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

  it('PilgrimCapture surfaces a per-pilgrim e-Visa route for an EU passport', () => {
    const html = renderToStaticMarkup(
      <PilgrimCapture
        locale="en"
        pilgrims={[{ firstName: 'Greta', lastName: 'K', passportNumber: 'LT9', nationality: 'LT', dob: '1990-01-01', gender: 'F' }]}
        routes={[{ route: 'EVISA_DIRECT', warnings: [] }]}
        onField={noop} onContinue={noop}
      />,
    );
    expect(html).toContain('e-Visa');
    expect(html).toContain('Greta');
  });

  it('PilgrimCapture surfaces the agent channel + supports a group with add/remove', () => {
    const html = renderToStaticMarkup(
      <PilgrimCapture
        locale="en"
        pilgrims={[
          { firstName: 'Imran', lastName: 'Ali', passportNumber: 'PK1', nationality: 'PK', dob: '1985-01-01', gender: 'M' },
          { firstName: 'Sara', lastName: 'Ali', passportNumber: 'PK2', nationality: 'PK', dob: '1990-01-01', gender: 'F' },
        ]}
        routes={[{ route: 'AGENT_CHANNEL', warnings: [] }, { route: 'AGENT_CHANNEL', warnings: [] }]}
        onField={noop} onAdd={noop} onRemove={noop} onContinue={noop}
      />,
    );
    expect(html).toContain('Agent channel');
    expect(html).toContain('Pilgrims 2'); // second pilgrim card
    expect(html).toContain('Add pilgrim');
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

  it('PackageBuilder lists ziyarah bundles and catering plans as add-ons', () => {
    const html = renderToStaticMarkup(
      <PackageBuilder
        locale="en"
        items={[]}
        totals={[]}
        ziyarah={[{ id: 'z1', name: 'Makkah heritage tour', net: { amount: 18000, currency: 'SAR' } }]}
        catering={[{ id: 'c1', plan: 'FULL_BOARD', name: 'Full board', city: 'MAKKAH', net: { amount: 9000, currency: 'SAR' } }]}
        selectedOfferIds={['z1']}
        onContinue={noop}
      />,
    );
    expect(html).toContain('Ziyarah bundles');
    expect(html).toContain('Makkah heritage tour');
    expect(html).toContain('Meals &amp; catering');
    expect(html).toContain('Full board');
  });

  it('Results offers a distance-to-Haram sort control', () => {
    const html = renderToStaticMarkup(
      <Results locale="en" criteria={{ city: 'MAKKAH', checkIn: '', checkOut: '', pax: 2 }} offers={[offer]} onBuild={noop} />,
    );
    expect(html).toContain('Distance to Haram');
    expect(html).toContain('Near Haram');
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

  it('Checkout shows the gift toggle and recipient fields when enabled', () => {
    const off = renderToStaticMarkup(
      <Checkout locale="en" currency="EUR" totalEur={{ amount: 120000, currency: 'EUR' }} onCurrency={noop} onPay={noop}
        gift={{ enabled: false, recipientName: '', recipientEmail: '', message: '' }} onGift={noop} />,
    );
    expect(off).toContain('Send as a gift');
    expect(off).not.toContain('Recipient name');

    const on = renderToStaticMarkup(
      <Checkout locale="en" currency="EUR" totalEur={{ amount: 120000, currency: 'EUR' }} onCurrency={noop} onPay={noop}
        gift={{ enabled: true, recipientName: '', recipientEmail: '', message: '' }} onGift={noop} />,
    );
    expect(on).toContain('Recipient name');
  });

  it('Checkout renders the special-requests chips + note', () => {
    const html = renderToStaticMarkup(
      <Checkout locale="en" currency="EUR" totalEur={{ amount: 120000, currency: 'EUR' }} onCurrency={noop} onPay={noop}
        requests={{ categories: ['WHEELCHAIR'], note: '' }} onToggleRequest={noop} onRequestNote={noop} />,
    );
    expect(html).toContain('Special requests');
    expect(html).toContain('Wheelchair access');
    expect(html).toContain('Room near Haram');
  });

  it('MyBooking renders special requests with status', () => {
    const booking: Booking = {
      id: 'sr1', customerId: 'c1', channel: 'PILGRIMAGE', status: 'CONFIRMED',
      pilgrimIds: [], items: [], createdAt: 't0', updatedAt: 't1',
      specialRequests: [{ id: 'r1', category: 'DIETARY', note: 'No nuts', status: 'REQUESTED' }],
    };
    const html = renderToStaticMarkup(<MyBooking locale="en" booking={booking} />);
    expect(html).toContain('Special requests');
    expect(html).toContain('Dietary needs');
    expect(html).toContain('No nuts');
    expect(html).toContain('REQUESTED');
  });

  it('MyBooking renders a gift voucher card', () => {
    const booking: Booking = {
      id: 'g1', customerId: 'c1', channel: 'PILGRIMAGE', status: 'CONFIRMED',
      pilgrimIds: [], items: [], createdAt: 't0', updatedAt: 't1',
      gift: { recipientName: 'Mother', recipientEmail: 'mum@example.com', message: 'For you', voucherCode: 'AUJ-GIFT-ABCD1234', redeemed: false },
    };
    const html = renderToStaticMarkup(<MyBooking locale="en" booking={booking} />);
    expect(html).toContain('Gift voucher');
    expect(html).toContain('AUJ-GIFT-ABCD1234');
    expect(html).toContain('For Mother');
    expect(html).toContain('Active');
  });
});
