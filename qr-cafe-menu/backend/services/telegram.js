const fetch = require('node-fetch');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const sendOrderNotification = async (orderData) => {
    if (!botToken || botToken === 'your_telegram_bot_token') {
        console.log('Telegram bot not configured. Mock sending message:');
        console.log(formatOrderMessage(orderData));
        return { success: true };
    }

    const message = formatOrderMessage(orderData);

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.statusText}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return { success: false, error: error.message };
    }
};

function formatOrderMessage(order) {
    const { tableNumber, items, totalAmount, comment, timestamp } = order;
    const time = new Date(timestamp || Date.now()).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    let msg = `🪑 Stol: ${tableNumber}\n\n`;
    msg += `🍽 Buyurtma:\n`;

    items.forEach((item) => {
        const itemTotal = item.itemTotal || (item.price * item.quantity);
        msg += `${item.name} x${item.quantity} = ${itemTotal}\n`;
    });

    if (comment) {
        msg += `\n📝 Izoh: ${comment}`;
    }

    msg += `\n\n💰 Jami: ${totalAmount}\n`;
    msg += `🕒 Time: ${time}`;

    return msg;
}

module.exports = {
    sendOrderNotification
};
