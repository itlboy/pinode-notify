const os = require('os');
const logger = require('./logger');
const { sendDiscordAlert } = require('./notify');
const { startScheduler } = require('./scheduler');
const checkPort = require('./checkPortPoMod'); // Yêu cầu module checkPortPoMod
require('dotenv').config();

const PORTS_TO_CHECK = Array.from({ length: 3 }, (_, i) => 31401 + i);
const PORT_CHECK_INTERVAL_MINUTES = parseInt(process.env.PORT_CHECK_INTERVAL_MINUTES) || 5;
const MEMORY_USAGE_THRESHOLD = parseFloat(process.env.MEMORY_USAGE_THRESHOLD) || 85;

let previousPortStatus = {};
let retrying = false;

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

// ✅ Hàm kiểm tra Memory sử dụng
function getMemoryUsage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    return (usedMemory / totalMemory) * 100; // Trả về % sử dụng RAM
}

// ✅ Hàm kiểm tra trạng thái port & memory, sau đó gửi notify
async function monitor(retry = false) {
    const ip = await getPublicIP();
    const memoryUsage = getMemoryUsage();
    let isMemoryHigh = memoryUsage > MEMORY_USAGE_THRESHOLD;
    
    logger.info(`🌐 Public IP: ${ip}\n🖥️ Memory Usage: ${memoryUsage.toFixed(2)}%`);

    try {
        const currentPortStatus = await checkPort(); // Gọi hàm checkPort từ module mới
        let logMessage = `🌐 **Public IP:** ${ip}\n`;
        
        // ✅ Nếu Memory cao, hiển thị cảnh báo màu đỏ
        if (isMemoryHigh) {
            logMessage += `🔴 **Memory Usage:** ${memoryUsage.toFixed(2)}% (Threshold: ${MEMORY_USAGE_THRESHOLD}%)\n`;
        } else {
            logMessage += `🖥️ **Memory Usage:** ${memoryUsage.toFixed(2)}%\n`;
        }

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

        // ✅ Nếu có lỗi, thử lại sau 1 phút trước khi gửi notify
        if (hasError && !retry && !retrying) {
            retrying = true;
            logger.warn("⚠️ Connection error detected. Retrying in 1 minute...");
            setTimeout(async () => {
                await monitor(true);
                retrying = false;
            }, 60 * 1000);
            return;
        }

        // ✅ Gửi notify nếu có thay đổi, có lỗi (sau retry), hoặc Memory vượt ngưỡng
        if (Object.keys(previousPortStatus).length === 0 || statusChanged || hasError || isMemoryHigh) {
            await sendDiscordAlert(`⚠️ *PiNode Monitoring Update*\n${logMessage}`);
        }

        // ✅ Cập nhật trạng thái port để so sánh lần sau
        previousPortStatus = { ...currentPortStatus };
    } catch (error) {
        logger.error("❌ Error during monitoring:", error);

        // ✅ Nếu lỗi khi gọi API, thử lại sau 1 phút trước khi gửi notify
        if (!retrying) {
            retrying = true;
            logger.warn("⚠️ API error detected. Retrying in 1 minute...");
            setTimeout(async () => {
                await monitor(true);
                retrying = false;
            }, 60 * 1000);
        }
    }
}

// ✅ Gửi thông báo khi ứng dụng khởi động
async function startupNotification() {
    logger.info("📢 Pinode monitoring startup");
    await sendDiscordAlert("📢 Pinode monitoring startup");

    // ✅ Kiểm tra Port ngay lập tức sau khi gửi thông báo khởi động
    await monitor();
}

// ✅ Gửi thông báo startup khi ứng dụng khởi chạy
startupNotification();

// ✅ Chạy kiểm tra Port & Memory theo thời gian từ `.env`
setInterval(monitor, PORT_CHECK_INTERVAL_MINUTES * 60 * 1000);

// ✅ Khởi động scheduler để gửi notify vào giờ cấu hình trong `.env`
startScheduler();