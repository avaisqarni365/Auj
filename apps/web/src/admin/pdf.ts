// Minimal, dependency-free single-page PDF generator for plain-text artifacts (certificates).
// Produces a valid PDF 1.4 with a correct xref table. ASCII/Latin-1 text only.
function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function textPdf(lines: string[]): Uint8Array {
  const safe = lines.length ? lines : [''];
  const content =
    `BT /F1 11 Tf 50 790 Td 16 TL ` +
    safe.map((l, i) => `${i === 0 ? '' : 'T* '}(${esc(l)}) Tj`).join(' ') +
    ` ET`;
  const objs = [
    `<</Type/Catalog/Pages 2 0 R>>`,
    `<</Type/Pages/Kids[3 0 R]/Count 1>>`,
    `<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>`,
    `<</Length ${Buffer.byteLength(content, 'latin1')}>>\nstream\n${content}\nendstream`,
    `<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>`,
  ];
  let pdf = `%PDF-1.4\n`;
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets[i] = Buffer.byteLength(pdf, 'latin1');
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Uint8Array(Buffer.from(pdf, 'latin1'));
}
