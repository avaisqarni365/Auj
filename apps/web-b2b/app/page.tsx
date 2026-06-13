'use client';

import { useEffect, useState } from 'react';
import type { Booking } from '@auj/core-booking';
import type { JournalEntry } from '@auj/payments';
// Import specific screen files (not the barrel) so the client bundle never pulls
// node:crypto — the screens barrel re-exports MarkupConfig -> markup -> ids (crypto).
import { AgentDashboard } from '../src/screens/AgentDashboard';
import { MultiPaxBooking } from '../src/screens/MultiPaxBooking';
import { WalletView } from '../src/screens/WalletView';
import { MAX_PAX } from '../src/multipax';
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

  if (!agent) return <main className="p-6 text-sand-500">Loading agent…</main>;

  const eur = (amount: number) => ({ amount, currency: 'EUR' as const });
  const sell = eur(paxCount * PER_PAX_EUR);

  return (
    <main className="mx-auto grid max-w-3xl gap-4 p-6">
      <header className="flex items-center justify-between">
        <span className="font-serif text-xl font-semibold text-green-800">AUJ — Agent Portal</span>
      </header>

      <AgentDashboard agent={agent} walletBalance={eur(balance)} available={eur(balance)} bookings={booking ? 1 : 0} />

      <MultiPaxBooking
        paxCount={paxCount}
        sell={sell}
        canBook={!busy}
        onAddRow={() => setPaxCount((c) => Math.min(MAX_PAX, c + 1))}
        onAdd10={() => setPaxCount((c) => Math.min(MAX_PAX, c + 10))}
        onPayFromWallet={() => void book()}
      />

      {booking ? (
        <div className="rounded-lg bg-green-100 p-3 text-sm text-sand-ink">
          Booked <span className="font-mono">{booking.bookingRef}</span> — {booking.pilgrimIds.length} pax
        </div>
      ) : null}

      <WalletView balance={eur(balance)} creditLimit={0} account={`wallet:${agent.id}`} entries={entries} />
    </main>
  );
}
