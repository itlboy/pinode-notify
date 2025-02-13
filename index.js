const logger = require('./logger');
const { checkPorts } = require('./portChecker'); // Import module
const axios = require('axios');
require('dotenv').config();

const PORTS_TO_CHECK = Array.from({ length: 3 }, (_, i) => 31401 + i);
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL) {
    console.error('❌ DISCORD_WEBHOOK_URL is not set in .env file');
    process.exit(1);
}

let previousPortStatus = {};
let retrying = false; // 🛠 Đánh dấu trạng thái thử lại khi có lỗi

// ✅ Hàm lấy IP Public
async function getPublicIP() {
    try {
        const publicIpModule = await import('public-ip');
        return await publicIpModule.publicIpv4();
    } catch (error) {
        logger.error('❌ Failed to retrieve public IP:', error);
        return 'Unknown';
    }
}

// ✅ Hàm gửi thông báo lên Discord
async function sendDiscordAlert(message) {
    try {
        await axios.post(DISCORD_WEBHOOK_URL, { content: message });
        logger.info("✅ Notification sent to Discord.");
    } catch (error) {
        logger.error('❌ Failed to send Discord alert:', error);
    }
}

// ✅ Hàm kiểm tra trạng thái port & gửi notify nếu thay đổi
async function monitor() {
    const ip = await getPublicIP();
    logger.info(`🌐 Public IP: ${ip}`);

    try {
        const currentPortStatus = await checkPorts(ip, PORTS_TO_CHECK);
        let logMessage = `🌐 **Public IP:** ${ip}\n`;
        let statusChanged = false;
        let hasError = false;

        for (const port of PORTS_TO_CHECK) {
            const portState = currentPortStatus[port] ? '🟢 OK' : '🔴 Error';
            logMessage += `🔹 **Port ${port}:** ${portState}\n`;

            if (!currentPortStatus[port]) {
                hasError = true; // ✅ Có lỗi kết nối
            }

            if (previousPortStatus[port] !== undefined && previousPortStatus[port] !== currentPortStatus[port]) {
                statusChanged = true;
            }
        }

        // Log to console
        logger.info(logMessage);

        // ✅ Nếu có lỗi, thử lại sau 1 phút trước khi gửi notify
        if (hasError && !retrying) {
            retrying = true;
            logger.warn("⚠️ Connection error detected. Retrying in 1 minute...");
            setTimeout(async () => {
                await monitor(); // ✅ Thử lại sau 1 phút
                retrying = false;
            }, 60 * 1000);
            return;
        }

        // ✅ Gửi notify lên Discord nếu có thay đổi hoặc nếu vẫn lỗi sau retry
        if (Object.keys(previousPortStatus).length === 0 || statusChanged || hasError) {
            await sendDiscordAlert(`⚠️ *PiNode Monitoring Update*\n${logMessage}`);
        }

        // ✅ Cập nhật trạng thái port để so sánh lần sau
        previousPortStatus = { ...currentPortStatus };
    } catch (error) {
        logger.error("❌ Error during monitoring:", error);
    }
}

// ✅ Chạy kiểm tra ngay khi ứng dụng mở, sau đó kiểm tra lại mỗi 5 phút
setInterval(monitor, 5 * 60 * 1000);
monitor();
