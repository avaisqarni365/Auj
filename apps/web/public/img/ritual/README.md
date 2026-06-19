# Umrah Guide images — drop your files here

Put images for the step-by-step **Umrah Guide** wizard (`/guide`) in this folder. They are served at
`/img/ritual/<file>`. A manifest (`apps/web/src/ritual/ritual-images.ts`) maps each wizard screen to its
file. **If a file is missing, the screen falls back to the built-in Makkah/Madinah scene art**, so the
site never shows a broken image — add images whenever you have them.

## Format
- **.webp** preferred (or .jpg). Screen heroes ~**1600×900** landscape; Ziyarat cards ~**800×600**.
- Keep each file **under ~300 KB** (compress; these load on mobile data in Makkah/Madinah).
- **Licensing:** only use images you own or that are licensed for **commercial use**. This is a public,
  commercial site — do not drop images copied from the web. Your own photography is ideal.

## Filenames (use these exact names)

### One per wizard screen → put directly in `img/ritual/`
| Screen | File |
|---|---|
| Welcome | `welcome.webp` |
| Travel information | `travel.webp` |
| Miqat | `miqat.webp` |
| Ihram preparation | `ihram.webp` |
| Niyyah (intention) | `niyyah.webp` |
| Talbiyah | `talbiyah.webp` |
| Arrival at the Kaaba | `kaaba-arrival.webp` |
| Tawaf | `tawaf.webp` |
| Two Rak'ahs (Maqam Ibrahim) | `maqam-ibrahim.webp` |
| Zamzam | `zamzam.webp` |
| Safa | `safa.webp` |
| Sa'i | `sai.webp` |
| Hair-cutting | `halq.webp` |
| Umrah complete | `complete.webp` |
| Ziyarat guide cover | `ziyarat.webp` |

### Ziyarat places → `img/ritual/ziyarat/makkah/` and `img/ritual/ziyarat/madinah/`
**Makkah:** `kaaba.webp`, `maqam-ibrahim.webp`, `hateem.webp`, `multazam.webp`, `safa.webp`,
`marwah.webp`, `jabal-al-noor.webp`, `jabal-thawr.webp`, `mina.webp`, `muzdalifah.webp`, `arafat.webp`

**Madinah:** `masjid-nabawi.webp`, `rawdah.webp`, `green-dome.webp`, `jannat-al-baqi.webp`,
`masjid-quba.webp`, `masjid-qiblatain.webp`, `mount-uhud.webp`, `martyrs-of-uhud.webp`

## Optional dua audio
Put audio at `apps/web/public/audio/ritual/<key>.mp3` (e.g. `talbiyah.mp3`, `niyyah.mp3`). The little
audio player on a dua appears only when its file exists.
