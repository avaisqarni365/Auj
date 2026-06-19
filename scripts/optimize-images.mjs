// One-off image optimizer (run: `node scripts/optimize-images.mjs`). Converts the uploaded PNGs to
// web-optimized .webp and derives distinct Makkah/Madinah crops from the combined photo. Sources are
// kept; the app references the .webp outputs. Re-run after adding/replacing source images.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scenes = path.join(root, 'apps/web/public/img/scenes');
const brand = path.join(root, 'apps/web/public/img/brand');

const log = (f, b) => console.log(`  ${f}  (${Math.round(b / 1024)} KB)`);

async function webp(input, output, width, quality = 80, extract) {
  let img = sharp(input);
  if (extract) img = img.extract(extract);
  const info = await img.resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(output);
  log(path.basename(output), info.size);
}

const combined = path.join(scenes, 'makkah-madinah.png');

console.log('Photos:');
// Combined wide photo (hero/CTA backdrops) + per-city crops (left = Makkah, right = Madinah).
await webp(combined, path.join(scenes, 'makkah-madinah.webp'), 1600, 80);
await webp(combined, path.join(scenes, 'makkah.webp'), 1000, 80, { left: 0, top: 0, width: 768, height: 1024 });
await webp(combined, path.join(scenes, 'madinah.webp'), 1000, 80, { left: 768, top: 0, width: 768, height: 1024 });

console.log('Brand logo:');
await webp(path.join(brand, 'auj-logo.png'), path.join(brand, 'auj-logo.webp'), 256, 88);

console.log('Umrah step infographics:');
const steps = [
  '1_Umrah', '2_Umrah', '3_Umrah', '4_umrah', '5_Umrah', 'Umrah_6', 'Umrah_7', 'Umrah_8',
  'Umrah_9', 'Umrah_10', '11_Umrah', '12_Umrah', '13_umrah', '14_Umrah', '15_Umrah', '0_complete',
];
for (const name of steps) {
  await webp(path.join(scenes, `${name}.png`), path.join(scenes, `${name}.webp`), 1500, 82);
}

console.log('Done.');
