// TD3 passport MRZ parser (pure + tested). The OCR provider turns the image into MRZ text;
// this turns MRZ text into editable passport fields. Lenient: tolerates spaces/newlines.
import type { PassportFields } from './dashboard-types';

const clean = (s: string): string => s.replace(/[^A-Z0-9<]/gi, '').toUpperCase();
const name = (s: string): string => s.replace(/</g, ' ').trim().replace(/\s+/g, ' ');

function fmtDate(yymmdd: string, isExpiry: boolean): string {
  if (!/^\d{6}$/.test(yymmdd)) return '';
  const yy = Number(yymmdd.slice(0, 2));
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  let year = 2000 + yy;
  if (!isExpiry && year > new Date().getFullYear()) year = 1900 + yy; // a future DOB → last century
  return `${year}-${mm}-${dd}`;
}

/** Parse a TD3 MRZ (two 44-char lines) into passport fields. Returns null if it isn't TD3-shaped. */
export function parseMrz(raw: string): Partial<PassportFields> | null {
  const lines = raw
    .split(/[\r\n]+/)
    .map(clean)
    .filter((l) => l.length >= 28);
  // Also accept a single 88-char blob.
  let l1: string | undefined;
  let l2: string | undefined;
  if (lines.length >= 2) {
    [l1, l2] = [lines[0], lines[1]];
  } else if (lines.length === 1 && lines[0] && lines[0].length >= 80) {
    l1 = lines[0].slice(0, 44);
    l2 = lines[0].slice(44);
  }
  if (!l1 || !l2 || l1[0] !== 'P') return null;

  const namePart = l1.slice(5);
  const [surnameRaw = '', givenRaw = ''] = namePart.split('<<');
  const passportNumber = (l2.slice(0, 9) || '').replace(/<+$/g, '').replace(/</g, '');
  const nationality = l2.slice(10, 13).replace(/</g, '');
  const dob = fmtDate(l2.slice(13, 19), false);
  const sexChar = l2[20];
  const expiry = fmtDate(l2.slice(21, 27), true);

  return {
    passportNumber,
    surname: name(surnameRaw),
    givenNames: name(givenRaw),
    nationality,
    dob,
    expiry,
    sex: sexChar === 'M' || sexChar === 'F' ? sexChar : '',
  };
}
