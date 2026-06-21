'use client';

import { useState, useTransition } from 'react';
import { listProvidersAction, testConnectionAction, type ProviderRow } from './connector-actions';
import type { ProviderStatus } from './providers';
import { ScreenFrame } from '../components/ScreenFrame';

const STATUS: Record<ProviderStatus, { label: string; cls: string }> = {
  connected: { label: 'Connected', cls: 'bg-success-bg text-success-fg' },
  sandbox: { label: 'Sandbox', cls: 'bg-accent-100 text-accent-700' },
  gated: { label: 'Gated', cls: 'bg-warning-bg text-warning-fg' },
  'not-configured': { label: 'Not configured', cls: 'bg-sand-100 text-sand-500' },
};

function ago(iso: string | null): string {
  if (!iso) return '—';
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000) return 'just now';
  if (d < 3_600_000) return `${Math.floor(d / 60_000)} min ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)} h ago`;
  return `${Math.floor(d / 86_400_000)} d ago`;
}

export function ProvidersConsole({ initial }: { initial: ProviderRow[] }) {
  const [rows, setRows] = useState<ProviderRow[]>(initial);
  const [sel, setSel] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [, start] = useTransition();

  const refresh = (): void => void listProvidersAction().then(setRows);
  const test = (slug: string): void => {
    setTesting(slug);
    start(async () => {
      await testConnectionAction(slug);
      refresh();
      setTesting(null);
    });
  };

  const selected = rows.find((r) => r.slug === sel);

  return (
    <ScreenFrame label="🔌 Service providers" maxWidth="max-w-5xl">
      <p className="max-w-[60ch] text-sand-500">
        Every integration behind the connector seam. Status is derived from environment bindings —
        secrets live in the vault, never here. Adding a provider to the registry needs no product code.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-sand-200 bg-white shadow-sm">
        <table className="w-full min-w-[680px] text-left text-[13.5px]">
          <thead className="border-b border-sand-200 text-[11px] uppercase tracking-wide text-sand-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Provider</th>
              <th className="px-4 py-3 font-semibold">Adapter</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last check</th>
              <th className="px-4 py-3 font-semibold">Latency</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {rows.map((r) => (
              <tr key={r.slug} className="cursor-pointer transition-colors hover:bg-sand-50" onClick={() => setSel(r.slug)}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-sand-800">{r.name}</div>
                  <div className="text-[12px] text-sand-500">{r.kind}</div>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-sand-600">{r.adapter}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-md px-2 py-1 text-[11px] font-semibold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
                </td>
                <td className="px-4 py-3 text-sand-500">
                  {r.lastOk === null ? '—' : <span className={r.lastOk ? 'text-success-fg' : 'text-danger-fg'}>{r.lastOk ? '✓ ' : '✕ '}{ago(r.lastChecked)}</span>}
                </td>
                <td className="px-4 py-3 font-mono text-sand-600">{r.latencyMs === null ? '—' : `${r.latencyMs} ms`}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      test(r.slug);
                    }}
                    disabled={testing === r.slug}
                    className="rounded-lg border border-sand-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-green-800 transition-transform duration-fast active:scale-[0.98] disabled:opacity-50"
                  >
                    {testing === r.slug ? 'Testing…' : 'Test'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* detail */}
      {selected ? (
        <div className="mt-5 animate-rise rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-semibold text-sand-800">{selected.name}</h2>
              <p className="mt-0.5 font-mono text-[12px] text-sand-500">
                {selected.adapter} · binding <span className="text-sand-700">{selected.binding}</span>
              </p>
            </div>
            <button type="button" onClick={() => setSel(null)} className="text-sand-400 hover:text-sand-700" aria-label="Close">
              ✕
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-sand-500">Capabilities</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.capabilities.map((c) => (
                  <span key={c} className="rounded-md bg-sand-100 px-2 py-1 text-[12px] font-medium text-sand-700">{c}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-sand-500">Environment bindings (key names only)</div>
              <ul className="mt-2 grid gap-1">
                {selected.boundKeys.map((k) => (
                  <li key={k} className="flex items-center gap-2 font-mono text-[12px] text-success-fg">
                    <span>✓</span> {k}
                  </li>
                ))}
                {selected.missingKeys.map((k) => (
                  <li key={k} className="flex items-center gap-2 font-mono text-[12px] text-sand-400">
                    <span>○</span> {k}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-sand-100 pt-4">
            <button
              type="button"
              onClick={() => test(selected.slug)}
              disabled={testing === selected.slug}
              className="rounded-lg bg-green-700 px-4 py-2 text-[13px] font-semibold text-white transition-transform duration-fast active:scale-[0.98] disabled:opacity-50"
            >
              {testing === selected.slug ? 'Testing…' : 'Test connection'}
            </button>
            <span className="text-[12px] text-sand-500" title="Credentials are rotated in the vault, never here.">
              🔐 Rotate credentials in the vault (key names shown above)
            </span>
          </div>
        </div>
      ) : null}
    </ScreenFrame>
  );
}
