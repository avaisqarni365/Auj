import { formatMoney } from '../currency';
import { selectTravelSupplier, selectedSupplierKind } from '../connectors';
import { ContractRunner } from './ContractRunner';

// Travel Suppliers ops — bedbank/GDS net offers THROUGH the TravelSupplier interface (mock by
// default). search → book → cancel all run on the interface, so a live supplier is a drop-in.
export async function SuppliersConsole() {
  const s = selectTravelSupplier();
  const [hotels, flights] = await Promise.all([
    s.searchHotels({ city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 2, country: 'SA' }),
    s.searchFlights({ from: 'VNO', to: 'JED', date: '2026-09-01', pax: 2 }),
  ]);
  const kind = selectedSupplierKind();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-[clamp(1.6rem,4vw,2.25rem)] font-semibold">🧭 Travel suppliers</h1>
        <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${kind === 'live' ? 'bg-success-bg text-success-fg' : 'bg-accent-100 text-accent-700'}`}>
          via TravelSupplier · {kind}
        </span>
      </div>
      <p className="mt-2 max-w-[60ch] text-sand-500">Net offers from the general-travel supply. search → book → cancel run on the <span className="font-mono">TravelSupplier</span> interface.</p>

      <section className="mt-6 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-sand-800">Hotels (net) · {hotels.length}</h2>
        <ul className="mt-3 grid gap-2">
          {hotels.map((h) => (
            <li key={h.id} className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-3 text-[13.5px]">
              <span className="text-sand-700">
                {h.name} <span className="text-[12px] text-sand-400">· {h.city} · {h.starRating}★</span>
              </span>
              <span className="font-mono font-semibold text-green-800">{formatMoney(h.nightlyNet)}<span className="text-[11px] font-normal text-sand-400">/night</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-sand-800">Flights (net) · {flights.length}</h2>
        <ul className="mt-3 grid gap-2">
          {flights.map((f) => (
            <li key={f.id} className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-3 text-[13.5px]">
              <span className="text-sand-700">
                {f.carrier} <span className="font-mono text-[12px] text-sand-400">{new Date(f.depart).toLocaleString('en-GB')}</span>
              </span>
              <span className="font-mono font-semibold text-green-800">{formatMoney(f.net)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-sand-800">Contract tests</h2>
        <p className="mt-1 text-[13px] text-sand-500">
          Runs the shared <span className="font-mono">@auj/contracts</span> TravelSupplier suite live against the active supplier ({kind}).
        </p>
        <div className="mt-3">
          <ContractRunner target="supplier" label="TravelSupplier" />
        </div>
      </section>
    </div>
  );
}
