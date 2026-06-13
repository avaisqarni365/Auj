'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { openTicketAction, type TicketFormState } from './actions';

const inputCls =
  'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2.5 text-[14px] text-sand-ink focus:border-green-700 focus:outline-none';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
      {pending ? 'Sending…' : 'Open ticket'}
    </button>
  );
}

export function OpenTicketForm() {
  const [state, action] = useFormState(openTicketAction, {} as TicketFormState);
  return (
    <form action={action} className="rounded-2xl border border-sand-200 bg-white p-5">
      <div className="mb-3 text-sm font-bold">New request</div>
      <div className="grid gap-2.5">
        <div className="grid gap-2.5 sm:grid-cols-[1fr_auto]">
          <input name="subject" required placeholder="Subject" className={inputCls} />
          <select name="category" defaultValue="GENERAL" className={inputCls} aria-label="Category">
            <option value="GENERAL">General</option>
            <option value="BOOKING">Booking</option>
            <option value="VISA">Visa</option>
            <option value="PAYMENT">Payment</option>
          </select>
        </div>
        <input name="bookingRef" placeholder="Booking reference (optional)" className={inputCls} />
        <textarea name="body" required rows={3} placeholder="How can we help?" className={inputCls} />
        {state?.error ? <p className="text-[13px] font-medium text-danger-fg">{state.error}</p> : null}
        {state?.ok ? <p className="text-[13px] font-medium text-success-fg">Ticket created — we’ll reply by email and here.</p> : null}
        <div className="flex justify-end">
          <Submit />
        </div>
      </div>
    </form>
  );
}
