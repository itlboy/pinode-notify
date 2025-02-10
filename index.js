require('dotenv').config();
const logger = require('./logger');
const axios = require('axios');
const net = require('net');


// Load environment variables
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Function to get public IP
async function getPublicIP() {
    try {
        const publicIp = await import('public-ip');
        const ip = await publicIp.publicIpv4();
        logger.info(`✅ Successfully retrieved public IP: ${ip}`);
        return ip;
    } catch (error) {
        logger.error('❌ Error retrieving public IP:', error);
        return 'Unknown';
    }
}

const PORTS_TO_CHECK = Array.from({ length: 10 }, (_, i) => 31400 + i);
const TARGET_HOST = '127.0.0.1';

// Function to check ports
async function checkPorts(ip) {
    const failedPorts = [];

    for (const port of PORTS_TO_CHECK) {
        await new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(2000);

            socket.on('connect', () => {
                socket.destroy();
                resolve();
            });

            socket.on('error', (err) => {
                failedPorts.push(port);
                socket.destroy();
                resolve();
            });

            socket.on('timeout', () => {
                failedPorts.push(port);
                socket.destroy();
                resolve();
            });

            socket.connect(port, ip);
        });
    }

    return failedPorts;
}

// Function to send alert to Discord
async function sendDiscordAlert(message) {
    if (!DISCORD_WEBHOOK_URL) {
        logger.warn('⚠️ Discord webhook URL is not configured.');
        return;
    }
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            content: message,
        });
        logger.info('✅ Alert sent to Discord.');
    } catch (error) {
        logger.error('❌ Error sending alert to Discord:', error);
    }
}

// Monitoring function
async function monitor() {
    const ip = await getPublicIP(); // Lấy IP Public
    const failedPorts = await checkPorts(ip); // Kiểm tra cổng trên IP đó

    if (failedPorts.length > 0) {
        // Có cổng bị lỗi -> Báo lỗi
        const alertMessage = `⚠️ *PiNode ALERT* \n🔹 Public IP: ${ip} \n🔹 ❌ Failed Ports: ${failedPorts.join(', ')} \n📢 Check immediately!`;
        logger.warn(alertMessage);
        await sendDiscordAlert(alertMessage);
    } else {
        // Tất cả cổng đều hoạt động bình thường -> Báo thành công
        const successMessage = `✅ *PiNode Monitor* \n🔹 Public IP: ${ip} \n🔹 All ports (${PORTS_TO_CHECK.join(', ')}) are working correctly.`;
        logger.info(successMessage);
        await sendDiscordAlert(successMessage);
    }
}



// Run monitoring every 5 minutes
setInterval(monitor, 5 * 60 * 1000);
monitor();
