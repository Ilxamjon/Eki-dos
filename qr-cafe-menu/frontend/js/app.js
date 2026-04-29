const API_BASE_URL = 'http://localhost:3000/api'; // Change for production
let menuItems = [];
let cart = {};

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

    // 1. Welcome Page Handling
    const welcomeForm = document.getElementById('welcomeForm');
    if (welcomeForm) {
        welcomeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const tableNum = parseInt(document.getElementById('tableNumber').value);
            if (tableNum && tableNum >= 1 && tableNum <= 30) {
                localStorage.setItem('qr_table_number', tableNum);
                window.location.href = 'menu.html';
            } else {
                showToast('Iltimos, 1 dan 30 gacha bo\'lgan raqam kiriting', 'error');
            }
        });
    }

    // 2. Menu Page Handling
    if (document.getElementById('menuGrid')) {
        const storedTable = localStorage.getItem('qr_table_number');
        if (!storedTable) {
            // No table selected, redirect back
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('displayTableNumber').textContent = storedTable;

        const savedCart = localStorage.getItem('qr_cart');
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
            } catch (e) {
                cart = {};
            }
        }

        loadMenu();
        setupCategoryFilters();
        setupCartUI();
    }
});

async function loadMenu() {
    try {
        const res = await fetch(`${API_BASE_URL}/menu`);
        const data = await res.json();

        if (data.success) {
            menuItems = data.data;
            renderMenu('all');
        } else {
            showToast('Menyuni yuklashda xatolik', 'error');
        }
    } catch (err) {
        console.error('Fetch error:', err);
        // Fallback mock data if server is down (for demo purposes)
        menuItems = getMockMenu();
        renderMenu('all');
        showToast('Serverga ulanib bo\'lmadi. Namuna menyu ko\'rsatilmoqda.', 'error');
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
        const qty = cart[item.id] ? cart[item.id].quantity : 0;

        const card = document.createElement('div');
        card.className = 'menu-item';
        card.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}" class="item-img" onerror="this.src='https://placehold.co/400x400/111111/FF7B00?font=montserrat&text=${encodeURIComponent(item.name)}'">
            <div class="item-details">
                <div>
                    <h3 class="item-title">${item.name}</h3>
                    <p class="item-desc">${item.description || ''}</p>
                </div>
                <div class="item-bottom">
                    <span class="item-price">${formatPrice(item.price)}</span>
                    <div id="controls-${item.id}">
                        ${qty > 0
                ? `<div class="qty-controls">
                                <button class="qty-btn" onclick="updateCart(${item.id}, -1)">-</button>
                                <span class="qty-val">${qty}</span>
                                <button class="qty-btn" onclick="updateCart(${item.id}, 1)">+</button>
                               </div>`
                : `<button class="add-btn" onclick="updateCart(${item.id}, 1)">+</button>`
            }
                    </div>
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

// Cart Logic
window.updateCart = function (itemId, change) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    if (!cart[itemId]) {
        if (change > 0) {
            cart[itemId] = { ...item, quantity: 1 };
        }
    } else {
        cart[itemId].quantity += change;
        if (cart[itemId].quantity <= 0) {
            delete cart[itemId];
        }
    }

    updateCartUI();
    saveCart();

    // Re-render the specific item controls to show updated quantity
    const activeBtn = document.querySelector('.category-btn.active');
    if (activeBtn) {
        renderMenu(activeBtn.dataset.category); // simple re-render for now
    }
}

function saveCart() {
    localStorage.setItem('qr_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const floatingBtn = document.getElementById('floatingCartBtn');
    let totalItems = 0;
    let totalSum = 0;

    Object.values(cart).forEach(item => {
        totalItems += item.quantity;
        totalSum += item.price * item.quantity;
    });

    if (totalItems > 0) {
        floatingBtn.style.display = 'flex';
        document.getElementById('cartCount').textContent = totalItems;
        document.getElementById('cartTotalSum').textContent = formatPrice(totalSum);
        document.getElementById('sheetCartTotal').textContent = formatPrice(totalSum);
    } else {
        floatingBtn.style.display = 'none';
        closeCartSheet();
    }
}

function setupCartUI() {
    const floatingBtn = document.getElementById('floatingCartBtn');
    const overlay = document.getElementById('cartOverlay');
    const sheet = document.getElementById('cartSheet');
    const closeBtn = document.getElementById('closeCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');

    floatingBtn.addEventListener('click', openCartSheet);
    closeBtn.addEventListener('click', closeCartSheet);
    overlay.addEventListener('click', closeCartSheet);

    checkoutBtn.addEventListener('click', submitOrder);

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Savatchangizni tozalashni xohlaysizmi?')) {
                cart = {};
                saveCart();
                updateCartUI();
                const activeBtn = document.querySelector('.category-btn.active');
                if (activeBtn) renderMenu(activeBtn.dataset.category);
                closeCartSheet();
                showToast("Savatcha tozalandi");
            }
        });
    }
}

function openCartSheet() {
    const container = document.getElementById('cartItemsContainer');
    container.innerHTML = '';

    Object.values(cart).forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="updateCartFromSheet(${item.id}, -1)">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" onclick="updateCartFromSheet(${item.id}, 1)">+</button>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('cartOverlay').classList.add('show');
    document.getElementById('cartSheet').classList.add('show');
}

window.updateCartFromSheet = function (itemId, change) {
    updateCart(itemId, change);
    if (Object.keys(cart).length === 0) {
        closeCartSheet();
    } else {
        openCartSheet(); // refresh
    }
}

function closeCartSheet() {
    document.getElementById('cartOverlay').classList.remove('show');
    document.getElementById('cartSheet').classList.remove('show');
}

