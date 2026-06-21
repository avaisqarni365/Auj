// Passport MRZ OCR seam. When OCR_ENDPOINT + OCR_API_KEY are set, the image is POSTed to the
// provider (generic contract: returns JSON { mrz?: string, text?: string }); otherwise OCR is
// disabled and the dashboard falls back to manual entry. The returned text is parsed by parse-mrz.
// Swap the provider by pointing OCR_ENDPOINT at your vendor and adapting the response shape here.

export function ocrConfigured(): boolean {
  return !!(process.env.OCR_ENDPOINT && process.env.OCR_API_KEY);
}

/** Returns recognised MRZ/text for the image, or undefined when OCR is off or the call fails. */
export async function readPassportText(bytes: Uint8Array, contentType: string): Promise<string | undefined> {
  const endpoint = process.env.OCR_ENDPOINT;
  const key = process.env.OCR_API_KEY;
  if (!endpoint || !key) return undefined;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: new Blob([bytes as unknown as BlobPart], { type: contentType || 'application/octet-stream' }),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { mrz?: string; text?: string };
    return data.mrz ?? data.text ?? undefined;
  } catch {
    return undefined;
  }
}
