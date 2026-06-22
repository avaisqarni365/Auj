'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

// Airline-style searchable select: a button showing the choice, opening a popover with a search
// box + a filtered, optionally grouped list. Fast keyboard nav (↑/↓/Enter/Esc), click-outside close.
export interface ComboOption {
  value: string;
  label: string;
  hint?: string; // e.g. IATA code, shown on the right
  group?: string; // section header (contiguous in the options array)
  search?: string; // extra keywords to match on
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Search…',
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ComboOption[];
  placeholder?: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => `${o.label} ${o.hint ?? ''} ${o.group ?? ''} ${o.search ?? ''}`.toLowerCase().includes(q));
  }, [query, options]);

  useEffect(() => {
    if (open) {
      setActive(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    setQuery('');
    return undefined;
  }, [open]);

  useEffect(() => {
    function onDoc(e: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const choose = (v: string): void => {
    onChange(v);
    setOpen(false);
  };

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[active];
      if (opt) choose(opt.value);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // keep the active row in view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border-[1.5px] border-sand-300 bg-white px-3.5 py-3 text-left text-[15px] text-sand-ink transition-shadow focus:border-accent-600 focus:outline-none focus:ring-[3px] focus:ring-accent-600/15"
      >
        <span className={selected ? '' : 'text-sand-400'}>{selected ? selected.label : placeholder}</span>
        <span className="flex items-center gap-2">
          {selected?.hint ? <span className="font-mono text-[11px] font-semibold text-sand-500">{selected.hint}</span> : null}
          <span aria-hidden className="text-sand-500">▾</span>
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-lg">
          <div className="border-b border-sand-100 p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKey}
              placeholder={placeholder}
              className="w-full rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-[14px] text-sand-ink focus:border-accent-600 focus:outline-none"
              role="combobox"
              aria-expanded
              aria-controls="combo-list"
              aria-autocomplete="list"
            />
          </div>
          <div ref={listRef} id="combo-list" role="listbox" aria-label={ariaLabel} className="max-h-[280px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-[13px] text-sand-500">No matches</div>
            ) : (
              filtered.map((o, i) => {
                const showGroup = o.group && o.group !== filtered[i - 1]?.group;
                return (
                  <div key={o.value}>
                    {showGroup ? (
                      <div className="sticky top-0 bg-white px-3 pb-1 pt-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-sand-400">{o.group}</div>
                    ) : null}
                    <button
                      type="button"
                      role="option"
                      aria-selected={o.value === value}
                      data-idx={i}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(o.value)}
                      className={`flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[14px] transition-colors ${
                        i === active ? 'bg-green-50' : ''
                      } ${o.value === value ? 'font-semibold text-green-800' : 'text-sand-ink'}`}
                    >
                      <span>{o.label}</span>
                      {o.hint ? <span className="font-mono text-[11px] font-semibold text-sand-500">{o.hint}</span> : null}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
