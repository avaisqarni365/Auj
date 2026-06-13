import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Booking, VisaCase } from '@auj/core-booking';
import type { SecurityCertificate } from '@auj/compliance';
import { AdminDashboard } from './AdminDashboard';
import { BookingsTable } from './BookingsTable';
import { CompliancePanel } from './CompliancePanel';
import { VisaMonitor } from './VisaMonitor';

const noop = (): void => undefined;

describe('admin screens', () => {
  it('AdminDashboard shows KPI values incl. revenue', () => {
    const html = renderToStaticMarkup(
      <AdminDashboard metrics={{ totalBookings: 3, active: 2, visaIssued: 1, revenueEur: { amount: 120000, currency: 'EUR' } }} />,
    );
    expect(html).toContain('Revenue');
    expect(html).toContain('€1,200.00');
  });

  it('BookingsTable lists a booking with a status pill and actions', () => {
    const booking: Booking = {
      id: 'b1', customerId: 'c1', channel: 'PILGRIMAGE', status: 'CONFIRMED', pilgrimIds: ['p1'],
      items: [], bookingRef: 'BK-1', createdAt: 't', updatedAt: 't',
    };
    const html = renderToStaticMarkup(<BookingsTable bookings={[booking]} onCancel={noop} onRefund={noop} />);
    expect(html).toContain('BK-1');
    expect(html).toContain('CONFIRMED');
    expect(html).toContain('Cancel');
    expect(html).toContain('Refund');
  });

  it('VisaMonitor renders an issued case as success', () => {
    const v: VisaCase = { id: 'v1', bookingId: 'b1', visaRef: 'VR1', route: 'AGENT_CHANNEL', status: 'ISSUED', perPilgrim: [] };
    const html = renderToStaticMarkup(<VisaMonitor cases={[v]} />);
    expect(html).toContain('VR1');
    expect(html).toContain('ISSUED');
    expect(html).toContain('bg-success-bg');
  });

  it('CompliancePanel lists a certificate with GDPR actions', () => {
    const cert: SecurityCertificate = {
      id: 'CERT-1', bookingRef: 'BK-1', customerId: 'c1', customerName: 'Imran', tier: 'T50K',
      coverage: { amount: 5000000, currency: 'EUR' }, insurer: 'X', issuedAt: 't', deliveredAt: 't', content: '...',
    };
    const html = renderToStaticMarkup(<CompliancePanel certificates={[cert]} onExport={noop} onErase={noop} />);
    expect(html).toContain('CERT-1');
    expect(html).toContain('Export');
    expect(html).toContain('Erase');
  });
});
