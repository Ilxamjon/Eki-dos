const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Unsplash qidiruv sahifasidan (API key siz) birinchi mos rasmni topib,
// uni lokalga saqlaydi. Maqsad: har bir ovqat/ichimlik nomiga mos foto.
//
// Ishga tushirish:
//   node backend/scripts/fetch-item-images.js
//
// Eslatma: Bu eng sodda "scrape" usul. Agar Unsplash HTML o'zgarsa, regexni yangilash kerak bo'lishi mumkin.

const outDir = path.join(__dirname, '../../frontend/assets/images/items');

const items = [
  { id: 1, name: 'Balyk Kuyrdak', slug: 'balyk-kuyrdak', query: 'fish potato skillet dish' },
  { id: 2, name: 'Shashlik', slug: 'shashlik', query: 'shashlik kebab skewers grilled meat' },
  { id: 3, name: 'Pigodi', slug: 'pigodi', query: 'korean steamed bun' },
  { id: 4, name: 'Pirojki', slug: 'pirojki', query: 'pirozhki pastry' },
  { id: 5, name: 'Pisken Mayek', slug: 'pisken-mayek', query: 'fried egg breakfast' },
  { id: 6, name: 'Somsa', slug: 'somsa', query: 'samsa pastry' },

  { id: 7, name: 'Svejiy Salat', slug: 'svejiy-salat', query: 'fresh salad bowl' },
  { id: 8, name: 'Markovcha', slug: 'markovcha', query: 'korean carrot salad' },
  { id: 9, name: 'Opke Xe', slug: 'opke-xe', query: 'korean salad spicy' },
  { id: 10, name: 'Kolbasa Set', slug: 'kolbasa-set', query: 'sausage platter' },
  { id: 11, name: 'Akarachka Set', slug: 'akarachka-set', query: 'fried chicken legs' },
  { id: 12, name: 'Turak', slug: 'turak', query: 'fried dough snack' },
  { id: 13, name: 'Semechka Katta', slug: 'semechka-katta', query: 'sunflower seeds' },
  { id: 14, name: 'Semechka Mini', slug: 'semechka-mini', query: 'sunflower seeds snack' },

  { id: 15, name: 'Pivo Razlivnoy', slug: 'pivo-razlivnoy', query: 'beer glass dark bar' },
  { id: 16, name: 'Pivo Kibray', slug: 'pivo-kibray', query: 'beer bottle glass' },
  { id: 17, name: 'Pivo Sarbast Light', slug: 'pivo-sarbast-light', query: 'light beer glass' },
  { id: 18, name: 'Cola 1L', slug: 'cola-1l', query: 'coca cola bottle' },
  { id: 19, name: 'Cola 1.5L', slug: 'cola-15l', query: 'coca cola bottle' },
  { id: 20, name: 'Mineral 1.5L', slug: 'mineral-15l', query: 'mineral water bottle' },
  { id: 21, name: 'Mineral 1L', slug: 'mineral-1l', query: 'water bottle' },

  { id: 22, name: 'Kapchyonny Balyk', slug: 'kapchyonny-balyk', query: 'smoked fish plate' },
  { id: 23, name: 'Zakrytii Vobla', slug: 'zakrytii-vobla', query: 'dried fish snack' }
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pickFirstImageUrlFromHtml(html) {
  // Unsplash listing pages contain many image URLs.
  // We pick the first `images.unsplash.com/photo-...` occurrence.
  const m = html.match(/https:\/\/images\.unsplash\.com\/photo-[^"\\?]+/);
  return m ? m[0] : null;
}

async function downloadToFile(url, filePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status} ${res.statusText}`);
  const buf = await res.buffer();
  fs.writeFileSync(filePath, buf);
}

async function main() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let ok = 0;
  let fail = 0;

  for (const item of items) {
    const outPath = path.join(outDir, `${item.slug}.jpg`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 20_000) {
      console.log(`skip (exists): ${item.slug}.jpg`);
      ok++;
      continue;
    }

    const q = encodeURIComponent(item.query);
    const searchUrl = `https://unsplash.com/s/photos/${q}`;
    console.log(`search: ${item.name} -> ${searchUrl}`);

    try {
      const page = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });
      if (!page.ok) throw new Error(`search failed: ${page.status} ${page.statusText}`);
      const html = await page.text();

      const imgBase = pickFirstImageUrlFromHtml(html);
      if (!imgBase) throw new Error('no image url found in search html');

      // 800x800 -> frontend tarafida 150x150 "cover" uchun yetarli.
      const img = `${imgBase}?auto=format&fit=crop&w=800&h=800&q=80`;
      console.log(`download: ${imgBase}`);
      await downloadToFile(img, outPath);

      const size = fs.statSync(outPath).size;
      console.log(`saved: ${item.slug}.jpg (${size} bytes)`);
      ok++;
    } catch (e) {
      console.warn(`failed: ${item.slug} -> ${e.message}`);
      fail++;
    }

    // Rate limitdan saqlanish uchun kichik pauza
    await sleep(900);
  }

  console.log(`done. ok=${ok} fail=${fail} dir=${outDir}`);
  if (fail > 0) process.exitCode = 1;
}

main();

