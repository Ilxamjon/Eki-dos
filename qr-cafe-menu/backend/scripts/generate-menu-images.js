const fs = require('fs');
const path = require('path');

// Offline placeholder "rasm" generator.
// QR menyuda img hech qanday tashqi manbaga bog'lanmasligi uchun SVG-larni local saqlaymiz.

// backend/scripts -> backend -> qr-cafe-menu -> frontend
const outDir = path.join(__dirname, '../../frontend/assets/images');

const items = [
  { id: 1, category: 'Bluda', name: 'Balyk Kuyrdak', price: 45000, file: 'balyk-kuyrdak.svg' },
  { id: 2, category: 'Bluda', name: 'Shashlik', price: 13000, file: 'shashlik.svg' },
  { id: 3, category: 'Bluda', name: 'Pigodi', price: 8000, file: 'pigodi.svg' },
  { id: 4, category: 'Bluda', name: 'Pirojki', price: 3000, file: 'pirojki.svg' },
  { id: 5, category: 'Bluda', name: 'Pisken Mayek', price: 2000, file: 'pisken-mayek.svg' },
  { id: 6, category: 'Bluda', name: 'Somsa', price: 7000, file: 'somsa.svg' },

  { id: 7, category: 'Zakuska', name: 'Svejiy Salat', price: 10000, file: 'svejiy-salat.svg' },
  { id: 8, category: 'Zakuska', name: 'Markovcha', price: 5000, file: 'markovcha.svg' },
  { id: 9, category: 'Zakuska', name: 'Opke Xe', price: 10000, file: 'opke-xe.svg' },
  { id: 10, category: 'Zakuska', name: 'Kolbasa Set', price: 15000, file: 'kolbasa-set.svg' },
  { id: 11, category: 'Zakuska', name: 'Akarachka Set', price: 20000, file: 'akarachka-set.svg' },
  { id: 12, category: 'Zakuska', name: 'Turak', price: 5000, file: 'turak.svg' },
  { id: 13, category: 'Zakuska', name: 'Semechka Katta', price: 15000, file: 'semechka-katta.svg' },
  { id: 14, category: 'Zakuska', name: 'Semechka Mini', price: 5000, file: 'semechka-mini.svg' },

  { id: 15, category: 'Ichimliklar', name: 'Pivo Razlivnoy', price: 10000, file: 'pivo-razlivnoy.svg' },
  { id: 16, category: 'Ichimliklar', name: 'Pivo Kibray', price: 20000, file: 'pivo-kibray.svg' },
  { id: 17, category: 'Ichimliklar', name: 'Pivo Sarbast Light', price: 25000, file: 'pivo-sarbast-light.svg' },
  { id: 18, category: 'Ichimliklar', name: 'Cola 1L', price: 15000, file: 'cola-1l.svg' },
  { id: 19, category: 'Ichimliklar', name: 'Cola 1.5L', price: 18000, file: 'cola-15l.svg' },
  { id: 20, category: 'Ichimliklar', name: 'Mineral 1.5L', price: 8000, file: 'mineral-15l.svg' },
  { id: 21, category: 'Ichimliklar', name: 'Mineral 1L', price: 6000, file: 'mineral-1l.svg' },

  { id: 22, category: 'Extra', name: 'Kapchyonny Balyk', price: 30000, file: 'kapchyonny-balyk.svg' },
  { id: 23, category: 'Extra', name: 'Zakrytii Vobla', price: 30000, file: 'zakrytii-vobla.svg' }
];

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapName(name) {
  // Oddiy wrap: uzun nomni 2 qatorga ajratamiz
  const parts = String(name).split(' ');
  if (parts.length <= 2) return [name];

  return [parts.slice(0, Math.ceil(parts.length / 2)).join(' '), parts.slice(Math.ceil(parts.length / 2)).join(' ')];
}

function renderSvg({ category, name, price }) {
  const priceText = `${Number(price).toLocaleString('uz-UZ')} so'm`;
  const cat = escapeXml(category);

  const lines = wrapName(name).map(escapeXml);
  const tspanY1 = 505;
  const tspanY2 = 570;

  const tspan1 = `<tspan x="400" y="${tspanY1}">${lines[0]}</tspan>`;
  const tspan2 = lines[1] ? `<tspan x="400" y="${tspanY2}">${lines[1]}</tspan>` : '';

  const colors = {
    Bluda: { a: '#FF7B00', b: '#C25B00' },
    Zakuska: { a: '#FF9E4A', b: '#FF7B00' },
    Ichimliklar: { a: '#3DD6FF', b: '#1B82FF' },
    Extra: { a: '#D4AF37', b: '#FF7B00' }
  };
  const c = colors[category] || { a: '#FF7B00', b: '#C25B00' };
  const initial = escapeXml(String(name).trim().charAt(0).toUpperCase() || '?');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050505"/>
      <stop offset="100%" stop-color="#101010"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.a}"/>
      <stop offset="100%" stop-color="${c.b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${c.a}" stop-opacity="0.35"/>
      <stop offset="70%" stop-color="${c.b}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect x="0" y="0" width="800" height="800" fill="url(#bg)"/>
  <rect x="0" y="0" width="800" height="800" fill="url(#glow)"/>

  <rect x="34" y="34" width="732" height="732" rx="34" ry="34" fill="#0A0A0A" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <rect x="52" y="52" width="696" height="696" rx="28" ry="28" fill="rgba(255,255,255,0.02)" stroke="url(#accent)" stroke-width="3"/>

  <circle cx="400" cy="270" r="118" fill="url(#accent)" opacity="0.95"/>
  <circle cx="400" cy="270" r="104" fill="#0A0A0A" opacity="0.35"/>
  <text x="400" y="288" fill="#FFFFFF" font-size="88" font-weight="800" font-family="Montserrat, Arial, sans-serif" text-anchor="middle">${initial}</text>

  <text x="400" y="150" fill="rgba(255,255,255,0.92)" font-size="26" font-weight="700" font-family="Montserrat, Arial, sans-serif" text-anchor="middle" letter-spacing="2">${cat}</text>

  <text x="400" y="535" fill="#FFFFFF" font-size="52" font-weight="800" font-family="Montserrat, Arial, sans-serif" text-anchor="middle" dominant-baseline="middle">
    ${tspan1}
    ${tspan2}
  </text>

  <text x="400" y="675" fill="url(#accent)" font-size="40" font-weight="800" font-family="Montserrat, Arial, sans-serif" text-anchor="middle">${escapeXml(priceText)}</text>

  <text x="400" y="730" fill="rgba(255,255,255,0.45)" font-size="18" font-family="Montserrat, Arial, sans-serif" text-anchor="middle">IKKI DO'ST • QR MENU</text>
</svg>
`;
}

function generateAll() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let ok = 0;
  for (const item of items) {
    const outPath = path.join(outDir, item.file);
    const svg = renderSvg(item);
    fs.writeFileSync(outPath, svg, 'utf8');
    ok++;
  }

  console.log(`✅ ${ok} ta menyu rasm (SVG) generate qilindi: ${outDir}`);
}

generateAll();

