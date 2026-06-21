'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Booking } from '@auj/core-booking';
import type { JournalEntry } from '@auj/payments';
// Import specific screen files (not the barrel) so the client bundle never pulls
// node:crypto — the screens barrel re-exports MarkupConfig -> markup -> ids (crypto).
import { AgentDashboard } from './screens/AgentDashboard';
import { MultiPaxBooking } from './screens/MultiPaxBooking';
import { WalletView } from './screens/WalletView';
import { QuotesPanel } from './screens/QuotesPanel';
import { MarkupsPanel } from './screens/MarkupsPanel';
import { Shell } from './screens/Shell';
import { MAX_PAX } from './multipax';
import { formatMoney } from './money';
import type { Agent } from './domain';
import { bookGroupAction, setupAgentAction, statementCsvAction } from './actions';

const PER_PAX_EUR = 100_000;

export function AgentPortal() {
  const t = useTranslations('agent');
  const [agent, setAgent] = useState<Agent>();
  const [balance, setBalance] = useState(0);
  const [creditLimit, setCreditLimit] = useState(600_000);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [paxCount, setPaxCount] = useState(10);
  const [booking, setBooking] = useState<Booking>();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    void setupAgentAction().then((r) => {
      setAgent(r.agent);
      setBalance(r.balance);
      setCreditLimit(r.creditLimit);
      setEntries(r.entries);
    });
  }, []);

  const book = async (): Promise<void> => {
    if (!agent) return;
    setBusy(true);
    setErr(undefined);
    try {
      const r = await bookGroupAction({ paxCount });
      setBooking(r.booking);
      setBalance(r.balance);
      setEntries(r.entries);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Booking failed');
    } finally {
      setBusy(false);
    }
  };

  const downloadStatement = async (): Promise<void> => {
    const csv = await statementCsvAction();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auj-statement.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!agent) return <main className="grid min-h-screen place-items-center bg-sand-50 text-sand-500">{t('loading')}</main>;

  const eur = (amount: number) => ({ amount, currency: 'EUR' as const });
  const sell = eur(paxCount * PER_PAX_EUR);

  return (
    <Shell agencyName={agent.agencyName} subline={`${agent.tier} partner · ${agent.id.slice(0, 8)}`} walletLabel={formatMoney(eur(balance))}>
      <div className="grid gap-7 animate-fade-in">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-[13px] font-semibold text-accent-600">{t('back')}</Link>
        </div>
        <AgentDashboard agent={agent} walletBalance={eur(balance)} available={eur(balance)} bookings={booking ? 1 : 0} />

        <section>
          <h3 className="mb-3 font-serif text-lg font-semibold text-sand-ink">{t('multiPaxHeading', { max: MAX_PAX })}</h3>
          <MultiPaxBooking
            paxCount={paxCount}
            sell={sell}
            canBook={!busy}
            onAddRow={() => setPaxCount((c) => Math.min(MAX_PAX, c + 1))}
            onAdd10={() => setPaxCount((c) => Math.min(MAX_PAX, c + 10))}
            onPayFromWallet={() => void book()}
          />
          {booking ? (
            <div className="mt-3 animate-pop rounded-lg bg-green-100 p-3 text-sm text-sand-ink">
              {t('booked')} <span className="font-mono">{booking.bookingRef}</span> — {t('paxN', { n: booking.pilgrimIds.length })}
            </div>
          ) : null}
          {err ? <div className="mt-3 rounded-lg bg-danger-bg p-3 text-sm text-danger-fg">{err}</div> : null}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-serif text-lg font-semibold text-sand-ink">{t('walletCreditHeading')}</h3>
            <button
              type="button"
              onClick={() => void downloadStatement()}
              className="rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-green-800 transition-transform duration-fast active:scale-[0.98]"
            >
              ↓ Statement (CSV)
            </button>
          </div>
          <WalletView balance={eur(balance)} creditLimit={creditLimit} account={`wallet:${agent.id}`} entries={entries} />
        </section>

        <section>
          <h3 className="mb-3 font-serif text-lg font-semibold text-sand-ink">Markups</h3>
          <MarkupsPanel />
        </section>

        <section>
          <h3 className="mb-3 font-serif text-lg font-semibold text-sand-ink">Quotation builder</h3>
          <QuotesPanel />
        </section>
      </div>
    </Shell>
  );
}
