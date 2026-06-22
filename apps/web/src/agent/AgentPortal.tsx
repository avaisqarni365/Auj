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
import { LedgerView } from './screens/LedgerView';
import { Statements } from './screens/Statements';
import { QuotesPanel } from './screens/QuotesPanel';
import { MarkupsPanel } from './screens/MarkupsPanel';
import { Shell } from './screens/Shell';
import { buildStatement } from './statements';
import { MAX_PAX } from './multipax';
import { formatMoney } from './money';
import type { Agent } from './domain';
import { bookGroupAction, setupAgentAction, statementCsvAction, topUpWalletAction } from './actions';

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
  const [topUpEur, setTopUpEur] = useState('1000');
  const [toppingUp, setToppingUp] = useState(false);

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

  const topUp = async (): Promise<void> => {
    const eur = Number(topUpEur);
    if (!Number.isFinite(eur) || eur < 1) {
      setErr('Enter a top-up amount of at least €1.');
      return;
    }
    setToppingUp(true);
    setErr(undefined);
    try {
      const r = await topUpWalletAction(Math.round(eur * 100));
      setBalance(r.balance);
      setEntries(r.entries);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Top-up failed');
    } finally {
      setToppingUp(false);
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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif text-lg font-semibold text-sand-ink">Payments &amp; ledger</h3>
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-semibold text-sand-500">Top up €</span>
              <input
                type="number"
                min={1}
                step={50}
                value={topUpEur}
                onChange={(e) => setTopUpEur(e.target.value)}
                aria-label="Top-up amount in EUR"
                className="w-24 rounded-[10px] border-[1.5px] border-sand-300 bg-white px-2.5 py-1.5 text-[13px] font-mono text-sand-ink focus:border-green-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void topUp()}
                disabled={toppingUp}
                className="rounded-[10px] bg-green-800 px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-[transform,background-color] duration-fast hover:bg-green-700 active:scale-[0.98] disabled:opacity-50"
              >
                {toppingUp ? 'Topping up…' : '+ Top up'}
              </button>
            </div>
          </div>
          <LedgerView agencyName={agent.agencyName} balance={balance} creditLimit={creditLimit} account={`wallet:${agent.id}`} entries={entries} />
        </section>

        <section>
          <h3 className="mb-3 font-serif text-lg font-semibold text-sand-ink">Markups</h3>
          <MarkupsPanel />
        </section>

        <section>
          <h3 className="mb-3 font-serif text-lg font-semibold text-sand-ink">Quotation builder</h3>
          <QuotesPanel />
        </section>

        <section>
          <h3 className="mb-3 font-serif text-lg font-semibold text-sand-ink">Statements</h3>
          <Statements statement={buildStatement(entries, `wallet:${agent.id}`, 'EUR')} onExportCSV={() => void downloadStatement()} />
        </section>
      </div>
    </Shell>
  );
}
