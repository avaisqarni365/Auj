import type { SearchCriteria } from '@auj/contracts';
import { selectSaudiConnector, selectedConnectorKind } from '../connectors';
import { findProvider, providerStatus } from './providers';
import { ContractRunner } from './ContractRunner';
import { ScreenFrame } from '../components/ScreenFrame';

// Saudi Connector ops console — the gated certified adapter behind the SaudiConnector seam.
// Shows the auth gate, domain mapping, resilience posture and the 2025 Nusuk-approved-hotel rule,
// verified live against the active adapter (mock by default).
const SAMPLE: SearchCriteria = { city: 'MAKKAH', checkIn: '2026-09-01', checkOut: '2026-09-05', pax: 2 };

const DOMAIN_MAP = [
  ['searchHotels → HotelOffer', 'Maqam hotel inventory → cart HOTEL line'],
  ['searchTransport → TransportOffer', 'Naqaba transport → GROUND line'],
  ['searchZiyarah / searchCatering', 'Nusuk add-ons → ziyarah / catering lines'],
  ['hold → confirm → BRN', 'Booking Reference Numbers for visa processing'],
  ['createVisaApplication / getVisaStatus', 'e-Visa lifecycle (MOFA)'],
  ['searchRawdahSlots → bookRawdah', 'Riyadh ul-Jannah permit'],
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-sand-800">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export async function SaudiConnectorConsole() {
  const kind = selectedConnectorKind();
  const provider = findProvider('nusuk-saudi')!;
  const status = providerStatus(provider, process.env);
  const hotels = await selectSaudiConnector().searchHotels(SAMPLE);
  const approved = hotels.filter((h) => h.nusukApproved).length;

  return (
    <ScreenFrame label="🛂 Saudi connector" tag={`${kind === 'saudi' ? 'certified' : 'mock'} · ${status}`}>
      <p className="max-w-[60ch] text-sand-500">
        The regulated pipe (Maqam/Nusuk). Product code depends only on the <span className="font-mono">SaudiConnector</span> interface — flip <span className="font-mono">CONNECTOR=saudi</span> to go live once partner access is granted.
      </p>

      <div className="mt-6 grid gap-4">
        <Card title="Auth gate">
          <p className="text-[13.5px] leading-relaxed text-sand-700">
            Certified adapter requires <span className="font-mono">MAQAM_CLIENT_ID</span>, <span className="font-mono">MAQAM_CLIENT_SECRET</span> and{' '}
            <span className="font-mono">NUSUK_AGENT_CODE</span> in the vault. Currently <span className="font-semibold">{status}</span> — the mock answers all calls until then.
          </p>
        </Card>

        <Card title="Domain mapping">
          <ul className="grid gap-2">
            {DOMAIN_MAP.map(([from, to]) => (
              <li key={from} className="flex flex-col gap-0.5 rounded-xl border border-sand-200 bg-sand-50 p-3 text-[13px] sm:flex-row sm:items-center sm:justify-between">
                <span className="font-mono text-sand-700">{from}</span>
                <span className="text-sand-500">{to}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="2025 Nusuk-approved-hotel rule">
          <p className="text-[13.5px] leading-relaxed text-sand-700">
            Only Nusuk-approved hotels may anchor a pilgrimage visa. Live sample: <span className="font-mono font-semibold text-green-800">{approved}/{hotels.length}</span> returned hotels are{' '}
            <span className="font-mono">nusukApproved</span>; the booking flow must reject an unapproved hotel before visa submission.
          </p>
        </Card>

        <Card title="Resilience & contract tests">
          <ul className="grid gap-1.5 text-[13.5px] text-sand-700">
            <li>• Timeouts + retries with backoff on the adapter; mock is deterministic.</li>
            <li>• Idempotent <span className="font-mono">hold → confirm</span> keyed by payment ref.</li>
            <li>• The shared <span className="font-mono">@auj/contracts</span> suite runs live against the active adapter ({kind === 'saudi' ? 'certified' : 'mock'}) below.</li>
          </ul>
          <div className="mt-3">
            <ContractRunner target="saudi" label="SaudiConnector" />
          </div>
        </Card>
      </div>
    </ScreenFrame>
  );
}
