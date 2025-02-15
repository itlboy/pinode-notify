const logger = require('./logger');
const { checkPorts } = require('./portChecker');
const { sendDiscordAlert } = require('./notify');
const { startScheduler } = require('./scheduler');
require('dotenv').config();

const PORTS_TO_CHECK = Array.from({ length: 3 }, (_, i) => 31401 + i);

// ✅ Đọc thời gian kiểm tra port từ `.env`, mặc định 5 phút
const PORT_CHECK_INTERVAL_MINUTES = parseInt(process.env.PORT_CHECK_INTERVAL_MINUTES) || 5;

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
                await monitor();
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

// ✅ Gửi thông báo khi ứng dụng khởi động
async function startupNotification() {
    logger.info("📢 Pinode monitoring startup");
    await sendDiscordAlert("📢 Pinode monitoring startup");
}

// ✅ Gửi thông báo startup khi ứng dụng khởi chạy
startupNotification();

// ✅ Chạy kiểm tra ngay khi ứng dụng mở, sau đó kiểm tra lại theo thời gian từ `.env`
setInterval(monitor, PORT_CHECK_INTERVAL_MINUTES * 60 * 1000);
monitor();

// ✅ Khởi động scheduler để gửi notify vào giờ cấu hình trong `.env`
startScheduler();
