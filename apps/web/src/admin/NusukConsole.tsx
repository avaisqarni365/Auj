import type { SearchCriteria } from '@auj/contracts';
import { formatMoney } from '../currency';
import { selectSaudiConnector, selectedConnectorKind } from '../connectors';
import { ScreenFrame } from '../components/ScreenFrame';

// Nusuk Services ops — proves approved-agent parity THROUGH the SaudiConnector interface
// (the mock by default). Package modes, Rawdah slots, ziyarah + catering add-ons, e-services.
const SAMPLE: SearchCriteria = { city: 'MADINAH', checkIn: '2026-09-02', checkOut: '2026-09-06', pax: 2 };
const PACKAGE_MODES = [
  { mode: 'COMPREHENSIVE', label: 'Comprehensive', note: 'Visa included — full package' },
  { mode: 'VISA_OPTIONAL', label: 'Visa-optional', note: 'Pilgrim holds their own visa' },
  { mode: 'CUSTOM', label: 'Custom', note: 'Build-your-own cart' },
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-sand-800">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export async function NusukConsole() {
  const c = selectSaudiConnector();
  const [ziyarah, catering, slots] = await Promise.all([c.searchZiyarah(SAMPLE), c.searchCatering(SAMPLE), c.searchRawdahSlots('2026-09-03')]);
  const kind = selectedConnectorKind();

  return (
    <ScreenFrame label="🕋 Nusuk services" tag={`via SaudiConnector · ${kind === 'saudi' ? 'certified' : 'mock'}`}>
      <p className="max-w-[60ch] text-sand-500">Approved-agent parity — every call goes through the regulated interface, so the certified adapter is a drop-in swap.</p>

      <div className="mt-6 grid gap-4">
        <Card title="Package modes">
          <div className="grid gap-2.5 sm:grid-cols-3">
            {PACKAGE_MODES.map((m) => (
              <div key={m.mode} className="rounded-xl border border-sand-200 bg-sand-50 p-3.5">
                <div className="text-[14px] font-semibold text-sand-800">{m.label}</div>
                <div className="mt-0.5 text-[12px] text-sand-500">{m.note}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={`Rawdah permit slots · ${slots.length}`}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {slots.map((s) => (
              <li key={s.slotId} className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-3 text-[13px]">
                <span className="font-mono text-sand-700">{new Date(s.startsAt).toLocaleString('en-GB', { timeZone: 'Asia/Riyadh' })}</span>
                <span className="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-800">cap {s.capacity}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-sand-500">Booked via <span className="font-mono">SaudiConnector.bookRawdah</span> against the pilgrim list.</p>
        </Card>

        <Card title={`Ziyarah bundles · ${ziyarah.length}`}>
          <ul className="grid gap-2">
            {ziyarah.map((z) => (
              <li key={z.id} className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-3 text-[13.5px]">
                <span className="text-sand-700">{z.name}</span>
                <span className="font-mono font-semibold text-green-800">{formatMoney(z.net)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={`Catering plans · ${catering.length}`}>
          <ul className="grid gap-2">
            {catering.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-3 text-[13.5px]">
                <span className="text-sand-700">
                  {m.name} <span className="font-mono text-[11px] text-sand-400">{m.plan}</span>
                </span>
                <span className="font-mono font-semibold text-green-800">{formatMoney(m.net)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </ScreenFrame>
  );
}
