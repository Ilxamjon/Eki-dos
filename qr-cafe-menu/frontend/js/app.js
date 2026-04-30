const API_BASE_URL = 'http://localhost:3000/api'; // Change for production
let menuItems = [];

// Har bir item uchun nomiga mos lokal foto.
// Eslatma: ba'zi rasmlar yuklab olinmagan bo'lishi mumkin — bunday paytda categoryPhoto/SVG fallback ishlaydi.
const itemPhotoById = {
    // Rasmlar `frontend/assets/images/` ichiga qo'yiladi (items/ ichiga emas).
    1: 'assets/images/balyk-kuyrdak.jpg',
    2: 'assets/images/shashlik.jpg',
    3: 'assets/images/pigodi.jpg',
    4: 'assets/images/pirojki.jpg',
    5: 'assets/images/pisken-mayek.jpg',
    6: 'assets/images/somsa.jpg',
    7: 'assets/images/svejiy-salat.jpg',
    8: 'assets/images/markovcha.jpg',
    9: 'assets/images/opke-xe.jpg',
    10: 'assets/images/kolbasa-set.jpg',
    11: 'assets/images/akarachka-set.jpg',
    13: 'assets/images/semechka-katta.jpg',
    15: 'assets/images/pivo-razlivnoy.jpg',
    17: 'assets/images/pivo-sarbast-light.jpg',
    19: 'assets/images/cola-15l.jpg',
    20: 'assets/images/mineral-15l.jpg'
};

// "Haqiqiy rasm" uchun kategoriya bo'yicha foto (lokal).
// Bu fayllar `backend/scripts/generate-menu-images.js` orqali emas,
// Unsplash'dan yuklab qo'yilgan: `cat-*.jpg`.
const categoryPhoto = {
    Bluda: 'assets/images/cat-bluda.jpg',
    Zakuska: 'assets/images/cat-zakuska.jpg',
    Ichimliklar: 'assets/images/cat-ichimliklar.jpg',
    Extra: 'assets/images/cat-extra.jpg'
};

// Offline fallback (agar internet bo'lmasa).
const localSvgByCategory = {
    Bluda: 'assets/images/shashlik.svg',
    Zakuska: 'assets/images/markovcha.svg',
    Ichimliklar: 'assets/images/pivo-razlivnoy.svg',
    Extra: 'assets/images/kapchyonny-balyk.svg'
};

function normalizeImageUrl(item) {
    // Agar backend .svg qaytarsa yoki umuman rasm bo'lmasa, real foto qo'yamiz.
    const url = (item && item.image_url) ? String(item.image_url) : '';
    const cat = item && item.category;
    const id = item && item.id;

    if (id && itemPhotoById[id]) {
        // Itemga mos lokal foto mavjud bo'lsa, uni ishlatamiz.
        return itemPhotoById[id];
    }

    // Agar lokal SVG bo'lsa, shu nomdagi JPG'ga o'tkazamiz:
    // masalan: assets/images/shashlik.svg -> assets/images/shashlik.jpg
    // (JPG bo'lmasa, <img onerror> fallback ishlaydi.)
    if (url && url.replace(/^\/+/, '').startsWith('assets/images/') && url.toLowerCase().endsWith('.svg')) {
        return url.replace(/\.svg$/i, '.jpg');
    }

    if (cat && categoryPhoto[cat]) {
        if (!url || url.endsWith('.svg') || url.startsWith('assets/images/')) {
            return categoryPhoto[cat];
        }
    }

    return url || (cat ? (categoryPhoto[cat] || localSvgByCategory[cat] || '') : '');
}

document.addEventListener('DOMContentLoaded', () => {
    // 0. Auto-Login via QR url parameter (e.g., ?table=5)
    const urlParams = new URLSearchParams(window.location.search);
    const urlTable = urlParams.get('table');

    if (urlTable && parseInt(urlTable) >= 1 && parseInt(urlTable) <= 30) {
        localStorage.setItem('qr_table_number', parseInt(urlTable));
        // Only redirect if we are not already on the menu page to avoid infinite loops
        if (!window.location.pathname.includes('menu.html')) {
            window.location.href = 'menu.html';
            return;
        }
    }

    // 2. Menu Page Handling
    if (document.getElementById('menuGrid')) {
        loadMenu();
        setupCategoryFilters();
        setupCategoryScrollArrows();
    }
});

