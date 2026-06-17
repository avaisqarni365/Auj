'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Logo } from '@auj/ui';
import { redeemVoucherAction, type RedeemState } from './actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full rounded-xl bg-green-800 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
      {pending ? 'Checking…' : 'Redeem voucher'}
    </button>
  );
}

export function RedeemForm() {
  const [state, action] = useFormState(redeemVoucherAction, {} as RedeemState);
  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2.5 text-center">
          <Logo size={44} />
          <h1 className="font-serif text-2xl font-semibold">Redeem a gift</h1>
          <p className="text-sm text-sand-500">Enter the voucher code from your gift to claim your journey.</p>
        </div>

        {state?.ok ? (
          <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
            <div className="text-[40px]">🎉</div>
            <div className="mt-1 font-serif text-xl font-semibold">Voucher redeemed</div>
            <p className="mt-2 text-sm text-sand-700">
              {state.recipientName ? `Welcome, ${state.recipientName}. ` : ''}Your gift is confirmed — reference{' '}
              <span className="font-mono font-semibold text-green-800">{state.ref}</span>.
            </p>
            <Link href="/journey" className="mt-4 inline-block rounded-xl bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
              View the journey →
            </Link>
          </div>
        ) : (
          <form action={action} className="rounded-2xl border border-sand-200 bg-white p-6">
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-sand-500">Voucher code</label>
            <input
              name="code"
              required
              autoComplete="off"
              placeholder="AUJ-GIFT-XXXXXXXX"
              className="mb-3 w-full rounded-[10px] border-[1.5px] border-sand-300 px-3 py-2.5 text-center font-mono text-[15px] tracking-[0.06em] uppercase focus:border-green-700 focus:outline-none"
            />
            {state?.error ? <p className="mb-3 rounded-lg bg-danger-bg px-3 py-2 text-[13px] font-medium text-danger-fg">{state.error}</p> : null}
            <Submit />
          </form>
        )}

        <p className="mt-4 text-center text-sm text-sand-500">
          <Link href="/" className="font-semibold text-accent-600">← Back to AUJ</Link>
        </p>
      </div>
    </div>
  );
}
