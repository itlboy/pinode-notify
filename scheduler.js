const cron = require('node-cron');
const logger = require('./logger');
const { sendDiscordAlert } = require('./notify');
require('dotenv').config();

// ✅ Đọc cấu hình giờ từ `.env` (mặc định 9h & 21h)
const notifyHours = process.env.SCHEDULE_NOTIFY_HOURS ? process.env.SCHEDULE_NOTIFY_HOURS.split(',').map(h => parseInt(h.trim())) : [9, 21];

// ✅ Tạo cron expression từ danh sách giờ
const cronExpressions = notifyHours.map(hour => `0 ${hour} * * *`); // Chạy vào phút 0 của giờ cấu hình

// ✅ Lịch trình gửi notify
function startScheduler() {
    cronExpressions.forEach(cronExp => {
        cron.schedule(cronExp, async () => {
            logger.info("⏰ Sending scheduled notification: Pi Node Notify app is working fine.");
            await sendDiscordAlert("✅ Pi Node Notify app is working fine.");
        });
    });

    logger.info(`🔄 Daily notification scheduler started for hours: ${notifyHours.join(', ')}`);
}

module.exports = { startScheduler };