async function loadMenu() {
    try {
        const res = await fetch(`${API_BASE_URL}/menu`);
        const data = await res.json();

        if (data.success) {
            menuItems = data.data.map((item) => ({
                ...item,
                image_url: normalizeImageUrl(item)
            }));
            renderMenu('all');
        }
    } catch (err) {
        console.error('Fetch error:', err);
        // Fallback mock data if server is down (for demo purposes)
        menuItems = getMockMenu().map((item) => ({ ...item, image_url: normalizeImageUrl(item) }));
        renderMenu('all');
    } finally {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('menuGrid').style.display = 'grid';
    }
}

function renderMenu(categoryFilter) {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = '';

    const filteredItems = categoryFilter === 'all'
        ? menuItems
        : menuItems.filter(i => i.category === categoryFilter);

    if (filteredItems.length === 0) {
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">Ushbu bo'limda mahsulotlar yo'q.</p>`;
        return;
    }

    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-item';
        card.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}" class="item-img"
                 onerror="this.onerror=null; this.src='${categoryPhoto[item.category] || ''}'; if (!this.src || this.src.endsWith('/')) { this.src='${localSvgByCategory[item.category] || ''}'; } if (!this.src || this.src.endsWith('/')) { this.src='https://placehold.co/400x400/111111/FF7B00?font=montserrat&text=${encodeURIComponent(item.name)}'; }">
            <div class="item-details">
                <div>
                    <h3 class="item-title">${item.name}</h3>
                    <p class="item-desc">${item.description || ''}</p>
                </div>
                <div class="item-bottom">
                    <span class="item-price">${formatPrice(item.price)}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function setupCategoryFilters() {
    const btns = document.querySelectorAll('.category-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            btns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderMenu(e.target.dataset.category);
        });
    });
}

