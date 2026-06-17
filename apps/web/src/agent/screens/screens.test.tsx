import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { MultiPaxBooking } from './MultiPaxBooking';
import { MarkupConfig } from './MarkupConfig';
import { Statements } from './Statements';
import { AgentDashboard } from './AgentDashboard';
import type { Agent, MarkupRule, Statement } from '../domain';
import messages from '../../../messages/en.json';

const noop = (): void => undefined;

// Components that now use next-intl (Shell/AgentDashboard/MultiPaxBooking) need the provider.
const intl = (node: ReactNode): string =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );

describe('B2B screens', () => {
  it('MultiPaxBooking shows the 49-pax counter and disables when full', () => {
    const html = intl(
      <MultiPaxBooking paxCount={49} sell={{ amount: 4900000, currency: 'EUR' }} canBook onAddRow={noop} onAdd10={noop} onPayFromWallet={noop} />,
    );
    expect(html).toContain('49 / 49');
    expect(html).toContain('Pay from wallet');
    expect(html).toContain('disabled'); // add buttons disabled at the cap
  });

  it('MarkupConfig previews net -> sell', () => {
    const rules: MarkupRule[] = [{ id: '1', tier: 'GOLD', kind: 'PERCENT', value: 10, enabled: true }];
    const html = renderToStaticMarkup(<MarkupConfig rules={rules} previewNet={{ amount: 100000, currency: 'EUR' }} onToggle={noop} />);
    expect(html).toContain('€1,000.00');
    expect(html).toContain('€1,100.00'); // +10%
  });

  it('Statements renders KPIs and an export button', () => {
    const statement: Statement = {
      account: 'wallet:a1', currency: 'EUR', opening: 0, debits: 40000, credits: 100000, closing: 60000,
      rows: [{ date: 'd', ref: 'topup', description: 'top-up', debit: 0, credit: 100000, balance: 100000 }],
    };
    const html = renderToStaticMarkup(<Statements statement={statement} onExportCSV={noop} />);
    expect(html).toContain('Export CSV');
    expect(html).toContain('€600.00'); // closing
  });

  it('AgentDashboard shows status pill', () => {
    const agent: Agent = { id: 'a', agencyName: 'Al Noor', email: 'e@x', tier: 'GOLD', status: 'APPROVED', createdAt: 't' };
    const html = intl(
      <AgentDashboard agent={agent} walletBalance={{ amount: 100000, currency: 'EUR' }} available={{ amount: 150000, currency: 'EUR' }} bookings={3} />,
    );
    expect(html).toContain('Al Noor');
    expect(html).toContain('APPROVED');
  });
});
