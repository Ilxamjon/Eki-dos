const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// QR skan qilinganda ochiladigan menu URL.
// LOCAL misol: Live Server `frontend/` ichida bo'lsa, u odatda http://localhost:5500/menu.html bo'ladi.
const baseOrigin = (process.env.PUBLIC_URL || process.env.BASE_URL || 'http://localhost:5500').replace(/\/$/, '');
const menuPath = process.env.QR_MENU_PATH || 'menu.html';
const baseUrl = `${baseOrigin}/${menuPath}?table=`;
const outDir = path.join(__dirname, '../../../frontend/assets/qrcodes');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

async function generate() {
    for (let i = 1; i <= 30; i++) {
        const url = `${baseUrl}${i}`;
        const filePath = path.join(outDir, `table-${i}.png`);

        try {
            await QRCode.toFile(filePath, url, {
                color: {
                    dark: '#D4AF37',  // Gold QR
                    light: '#0A0A0A'  // Dark background
                },
                width: 600,
                margin: 2
            });
            console.log(`Generated QR for Table ${i}`);
        } catch (err) {
            console.error(`Error generating QR for Table ${i}`, err);
        }
    }
    console.log('Barcha 30 ta QR kod frontend/assets/qrcodes papkasiga muvaffaqiyatli saqlandi!');
}

generate();