function setupCategoryScrollArrows() {
    const scroller = document.getElementById('categoriesContainer');
    if (!scroller) return;

    const leftBtn = document.querySelector('.cat-arrow-left');
    const rightBtn = document.querySelector('.cat-arrow-right');
    if (!leftBtn || !rightBtn) return;

    // Always start from the beginning.
    scroller.scrollLeft = 0;

    const updateDisabled = () => {
        const max = scroller.scrollWidth - scroller.clientWidth;
        leftBtn.disabled = scroller.scrollLeft <= 2;
        rightBtn.disabled = scroller.scrollLeft >= max - 2;
    };

    const scrollByStep = (dir) => {
        const step = Math.max(220, Math.floor(scroller.clientWidth * 0.6));
        scroller.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    leftBtn.addEventListener('click', () => scrollByStep(-1));
    rightBtn.addEventListener('click', () => scrollByStep(1));
    scroller.addEventListener('scroll', updateDisabled, { passive: true });
    window.addEventListener('resize', updateDisabled);

    updateDisabled();
}

// Utils
function formatPrice(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = 'toast show';
    if (type === 'error') toast.classList.add('error');

    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Mock Menu exactly as backend for local dev
function getMockMenu() {
    return [
        { id: 1, category: 'Bluda', name: 'Balyk Kuyrdak', description: 'Tandirda pishirilgan maxsus baliq va kartoshka', price: 45000, image_url: 'assets/images/balyk-kuyrdak.svg' },
        { id: 2, category: 'Bluda', name: 'Shashlik', description: 'Barra go\'shtdan tayyorlangan mazzali shashlik', price: 13000, image_url: 'assets/images/shashlik.svg' },
        { id: 3, category: 'Bluda', name: 'Pigodi', description: 'Bug\'da pishgan koreyscha manti', price: 8000, image_url: 'assets/images/pigodi.svg' },
        { id: 4, category: 'Bluda', name: 'Pirojki', description: 'Issiqqina va qarsildoq pirojkilar', price: 3000, image_url: 'assets/images/pirojki.svg' },
        { id: 5, category: 'Bluda', name: 'Pisken Mayek', description: 'Maxsus usulda pishirilgan tuxum', price: 2000, image_url: 'assets/images/pisken-mayek.svg' },
        { id: 6, category: 'Bluda', name: 'Somsa', description: 'Guzali tandir somsa', price: 7000, image_url: 'assets/images/somsa.svg' },

        { id: 7, category: 'Zakuska', name: 'Svejiy Salat', description: 'Yangi sabzavotlardan tayyorlangan salat', price: 10000, image_url: 'assets/images/svejiy-salat.svg' },
        { id: 8, category: 'Zakuska', name: 'Markovcha', description: 'Achchiqqina koreyscha sabzi salati', price: 5000, image_url: 'assets/images/markovcha.svg' },
        { id: 9, category: 'Zakuska', name: 'Opke Xe', description: 'Anʼanaviy koreyscha xe salati', price: 10000, image_url: 'assets/images/opke-xe.svg' },
        { id: 10, category: 'Zakuska', name: 'Kolbasa Set', description: 'Turli xil dudlangan kolbasalar to\'plami', price: 15000, image_url: 'assets/images/kolbasa-set.svg' },
        { id: 11, category: 'Zakuska', name: 'Akarachka Set', description: 'Qovurilgan tovuq oyoqchalari', price: 20000, image_url: 'assets/images/akarachka-set.svg' },
        { id: 12, category: 'Zakuska', name: 'Turak', description: 'Qovurilgan xamirli gazaklar', price: 5000, image_url: 'assets/images/turak.svg' },
        { id: 13, category: 'Zakuska', name: 'Semechka Katta', description: 'Katta paket semechka', price: 15000, image_url: 'assets/images/semechka-katta.svg' },
        { id: 14, category: 'Zakuska', name: 'Semechka Mini', description: 'Kichik paket semechka', price: 5000, image_url: 'assets/images/semechka-mini.svg' },

        { id: 15, category: 'Ichimliklar', name: 'Pivo Razlivnoy', description: 'Muzdek razlivnoy pivo', price: 10000, image_url: 'assets/images/pivo-razlivnoy.svg' },
        { id: 16, category: 'Ichimliklar', name: 'Pivo Kibray', description: 'Kibray pivosi (shisha)', price: 20000, image_url: 'assets/images/pivo-kibray.svg' },
        { id: 17, category: 'Ichimliklar', name: 'Pivo Sarbast Light', description: 'Sarbast Light (shisha)', price: 25000, image_url: 'assets/images/pivo-sarbast-light.svg' },
        { id: 18, category: 'Ichimliklar', name: 'Cola 1L', description: 'Coca-Cola 1 litr', price: 15000, image_url: 'assets/images/cola-1l.svg' },
        { id: 19, category: 'Ichimliklar', name: 'Cola 1.5L', description: 'Coca-Cola 1.5 litr', price: 18000, image_url: 'assets/images/cola-15l.svg' },
        { id: 20, category: 'Ichimliklar', name: 'Mineral 1.5L', description: 'Gazli mineral suv 1.5L', price: 8000, image_url: 'assets/images/mineral-15l.svg' },
        { id: 21, category: 'Ichimliklar', name: 'Mineral 1L', description: 'Gazsiz mineral suv 1L', price: 6000, image_url: 'assets/images/mineral-1l.svg' },

        { id: 22, category: 'Extra', name: 'Kapchyonny Balyk', description: 'Dudlangan maxsus baliq', price: 30000, image_url: 'assets/images/kapchyonny-balyk.svg' },
        { id: 23, category: 'Extra', name: 'Zakrytii Vobla', description: 'Tozalangan quritilgan vobla', price: 30000, image_url: 'assets/images/zakrytii-vobla.svg' }
    ];
}
