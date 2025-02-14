const cron = require('node-cron');
const logger = require('./logger');
const { sendDiscordAlert } = require('./notify'); // Import hàm gửi notify

// ✅ Lịch trình gửi notify vào 9h sáng và 9h tối
function startScheduler() {
    cron.schedule('0 9,21 * * *', async () => {
        logger.info("⏰ Sending scheduled notification: Notify app is working fine.");
        await sendDiscordAlert("✅ Pi Node Notify app is working fine.");
    });

    logger.info("🔄 Daily notification scheduler started.");
}

module.exports = { startScheduler };
