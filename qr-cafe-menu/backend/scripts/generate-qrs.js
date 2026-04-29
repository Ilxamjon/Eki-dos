const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://site.com/?table='; // Replace with the real domain later
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
