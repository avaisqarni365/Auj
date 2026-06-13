'use client';

import { useEffect, useState } from 'react';
import type { Booking } from '@auj/core-booking';
import type { JournalEntry } from '@auj/payments';
// Import specific screen files (not the barrel) so the client bundle never pulls
// node:crypto — the screens barrel re-exports MarkupConfig -> markup -> ids (crypto).
import { AgentDashboard } from '../src/screens/AgentDashboard';
import { MultiPaxBooking } from '../src/screens/MultiPaxBooking';
import { WalletView } from '../src/screens/WalletView';
import { Shell } from '../src/screens/Shell';
import { MAX_PAX } from '../src/multipax';
import { formatMoney } from '../src/money';
import type { Agent } from '../src/domain';
import { bookGroupAction, setupAgentAction } from './actions';

const PER_PAX_EUR = 100_000;

export default function Page() {
  const [agent, setAgent] = useState<Agent>();
  const [balance, setBalance] = useState(0);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [paxCount, setPaxCount] = useState(10);
  const [booking, setBooking] = useState<Booking>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void setupAgentAction().then((r) => {
      setAgent(r.agent);
      setBalance(r.balance);
    });
  }, []);

  const book = async (): Promise<void> => {
    if (!agent) return;
    setBusy(true);
    try {
      const r = await bookGroupAction({ agentId: agent.id, paxCount });
      setBooking(r.booking);
      setBalance(r.balance);
      setEntries(r.entries);
    } finally {
      setBusy(false);
    }
  };

  if (!agent) return <main className="grid min-h-screen place-items-center bg-sand-50 text-sand-500">Loading agent…</main>;

  const eur = (amount: number) => ({ amount, currency: 'EUR' as const });
  const sell = eur(paxCount * PER_PAX_EUR);

  return (
    <Shell agencyName={agent.agencyName} subline={`${agent.tier} partner · ${agent.id.slice(0, 8)}`} walletLabel={formatMoney(eur(balance))}>
      <div className="grid gap-7 animate-fade-in">
        <AgentDashboard agent={agent} walletBalance={eur(balance)} available={eur(balance)} bookings={booking ? 1 : 0} />

        <section>
          <h3 className="mb-3 font-serif text-lg font-semibold text-sand-ink">Multi-passenger booking · up to {MAX_PAX} pax</h3>
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
              Booked <span className="font-mono">{booking.bookingRef}</span> — {booking.pilgrimIds.length} pax
            </div>
          ) : null}
        </section>

        <section>
          <h3 className="mb-3 font-serif text-lg font-semibold text-sand-ink">Wallet &amp; credit</h3>
          <WalletView balance={eur(balance)} creditLimit={600_000} account={`wallet:${agent.id}`} entries={entries} />
        </section>
      </div>
    </Shell>
  );
}
