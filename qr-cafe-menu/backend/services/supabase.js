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

module.exports = {
    fetchMenu,
    saveOrder
};
