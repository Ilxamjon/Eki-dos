const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabase');
const telegramService = require('../services/telegram');

// In-memory store for orders to allow live testing without Supabase configured
let inMemoryOrders = [
    {
        id: 1001,
        tableNumber: "5",
        items: [{ name: "Shashlik", quantity: 2, price: 13000 }],
        totalAmount: 26000,
        comment: "Tezroq",
        status: "new",
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
    }
];

// Get menu items
router.get('/menu', async (req, res) => {
    try {
        const menu = await supabaseService.fetchMenu();
        res.json({ success: true, data: menu });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
});

// Submit a new order
router.post('/orders', async (req, res) => {
    try {
        const { tableNumber, items, totalAmount, comment, orderTime } = req.body;

        if (!tableNumber || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Noto\'g\'ri ma\'lumotlar' });
        }

        const timestamp = orderTime || new Date().toISOString();

        const orderData = {
            tableNumber,
            items,
            totalAmount,
            comment,
            status: 'new',
            timestamp
        };

        // 1. Save to database (optional if mainly relying on Telegram)
        const dbResult = await supabaseService.saveOrder({
            table_number: tableNumber,
            total_amount: totalAmount,
            order_details: items,
            comment: comment,
            status: 'new'
        });

        const finalOrderId = dbResult.id || Date.now();
        orderData.id = finalOrderId;

        // Save to in-memory for admin panel
        inMemoryOrders.unshift(orderData);

        // 2. Send Telegram notification
        const tgResult = await telegramService.sendOrderNotification(orderData);

        if (!tgResult.success) {
            console.warn('Telegram notification failed but order processed', tgResult.error);
        }

        res.status(201).json({
            success: true,
            message: 'Buyurtma muvaffaqiyatli qabul qilindi',
            orderId: finalOrderId
        });

    } catch (error) {
        console.error('Order submission error:', error);
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
});

// ADMIN ROUTES

// Get all orders
router.get('/admin/orders', (req, res) => {
    // In production, fetch from Supabase
    res.json({ success: true, data: inMemoryOrders });
});

// Update order status
router.put('/admin/orders/:id/status', (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    // Validate status
    if (!['new', 'cooking', 'delivered'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const orderIndex = inMemoryOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    inMemoryOrders[orderIndex].status = status;
    res.json({ success: true, data: inMemoryOrders[orderIndex] });
});

// Delete an order
router.delete('/admin/orders/:id', (req, res) => {
    const orderId = parseInt(req.params.id);

    const initialLength = inMemoryOrders.length;
    inMemoryOrders = inMemoryOrders.filter(o => o.id !== orderId);

    if (inMemoryOrders.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted successfully' });
});

module.exports = router;
