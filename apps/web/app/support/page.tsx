import { getTranslations } from 'next-intl/server';
import type { Ticket, TicketStatus } from '@auj/support';
import { requireRole } from '../../src/auth/session';
import { getSupport } from '../../src/support/backend';
import { replyTicketAction } from '../../src/support/actions';
import { OpenTicketForm } from '../../src/support/OpenTicketForm';
import { SitePage } from '../../src/components/SitePage';

const STATUS_TONE: Record<TicketStatus, string> = {
  OPEN: 'bg-info-bg text-info-fg',
  PENDING: 'bg-warning-bg text-warning-fg',
  RESOLVED: 'bg-success-bg text-success-fg',
  CLOSED: 'bg-sand-100 text-sand-600',
};

// Support — any signed-in user. They see and reply to their own tickets only.
export default async function SupportPage() {
  const user = await requireRole(['PILGRIM', 'AGENT', 'SUB_AGENT', 'ADMIN'], '/support');
  const tickets = await (await getSupport()).listByUser(user.id);
  const t = await getTranslations('support');

  return (
    <SitePage user={user}>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-1 font-serif text-2xl font-semibold">{t('title')}</h1>
        <p className="mb-5 text-sm text-sand-500">{t('subtitle')}</p>

        <OpenTicketForm />

        <div className="mt-7 mb-2.5 text-[13px] font-bold">{t('yourTickets')}</div>
        {tickets.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sand-300 bg-white p-6 text-center text-sm text-sand-500">{t('none')}</p>
        ) : (
          <div className="grid gap-3">
            {tickets.map((tk) => (
              <TicketCard key={tk.id} ticket={tk} replyLabel={t('reply')} replyPlaceholder={t('replyPlaceholder')} closedNote={t('closedNote', { status: tk.status.toLowerCase() })} />
            ))}
          </div>
        )}
      </div>
    </SitePage>
  );
}

function TicketCard({ ticket, replyLabel, replyPlaceholder, closedNote }: { ticket: Ticket; replyLabel: string; replyPlaceholder: string; closedNote: string }) {
  const closed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[14.5px] font-semibold">{ticket.subject}</div>
          <div className="font-mono text-[11px] text-sand-500">{ticket.ref} · {ticket.category}{ticket.bookingRef ? ` · ${ticket.bookingRef}` : ''}</div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_TONE[ticket.status]}`}>{ticket.status}</span>
      </div>

      <div className="mt-3 grid gap-2">
        {ticket.messages.map((m, i) => (
          <div key={i} className={`rounded-xl px-3 py-2 text-[13.5px] ${m.author === 'STAFF' ? 'bg-green-100 text-sand-ink' : 'bg-sand-50 text-sand-700'}`}>
            <div className="mb-0.5 text-[11px] font-semibold text-sand-500">{m.author === 'STAFF' ? `${m.authorName} · AUJ` : m.authorName}</div>
            {m.body}
          </div>
        ))}
      </div>

      {closed ? (
        <p className="mt-3 text-[12px] text-sand-500">{closedNote}</p>
      ) : (
        <form action={replyTicketAction} className="mt-3 flex gap-2">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <input name="body" required placeholder={replyPlaceholder} className="flex-1 rounded-[10px] border-[1.5px] border-sand-300 px-3 py-2 text-[14px] focus:border-green-700 focus:outline-none" />
          <button type="submit" className="rounded-[10px] bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">{replyLabel}</button>
        </form>
      )}
    </div>
  );
}