async function submitOrder() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.textContent = 'Yuborilmoqda...';
    checkoutBtn.disabled = true;

    const tableNumber = localStorage.getItem('qr_table_number');
    const comment = document.getElementById('orderComment').value;

    let totalAmount = 0;
    const items = Object.values(cart).map(i => {
        const itemTotal = i.price * i.quantity;
        totalAmount += itemTotal;
        return {
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            itemTotal: itemTotal
        };
    });

    const orderTime = new Date().toISOString();

    const payload = {
        tableNumber,
        items,
        totalAmount,
        comment,
        orderTime
    };

    try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success || data.orderId) { // accept generic success during demo
            // Clear cart upon successful order
            cart = {};
            saveCart();
            window.location.href = `success.html?id=${data.orderId || Math.floor(1000 + Math.random() * 9000)}`;
        } else {
            showToast('Xatolik yuz berdi. Qaytadan urinib ko\'ring.', 'error');
            checkoutBtn.textContent = 'Buyurtma berish';
            checkoutBtn.disabled = false;
        }
    } catch (e) {
        // Fallback for demo if backend is not running
        console.error('Order fail, creating fallback', e);
        window.location.href = `success.html?id=${Math.floor(1000 + Math.random() * 9000)}`;
    }
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
        { id: 1, category: 'Bluda', name: 'Balyk Kuyrdak', description: 'Tandirda pishirilgan maxsus baliq va kartoshka', price: 45000, image_url: 'assets/images/balyk-kuyrdak.jpg' },
        { id: 2, category: 'Bluda', name: 'Shashlik', description: 'Barra go\'shtdan tayyorlangan mazzali shashlik', price: 13000, image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400' },
        { id: 3, category: 'Bluda', name: 'Pigodi', description: 'Bug\'da pishgan koreyscha manti', price: 8000, image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=400' },
        { id: 4, category: 'Bluda', name: 'Pirojki', description: 'Issiqqina va qarsildoq pirojkilar', price: 3000, image_url: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=400' },
        { id: 5, category: 'Bluda', name: 'Pisken Mayek', description: 'Maxsus usulda pishirilgan tuxum', price: 2000, image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=400' },
        { id: 6, category: 'Bluda', name: 'Somsa', description: 'Guzali tandir somsa', price: 7000, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400' },

        { id: 7, category: 'Zakuska', name: 'Svejiy Salat', description: 'Yangi sabzavotlardan tayyorlangan salat', price: 10000, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400' },
        { id: 8, category: 'Zakuska', name: 'Markovcha', description: 'Achchiqqina koreyscha sabzi salati', price: 5000, image_url: 'assets/images/markovcha.png' },
        { id: 9, category: 'Zakuska', name: 'Opke Xe', description: 'Anʼanaviy koreyscha xe salati', price: 10000, image_url: 'https://images.unsplash.com/photo-1575932596545-e11de6e6da5a?q=80&w=400' },
        { id: 10, category: 'Zakuska', name: 'Kolbasa Set', description: 'Turli xil dudlangan kolbasalar to\'plami', price: 15000, image_url: 'https://images.unsplash.com/photo-1601314159518-e3f438a19230?q=80&w=400' },
        { id: 11, category: 'Zakuska', name: 'Akarachka Set', description: 'Qovurilgan tovuq oyoqchalari', price: 20000, image_url: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8dd?q=80&w=400' },
        { id: 12, category: 'Zakuska', name: 'Turak', description: 'Qovurilgan xamirli gazaklar', price: 5000, image_url: 'https://images.unsplash.com/photo-1606787619246-3811634ab9ef?q=80&w=400' },
        { id: 13, category: 'Zakuska', name: 'Semechka Katta', description: 'Katta paket semechka', price: 15000, image_url: 'https://images.unsplash.com/photo-1563261621-e0e671607efd?q=80&w=400' },
        { id: 14, category: 'Zakuska', name: 'Semechka Mini', description: 'Kichik paket semechka', price: 5000, image_url: 'https://images.unsplash.com/photo-1563261621-e0e671607efd?q=80&w=400' },

        { id: 15, category: 'Ichimliklar', name: 'Pivo Razlivnoy', description: 'Muzdek razlivnoy pivo', price: 10000, image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400' },
        { id: 16, category: 'Ichimliklar', name: 'Pivo Kibray', description: 'Kibray pivosi (shisha)', price: 20000, image_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=400' },
        { id: 17, category: 'Ichimliklar', name: 'Pivo Sarbast Light', description: 'Sarbast Light (shisha)', price: 25000, image_url: 'https://images.unsplash.com/photo-1575037614876-c3cc26d24a04?q=80&w=400' },
        { id: 18, category: 'Ichimliklar', name: 'Cola 1L', description: 'Coca-Cola 1 litr', price: 15000, image_url: 'https://images.unsplash.com/photo-1554522811-1a051d9eb448?q=80&w=400' },
        { id: 19, category: 'Ichimliklar', name: 'Cola 1.5L', description: 'Coca-Cola 1.5 litr', price: 18000, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400' },
        { id: 20, category: 'Ichimliklar', name: 'Mineral 1.5L', description: 'Gazli mineral suv 1.5L', price: 8000, image_url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=400' },
        { id: 21, category: 'Ichimliklar', name: 'Mineral 1L', description: 'Gazsiz mineral suv 1L', price: 6000, image_url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=400' },

        { id: 22, category: 'Extra', name: 'Kapchyonny Balyk', description: 'Dudlangan maxsus baliq', price: 30000, image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400' },
        { id: 23, category: 'Extra', name: 'Zakrytii Vobla', description: 'Tozalangan quritilgan vobla', price: 30000, image_url: 'https://images.unsplash.com/photo-1545696563-00e998bbdbcc?q=80&w=400' }
    ];
}
