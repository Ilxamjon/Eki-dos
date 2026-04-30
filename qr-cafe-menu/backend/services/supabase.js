const fetch = require('node-fetch');

// This is a simple wrapper for Supabase REST API since we don't necessarily need the full client for just sending/fetching data in MVP
// In a full production app, use @supabase/supabase-js

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const fetchMenu = async () => {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/menu_items?select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!response.ok) {
            // Fallback or empty if DB not yet set up
            console.warn('Supabase fetch failed or not configured, using mock data.');
            return getMockMenu();
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching menu from Supabase:', error);
        return getMockMenu();
    }
};

const saveOrder = async (orderData) => {
    try {
        if (!supabaseUrl || supabaseUrl === 'your_supabase_url') {
            console.log('Mocking save order to DB', orderData);
            return { success: true, id: Date.now() };
        }

        const response = await fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error(`Failed to save order: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, ...data[0] };
    } catch (error) {
        console.error('Error saving order to Supabase:', error);
        return { success: false, error: error.message };
    }
}

// Mock data for development when Supabase isn't configured
function getMockMenu() {
    return [
        { id: 1, category: 'Bluda', name: 'Balıq quwirdaq', description: '', price: 45000, image_url: 'assets/images/balyk-kuyrdak.svg' },
        { id: 2, category: 'Bluda', name: 'Shashlik', description: '', price: 13000, image_url: 'assets/images/shashlik.svg' },
        { id: 3, category: 'Bluda', name: 'Pigodi', description: '', price: 8000, image_url: 'assets/images/pigodi.svg' },
        { id: 4, category: 'Bluda', name: 'Pirojki', description: '', price: 3000, image_url: 'assets/images/pirojki.svg' },
        { id: 5, category: 'Bluda', name: 'Pisken Mayek', description: '', price: 2000, image_url: 'assets/images/pisken-mayek.svg' },
        { id: 6, category: 'Bluda', name: 'Somsa', description: '', price: 7000, image_url: 'assets/images/somsa.svg' },
        { id: 26, category: 'Bluda', name: 'Farsh 1 kg', description: '', price: 140000, image_url: 'assets/images/farsh-1kg.jpg' },

        { id: 7, category: 'Zakuska', name: 'Svejiy Salat', description: '', price: 10000, image_url: 'assets/images/svejiy-salat.svg' },
        { id: 8, category: 'Zakuska', name: 'Markovcha', description: '', price: 5000, image_url: 'assets/images/markovcha.svg' },
        { id: 9, category: 'Zakuska', name: 'Opke Xe', description: '', price: 10000, image_url: 'assets/images/opke-xe.svg' },
        { id: 10, category: 'Zakuska', name: 'Kolbasa Set', description: '', price: 15000, image_url: 'assets/images/kolbasa-set.svg' },
        { id: 11, category: 'Zakuska', name: 'Akarachka Set', description: '', price: 20000, image_url: 'assets/images/akarachka-set.svg' },
        { id: 12, category: 'Zakuska', name: 'Turak', description: '', price: 5000, image_url: 'assets/images/turak.svg' },
        { id: 13, category: 'Zakuska', name: 'Semechka Katta', description: '', price: 15000, image_url: 'assets/images/semechka-katta.svg' },
        { id: 14, category: 'Zakuska', name: 'Semechka Mini', description: '', price: 5000, image_url: 'assets/images/semechka-mini.svg' },
        { id: 25, category: 'Zakuska', name: 'Baliq Xe', description: '', price: 10000, image_url: 'assets/images/opke-xe.svg' },

        { id: 15, category: 'Ichimliklar', name: 'Pivo Razlivnoy', description: '', price: 10000, image_url: 'assets/images/pivo-razlivnoy.svg' },
        { id: 16, category: 'Ichimliklar', name: 'Pivo Kibray', description: '', price: 20000, image_url: 'assets/images/pivo-kibray.svg' },
        { id: 17, category: 'Ichimliklar', name: 'Pivo Sarbast Light', description: '', price: 25000, image_url: 'assets/images/pivo-sarbast-light.svg' },
        { id: 18, category: 'Ichimliklar', name: 'Cola 1L', description: '', price: 15000, image_url: 'assets/images/cola-1l.svg' },
        { id: 19, category: 'Ichimliklar', name: 'Cola 1.5L', description: '', price: 18000, image_url: 'assets/images/cola-15l.svg' },
        { id: 20, category: 'Ichimliklar', name: 'Mineral 1.5L', description: '', price: 7000, image_url: 'assets/images/mineral-15l.svg' },
        { id: 21, category: 'Ichimliklar', name: 'Mineral 1L', description: '', price: 5000, image_url: 'assets/images/mineral-1l.svg' },
        { id: 24, category: 'Ichimliklar', name: 'Gazli ayron', description: '', price: 15000, image_url: 'assets/images/gazli-ayron-v2.jpg' },

        { id: 22, category: 'Extra', name: 'Kapchonnıy Balıq', description: '', price: 30000, image_url: 'assets/images/kapchyonny-balyk.svg' },
        { id: 23, category: 'Extra', name: 'Zakrytii Vobla', description: '', price: 30000, image_url: 'assets/images/zakrytii-vobla.svg' }
    ];
}

module.exports = {
    fetchMenu,
    saveOrder
};
