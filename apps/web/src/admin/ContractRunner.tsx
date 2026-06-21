'use client';

import { useState, useTransition } from 'react';
import { runContractTestsAction } from './connector-actions';
import type { CheckResult } from './contract-runner';

export function ContractRunner({ target, label }: { target: 'saudi' | 'supplier'; label: string }) {
  const [results, setResults] = useState<CheckResult[]>();
  const [pending, start] = useTransition();
  const run = (): void => start(async () => setResults(await runContractTestsAction(target)));

  const passed = results?.filter((r) => r.ok).length ?? 0;
  const total = results?.length ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="rounded-lg bg-green-700 px-4 py-2 text-[13px] font-semibold text-white transition-transform duration-fast active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? 'Running…' : `Run ${label} contract tests`}
        </button>
        {results ? (
          <span className={`rounded-md px-2 py-1 text-[12px] font-semibold ${passed === total ? 'bg-success-bg text-success-fg' : 'bg-danger-bg text-danger-fg'}`}>
            {passed}/{total} passed
          </span>
        ) : null}
      </div>

      {results ? (
        <ul className="mt-3 grid gap-1.5">
          {results.map((r) => (
            <li key={r.name} className="flex items-start justify-between gap-3 rounded-lg border border-sand-200 bg-white px-3 py-2 text-[12.5px]">
              <span className="flex items-start gap-2">
                <span className={r.ok ? 'text-success-fg' : 'text-danger-fg'}>{r.ok ? '✓' : '✕'}</span>
                <span className="text-sand-700">{r.name}</span>
              </span>
              <span className={`flex-none font-mono text-[11px] ${r.ok ? 'text-sand-400' : 'text-danger-fg'}`}>{r.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
