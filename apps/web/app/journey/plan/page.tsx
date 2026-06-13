import type { ReactNode } from 'react';
import { Logo } from '@auj/ui';
import { BOOKING, ITINERARY } from '../../../src/journey-content';
import { PrintButton } from './PrintButton';

// Print-optimised travel plan + Umrah guide (the handoff's "still to build" doc).
// Linked from the Admin pilgrim profile and the Traveller portal.

const RITUALS: Array<{ step: string; body: string }> = [
  { step: 'Ihram', body: 'Enter the state of ihram at the miqat — two unstitched white cloths (men); modest dress (women). Make your intention (niyyah) and recite the talbiyah.' },
  { step: 'Tawaf', body: 'Seven circuits of the Ka’bah, counter-clockwise, beginning at the Black Stone. Keep wudu throughout.' },
  { step: "Sa'i", body: 'Walk seven times between Safa and Marwah, commemorating Hajar’s search for water.' },
  { step: 'Tahallul', body: 'Trim or shave the hair to exit ihram. Umrah is complete.' },
];

const CHECKLIST = ['Passport (≥6 months validity)', 'Visa photo (white background, 45×35mm)', 'e-Visa / agent-channel approval', 'Vaccination certificate', 'Travel insurance', 'BRN & digital pass (this document)'];

const TIPS = [
  'Keep your BRN and digital pass accessible at check-in and ground services.',
  'Stay hydrated; carry a refillable bottle. Zamzam is available at the Haramain.',
  'Dress modestly and comfortably; expect a lot of walking.',
  'Respect prayer times — plan rituals and transfers around them.',
];

export default function TravelPlanPage() {
  return (
    <div className="min-h-screen bg-[#ECE7DD] print:bg-white">
      {/* toolbar — hidden when printing */}
      <div className="sticky top-0 z-10 border-b border-sand-200 bg-white px-[clamp(16px,4vw,28px)] py-3 print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <a href="/journey" className="text-[13px] font-semibold text-accent-600">← Back to my journey</a>
          <PrintButton />
        </div>
      </div>

      {/* the document */}
      <article className="mx-auto my-6 max-w-3xl bg-white p-[clamp(24px,5vw,56px)] text-sand-ink shadow-lg print:my-0 print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-center justify-between border-b border-sand-200 pb-5">
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <div>
              <div className="font-serif text-xl font-semibold tracking-[0.04em]">AUJ</div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-sand-500">Travel plan &amp; Umrah guide</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[13px] text-accent-600">{BOOKING.brn}</div>
            <div className="text-[12px] text-sand-500">{BOOKING.dates}</div>
          </div>
        </header>

        <section className="mt-6">
          <h1 className="font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.02em]">{BOOKING.pkg}</h1>
          <p className="mt-1 text-sand-700">{BOOKING.route} · {BOOKING.pax} pilgrims</p>
        </section>

        <Section title="The Umrah rituals">
          <ol className="grid gap-3">
            {RITUALS.map((r, i) => (
              <li key={r.step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-800 font-mono text-sm font-semibold text-white">{i + 1}</span>
                <div>
                  <div className="font-semibold">{r.step}</div>
                  <p className="text-[14px] leading-relaxed text-sand-700">{r.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Day-by-day itinerary">
          <div className="grid gap-3">
            {ITINERARY.map((d) => (
              <div key={d.day} className="flex gap-3 border-b border-sand-100 pb-3 last:border-0">
                <div className="w-16 shrink-0">
                  <div className="font-mono text-[12px] font-semibold text-green-800">{d.day}</div>
                  <div className="text-[11px] text-sand-500">{d.date}</div>
                </div>
                <div>
                  <div className="font-semibold">{d.icon} {d.title}</div>
                  <p className="text-[14px] leading-relaxed text-sand-700">{d.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="grid gap-6 sm:grid-cols-2">
          <Section title="Document checklist">
            <ul className="grid gap-2">
              {CHECKLIST.map((c) => (
                <li key={c} className="flex items-center gap-2.5 text-[14px]">
                  <span className="flex h-5 w-5 items-center justify-center rounded border border-sand-300 text-[11px] text-sand-300 print:border-black">☐</span>
                  {c}
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Before you travel">
            <ul className="grid gap-2 text-[14px] leading-relaxed text-sand-700">
              {TIPS.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-success">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <footer className="mt-8 border-t border-sand-200 pt-4 text-center text-[12px] text-sand-500">
          AUJ · Licensed EU tour operator · Charged in EUR · 24/7 support · my.auj.travel
        </footer>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-7 break-inside-avoid">
      <h2 className="mb-3 font-serif text-lg font-semibold text-sand-ink">{title}</h2>
      {children}
    </section>
  );
}
