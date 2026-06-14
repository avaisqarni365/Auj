'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { openTicketAction, type TicketFormState } from './actions';

const inputCls =
  'w-full rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3 py-2.5 text-[14px] text-sand-ink focus:border-green-700 focus:outline-none';

function Submit() {
  const { pending } = useFormStatus();
  const t = useTranslations('support');
  return (
    <button type="submit" disabled={pending} className="rounded-xl bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
      {pending ? t('sending') : t('openTicket')}
    </button>
  );
}

export function OpenTicketForm() {
  const [state, action] = useFormState(openTicketAction, {} as TicketFormState);
  const t = useTranslations('support');
  return (
    <form action={action} className="rounded-2xl border border-sand-200 bg-white p-5">
      <div className="mb-3 text-sm font-bold">{t('newRequest')}</div>
      <div className="grid gap-2.5">
        <div className="grid gap-2.5 sm:grid-cols-[1fr_auto]">
          <input name="subject" required placeholder={t('subject')} className={inputCls} />
          <select name="category" defaultValue="GENERAL" className={inputCls} aria-label={t('category')}>
            <option value="GENERAL">{t('catGeneral')}</option>
            <option value="BOOKING">{t('catBooking')}</option>
            <option value="VISA">{t('catVisa')}</option>
            <option value="PAYMENT">{t('catPayment')}</option>
          </select>
        </div>
        <input name="bookingRef" placeholder={t('bookingRef')} className={inputCls} />
        <textarea name="body" required rows={3} placeholder={t('body')} className={inputCls} />
        {state?.error ? <p className="text-[13px] font-medium text-danger-fg">{state.error}</p> : null}
        {state?.ok ? <p className="text-[13px] font-medium text-success-fg">{t('created')}</p> : null}
        <div className="flex justify-end">
          <Submit />
        </div>
      </div>
    </form>
  );
}
