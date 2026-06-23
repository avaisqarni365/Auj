'use client';

import { Button } from '@auj/ui';
import { formatMoney } from '../money';
import type { Statement } from '../domain';

export interface StatementsProps {
  statement: Statement;
  onExportCSV: () => void;
}

/** Format an ISO date as e.g. "03 Jun 2026". */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** The covered period, derived from the real ledger rows (earliest → latest entry). */
function periodLabel(statement: Statement): string {
  const dates = statement.rows.map((r) => r.date).filter(Boolean).sort();
  if (dates.length === 0) return 'No activity yet';
  const first = fmtDate(dates[0]!);
  const last = fmtDate(dates[dates.length - 1]!);
  return first === last ? first : `${first} – ${last}`;
}

function downloadBlob(content: BlobPart, type: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const xmlEsc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function Statements({ statement, onExportCSV }: StatementsProps) {
  const m = (amount: number) => formatMoney({ amount, currency: statement.currency });
  const kpis = [
    { label: 'Opening', value: m(statement.opening), color: 'text-sand-ink' },
    { label: 'Debits', value: m(statement.debits), color: 'text-danger' },
    { label: 'Credits', value: m(statement.credits), color: 'text-success' },
    { label: 'Closing', value: m(statement.closing), color: 'text-green-800' },
  ];

  // XLSX export — SpreadsheetML 2003 (.xls), which Excel/Sheets open natively, no dependency.
  const exportXlsx = (): void => {
    const cell = (v: string | number, type: 'String' | 'Number') => `<Cell><Data ss:Type="${type}">${typeof v === 'string' ? xmlEsc(v) : v}</Data></Cell>`;
    const row = (cells: string) => `<Row>${cells}</Row>`;
    const head = row(['Date', 'Reference', 'Description', 'Debit', 'Credit', 'Balance'].map((h) => cell(h, 'String')).join(''));
    const body = statement.rows
      .map((r) => row(cell(fmtDate(r.date), 'String') + cell(r.ref, 'String') + cell(r.description || '—', 'String') + cell(r.debit / 100, 'Number') + cell(r.credit / 100, 'Number') + cell(r.balance / 100, 'Number')))
      .join('');
    const foot = row(cell('Closing balance', 'String') + cell('', 'String') + cell('', 'String') + cell(statement.debits / 100, 'Number') + cell(statement.credits / 100, 'Number') + cell(statement.closing / 100, 'Number'));
    const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Statement"><Table>${head}${body}${foot}</Table></Worksheet></Workbook>`;
    downloadBlob(xml, 'application/vnd.ms-excel', 'auj-statement.xls');
  };

  // PDF export — render a clean printable document in a new window; the browser's print dialog
  // saves it as PDF (no PDF library needed, fully client-side).
  const printPdf = (): void => {
    const w = window.open('', '_blank', 'width=820,height=1000');
    if (!w) return;
    const tr = statement.rows
      .map((r) => `<tr><td>${xmlEsc(fmtDate(r.date))}</td><td>${xmlEsc(r.ref)}</td><td>${xmlEsc(r.description || '—')}</td><td class="r">${r.debit ? m(r.debit) : ''}</td><td class="r">${r.credit ? m(r.credit) : ''}</td><td class="r">${m(r.balance)}</td></tr>`)
      .join('');
    w.document.write(`<!doctype html><html><head><title>AUJ statement</title><meta charset="utf-8"><style>
      body{font:13px/1.5 'Segoe UI',system-ui,sans-serif;color:#2A2620;padding:28px;}
      h1{font-size:18px;margin:0 0 2px;} .sub{color:#7A7263;margin:0 0 18px;font-size:12px;}
      table{width:100%;border-collapse:collapse;} th,td{padding:7px 9px;border-bottom:1px solid #E6DDCE;text-align:left;}
      th{background:#F5F1E8;font-size:11px;text-transform:uppercase;letter-spacing:.04em;} .r{text-align:right;font-variant-numeric:tabular-nums;}
      tfoot td{font-weight:700;border-top:2px solid #C9BCA6;}
      @media print{button{display:none;}}</style></head><body>
      <h1>${xmlEsc(statement.account)}</h1><p class="sub">Statement · ${xmlEsc(periodLabel(statement))} · ${statement.currency}</p>
      <table><thead><tr><th>Date</th><th>Reference</th><th>Description</th><th class="r">Debit</th><th class="r">Credit</th><th class="r">Balance</th></tr></thead>
      <tbody>${tr}</tbody>
      <tfoot><tr><td colspan="5">Closing balance</td><td class="r">${m(statement.closing)}</td></tr></tfoot></table>
      <button onclick="window.print()" style="margin-top:18px;padding:8px 16px;">Print / Save as PDF</button>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-[10px] border-[1.5px] border-sand-300 bg-white px-3.5 py-2 text-[13px] font-medium">📅 {periodLabel(statement)}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onExportCSV}>
            Export CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={exportXlsx}>
            XLSX
          </Button>
          <Button size="sm" onClick={printPdf}>Statement PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="text-[12.5px] text-sand-500">{k.label}</div>
            <div className={`mt-1.5 font-mono text-[22px] font-semibold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-sand-50 text-left text-sand-500">
              <th className="px-5 py-3 font-semibold">Reference</th>
              <th className="px-3 py-3 font-semibold">Description</th>
              <th className="px-3 py-3 text-right font-semibold">Debit</th>
              <th className="px-3 py-3 text-right font-semibold">Credit</th>
              <th className="px-5 py-3 text-right font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {statement.rows.map((r, i) => (
              <tr key={i} className="border-t border-sand-100">
                <td className="px-5 py-3 font-mono text-accent-600">{r.ref}</td>
                <td className="px-3 py-3 font-medium">{r.description || '—'}</td>
                <td className="px-3 py-3 text-right font-mono text-danger">{r.debit ? m(r.debit) : ''}</td>
                <td className="px-3 py-3 text-right font-mono text-success">{r.credit ? m(r.credit) : ''}</td>
                <td className="px-5 py-3 text-right font-mono">{m(r.balance)}</td>
              </tr>
            ))}
            <tr className="border-t border-sand-200 bg-sand-50 font-semibold">
              <td className="px-5 py-3" colSpan={4}>
                Closing balance
              </td>
              <td className="px-5 py-3 text-right font-mono text-green-800">{m(statement.closing)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
