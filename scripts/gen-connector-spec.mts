/**
 * Generates the language-agnostic connector contract from the SINGLE source of truth
 * (the Zod schemas + interfaces in @auj/contracts). Emits:
 *   docs/connector-contract/openapi.json  — OpenAPI 3.1, partners build against this
 *   docs/connector-contract/README.md     — one-page human summary
 *
 * Run: pnpm gen:spec   (builds @auj/contracts first, then runs this with tsx)
 *
 * Because it's generated from the same schemas the code uses, the spec cannot drift.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodTypeAny } from 'zod';
import {
  BookingResultSchema,
  CONTRACTS_VERSION,
  CancellationSchema,
  CateringOfferSchema,
  FlightOfferSchema,
  GroundOfferSchema,
  HoldRefSchema,
  HotelOfferSchema,
  MoneySchema,
  PilgrimSchema,
  RawdahPermitSchema,
  RawdahSlotSchema,
  SearchCriteriaSchema,
  TransportOfferSchema,
  VisaApplicationSchema,
  VisaStatusSchema,
} from '@auj/contracts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'docs', 'connector-contract');

// --- Reusable domain components (each self-contained, OpenAPI 3 shape). -------------
const NAMED: Record<string, ZodTypeAny> = {
  Money: MoneySchema,
  Pilgrim: PilgrimSchema,
  SearchCriteria: SearchCriteriaSchema,
  HotelOffer: HotelOfferSchema,
  TransportOffer: TransportOfferSchema,
  GroundOffer: GroundOfferSchema,
  CateringOffer: CateringOfferSchema,
  FlightOffer: FlightOfferSchema,
  HoldRef: HoldRefSchema,
  BookingResult: BookingResultSchema,
  VisaApplication: VisaApplicationSchema,
  VisaStatus: VisaStatusSchema,
  RawdahSlot: RawdahSlotSchema,
  RawdahPermit: RawdahPermitSchema,
  Cancellation: CancellationSchema,
};

const components: Record<string, unknown> = {};
for (const [name, schema] of Object.entries(NAMED)) {
  components[name] = zodToJsonSchema(schema, { target: 'openApi3', $refStrategy: 'none' });
}

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const arr = (name: string) => ({ type: 'array', items: ref(name) });
const str = { type: 'string' } as const;
const obj = (props: Record<string, unknown>, required: string[]) => ({ type: 'object', properties: props, required });

interface Method {
  op: string;
  summary: string;
  request: unknown;
  response: unknown;
  reqLabel: string;
  resLabel: string;
}

const saudi: Method[] = [
  { op: 'searchHotels', summary: 'Search Nusuk-approved hotels', request: ref('SearchCriteria'), response: arr('HotelOffer'), reqLabel: 'SearchCriteria', resLabel: 'HotelOffer[]' },
  { op: 'searchTransport', summary: 'Search intercity / ground transport', request: ref('SearchCriteria'), response: arr('TransportOffer'), reqLabel: 'SearchCriteria', resLabel: 'TransportOffer[]' },
  { op: 'searchGroundServices', summary: 'Search ground services', request: ref('SearchCriteria'), response: arr('GroundOffer'), reqLabel: 'SearchCriteria', resLabel: 'GroundOffer[]' },
  { op: 'searchZiyarah', summary: 'Curated ziyarah (heritage) bundles', request: ref('SearchCriteria'), response: arr('GroundOffer'), reqLabel: 'SearchCriteria', resLabel: 'GroundOffer[]' },
  { op: 'searchCatering', summary: 'Meal / catering plans', request: ref('SearchCriteria'), response: arr('CateringOffer'), reqLabel: 'SearchCriteria', resLabel: 'CateringOffer[]' },
  { op: 'hold', summary: 'Place a hold on offers for a group', request: obj({ offerIds: { type: 'array', items: str }, pilgrims: arr('Pilgrim') }, ['offerIds', 'pilgrims']), response: ref('HoldRef'), reqLabel: '{ offerIds: string[], pilgrims: Pilgrim[] }', resLabel: 'HoldRef' },
  { op: 'confirm', summary: 'Confirm a hold against payment; returns BRNs', request: obj({ holdId: str, payment: obj({ ref: str }, ['ref']) }, ['holdId', 'payment']), response: ref('BookingResult'), reqLabel: '{ holdId, payment:{ ref } }', resLabel: 'BookingResult (BRNs)' },
  { op: 'createVisaApplication', summary: 'Open a visa application for a booking', request: obj({ bookingRef: str, pilgrims: arr('Pilgrim') }, ['bookingRef', 'pilgrims']), response: ref('VisaApplication'), reqLabel: '{ bookingRef, pilgrims: Pilgrim[] }', resLabel: 'VisaApplication' },
  { op: 'getVisaStatus', summary: 'Poll a visa application status', request: obj({ visaRef: str }, ['visaRef']), response: obj({ status: ref('VisaStatus') }, ['status']), reqLabel: '{ visaRef }', resLabel: '{ status: VisaStatus }' },
  { op: 'searchRawdahSlots', summary: 'Rawdah (Riyadh ul-Jannah) permit slots for a date', request: obj({ date: str }, ['date']), response: arr('RawdahSlot'), reqLabel: '{ date }', resLabel: 'RawdahSlot[]' },
  { op: 'bookRawdah', summary: 'Book a Rawdah permit for pilgrims', request: obj({ slotId: str, pilgrims: arr('Pilgrim') }, ['slotId', 'pilgrims']), response: ref('RawdahPermit'), reqLabel: '{ slotId, pilgrims: Pilgrim[] }', resLabel: 'RawdahPermit' },
  { op: 'cancel', summary: 'Cancel a booking and report any refund', request: obj({ bookingRef: str }, ['bookingRef']), response: ref('Cancellation'), reqLabel: '{ bookingRef }', resLabel: 'Cancellation' },
];

const travel: Method[] = [
  { op: 'searchHotels', summary: 'Search general-travel hotels (bedbank)', request: { allOf: [ref('SearchCriteria'), obj({ country: str }, ['country'])] }, response: arr('HotelOffer'), reqLabel: 'SearchCriteria & { country }', resLabel: 'HotelOffer[]' },
  { op: 'searchFlights', summary: 'Search flights (GDS)', request: obj({ from: str, to: str, date: str, pax: { type: 'integer' } }, ['from', 'to', 'date', 'pax']), response: arr('FlightOffer'), reqLabel: '{ from, to, date, pax }', resLabel: 'FlightOffer[]' },
  { op: 'book', summary: 'Book offers for travellers; returns BRNs', request: obj({ offerIds: { type: 'array', items: str }, travellers: arr('Pilgrim') }, ['offerIds', 'travellers']), response: ref('BookingResult'), reqLabel: '{ offerIds: string[], travellers: Pilgrim[] }', resLabel: 'BookingResult' },
  { op: 'cancel', summary: 'Cancel a booking and report any refund', request: obj({ bookingRef: str }, ['bookingRef']), response: ref('Cancellation'), reqLabel: '{ bookingRef }', resLabel: 'Cancellation' },
];

function pathsFor(prefix: string, methods: Method[]): Record<string, unknown> {
  const paths: Record<string, unknown> = {};
  for (const m of methods) {
    paths[`/${prefix}/${m.op}`] = {
      post: {
        operationId: `${prefix}_${m.op}`,
        summary: m.summary,
        tags: [prefix === 'saudi' ? 'SaudiConnector' : 'TravelSupplier'],
        requestBody: { required: true, content: { 'application/json': { schema: m.request } } },
        responses: { '200': { description: m.resLabel, content: { 'application/json': { schema: m.response } } } },
      },
    };
  }
  return paths;
}

const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'AUJ Connector Contract',
    version: CONTRACTS_VERSION,
    description:
      'The single seam between AUJ product modules and external supply. `SaudiConnector` is the regulated ' +
      'pilgrimage pipe (Maqam GDS / Nusuk Masar, gated); `TravelSupplier` is general-travel supply (bedbank/GDS, ' +
      'open APIs). Operations are transport-agnostic method contracts — a partner/ERP may expose them over HTTP, ' +
      'gRPC, or in-process. Generated from the Zod source of truth; do not hand-edit.',
  },
  tags: [
    { name: 'SaudiConnector', description: 'Regulated Saudi pipe (gated). Default impl = mock; certified impl swapped via CONNECTOR=saudi.' },
    { name: 'TravelSupplier', description: 'General-travel supply (no Saudi dependency). SUPPLIER=live swaps in real bedbank/GDS.' },
  ],
  paths: { ...pathsFor('saudi', saudi), ...pathsFor('travel', travel) },
  components: { schemas: components },
};

// --- Markdown summary --------------------------------------------------------------
function table(methods: Method[]): string {
  const rows = methods.map((m) => `| \`${m.op}\` | ${m.summary} | \`${m.reqLabel}\` | \`${m.resLabel}\` |`);
  return ['| Method | Purpose | Request | Response |', '|---|---|---|---|', ...rows].join('\n');
}

const md = `# AUJ Connector Contract — v${CONTRACTS_VERSION}

> Generated from \`@auj/contracts\` (Zod schemas). **Do not hand-edit** — run \`pnpm gen:spec\`.
> Machine-readable: [\`openapi.json\`](./openapi.json).

This is the **single seam** between AUJ's product modules and external supply. Everything *above* the
seam (web, B2B portal, CRM, payments) is built and owned by AUJ; everything *below* it is swappable.
Product code depends only on these two interfaces — never a concrete connector — so a partner/ERP can
be plugged in to go live, then replaced by AUJ's own certification with **zero change above the seam**.

- **\`SaudiConnector\`** — the regulated pilgrimage pipe (Maqam GDS / Nusuk Masar). **Gated.** Default
  implementation is the in-memory mock; the certified implementation is selected with \`CONNECTOR=saudi\`.
- **\`TravelSupplier\`** — general-travel supply (bedbank + flight GDS). **No Saudi dependency** — this leg
  ships first. Real bedbank/GDS selected with \`SUPPLIER=live\`.

Operations are transport-agnostic: a provider may expose them over HTTP/gRPC/in-process. Money is
\`{ amount: integer minor units, currency }\`; BRNs (Booking Reference Numbers) are returned verbatim by
\`confirm\` / \`book\` and are required for visa processing.

## SaudiConnector (gated pilgrimage pipe)

${table(saudi)}

## TravelSupplier (open general-travel APIs)

${table(travel)}

## Swapping implementations

| Env | Values | Effect |
|---|---|---|
| \`CONNECTOR\` | \`mock\` (default) · \`saudi\` | Selects the \`SaudiConnector\`: in-memory mock vs the certified Maqam/Nusuk adapter. |
| \`SUPPLIER\` | \`mock\` (default) · \`live\` | Selects the \`TravelSupplier\`: mock vs real bedbank/GDS. |

Both are read in \`apps/web/src/connectors.ts\`. Any new implementation must pass the shared
**contract-tests** in \`@auj/contracts\` before it can be wired in.

## Data shapes

Full JSON Schema for every type (\`Pilgrim\`, \`HotelOffer\`, \`BookingResult\`, \`VisaApplication\`,
\`RawdahPermit\`, …) is in [\`openapi.json\`](./openapi.json) under \`components.schemas\`.
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'openapi.json'), `${JSON.stringify(openapi, null, 2)}\n`, 'utf8');
writeFileSync(join(outDir, 'README.md'), md, 'utf8');

// eslint-disable-next-line no-console
console.log(`Wrote ${Object.keys(openapi.paths).length} operations + ${Object.keys(components).length} schemas to docs/connector-contract/`);
