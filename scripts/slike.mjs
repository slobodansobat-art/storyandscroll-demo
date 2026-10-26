// Pravi manje verzije svake slike iz public/img/izvorne (tu ih ubacuje i CMS)
// i upisuje spisak u src/data/slike-meta.json. Pokreće se pre svakog builda.
import { readdir, mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const KOREN = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const IZVOR = path.join(KOREN, 'public/img/izvorne');
const CILJ = path.join(KOREN, 'public/img/v');
const META = path.join(KOREN, 'src/data/slike-meta.json');
const SIRINE = [480, 800, 1200, 1600];
const PODRZANE = /\.(jpe?g|png|webp|avif|tiff?|gif)$/i;

const bezbedno = (ime) =>
  ime.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'dj').replace(/Đ/g, 'Dj')
    .replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'slika';

await mkdir(CILJ, { recursive: true });
const fajlovi = existsSync(IZVOR) ? (await readdir(IZVOR)).filter((f) => PODRZANE.test(f)) : [];
const meta = {};
const zauzeto = new Set();

for (const f of fajlovi.sort()) {
  const ulaz = path.join(IZVOR, f);
  try {
    // Kratki otisak sadržaja u imenu: nova slika pod istim imenom dobija novu adresu (keš ne smeta).
    const otisak = createHash('sha1').update(await readFile(ulaz)).digest('hex').slice(0, 8);
    let ime = `${bezbedno(f)}-${otisak}`;
    while (zauzeto.has(ime)) ime += '-2';
    zauzeto.add(ime);
    const slika = sharp(ulaz, { failOn: 'none' }).rotate();
    const m = await slika.metadata();
    const okrenuta = (m.orientation ?? 1) >= 5;
    const w = okrenuta ? m.height : m.width;
    const h = okrenuta ? m.width : m.height;
    const sirine = SIRINE.filter((s) => s < w);
    if (!sirine.length || w <= 1600) sirine.push(Math.min(w, 1600));
    const verzije = [];
    for (const s of [...new Set(sirine)]) {
      const izlaz = path.join(CILJ, `${ime}-${s}.webp`);
      if (!existsSync(izlaz)) {
        await sharp(ulaz, { failOn: 'none' }).rotate().resize({ width: s, withoutEnlargement: true }).webp({ quality: 78 }).toFile(izlaz);
      }
      verzije.push([s, `/img/v/${ime}-${s}.webp`]);
    }
    meta[`/img/izvorne/${f}`] = { w, h, v: verzije };
  } catch (e) {
    console.warn(`[slike] Preskačem ${f}: ${e.message}`);
  }
}

await writeFile(META, JSON.stringify(meta, null, 2) + '\n');
console.log(`[slike] Obrađeno ${Object.keys(meta).length} slika.`);
