const axios = require('axios');
const logger = require('./logger');
require('dotenv').config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL) {
    console.error('❌ DISCORD_WEBHOOK_URL is not set in .env file');
    process.exit(1);
}

// ✅ Hàm gửi thông báo lên Discord với timeout 30 giây
async function sendDiscordAlert(message) {
    try {
        await axios.post(DISCORD_WEBHOOK_URL, { content: message }, { timeout: 30000 }); // ⏳ Timeout 30 giây
        logger.info("✅ Notification sent to Discord.");
    } catch (error) {
        logger.error('❌ Failed to send Discord alert:', error.message);
    }
}

module.exports = { sendDiscordAlert };
