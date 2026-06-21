import Link from 'next/link';
import { Logo } from '@auj/ui';
import { getAgentDb } from '../../../../src/agent/agent-db';
import { formatMoney } from '../../../../src/agent/money';

// Public, read-only shareable quote (by human ref). No login — the agent shares this link
// with their customer. Only quote totals/lines are shown; nothing agency-private.
export default async function SharedQuotePage({ params }: { params: { ref: string } }) {
  const quote = await (await getAgentDb()).findByRef(decodeURIComponent(params.ref));
  const eur = (m: number) => ({ amount: m, currency: 'EUR' as const });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#ECE7DD] px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-sand-200 bg-white p-7 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <Logo size={36} />
          <span className="font-mono text-[12px] text-sand-500">{quote ? quote.ref : 'QUOTE'}</span>
        </div>

        {!quote ? (
          <div className="py-8 text-center">
            <h1 className="font-serif text-xl font-semibold">Quote not found</h1>
            <p className="mt-2 text-sm text-sand-500">This quote link is invalid or has expired.</p>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-2xl font-semibold">Your AUJ quotation</h1>
            <p className="mt-1 text-[13px] text-sand-500">
              Status: <span className="font-semibold">{quote.status}</span>
            </p>

            <ul className="mt-5 divide-y divide-sand-100 rounded-xl border border-sand-200">
              {quote.lines.map((l, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-[14px]">
                  <span className="text-sand-700">{l.label}</span>
                  <span className="font-mono font-semibold text-sand-800">{formatMoney(l.net)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 grid gap-1.5 text-[14px]">
              <div className="flex justify-between text-sand-500">
                <dt>Net</dt>
                <dd className="font-mono">{formatMoney(eur(quote.netMinor))}</dd>
              </div>
              <div className="flex justify-between text-sand-500">
                <dt>Service &amp; markup</dt>
                <dd className="font-mono">{formatMoney(eur(quote.markupMinor))}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-sand-200 pt-2 text-[16px] font-semibold text-green-800">
                <dt>Total (EUR)</dt>
                <dd className="font-mono">{formatMoney(eur(quote.sellMinor))}</dd>
              </div>
            </dl>

            <p className="mt-4 text-[12px] text-sand-500">Charged in EUR. Prices are indicative until confirmed.</p>
          </>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-[13px] font-semibold text-accent-600">
            ← AUJ — Pilgrimage &amp; travel
          </Link>
        </div>
      </div>
    </main>
  );
}
