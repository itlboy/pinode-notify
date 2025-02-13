const logger = require('./logger');
const publicIp = require('public-ip');
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

async function getPublicIP() {
    try {
        const publicIpModule = await import('public-ip');
        return await publicIpModule.publicIpv4();
    } catch (error) {
        logger.error('❌ Failed to retrieve public IP:', error);
        return 'Unknown';
    }
}

async function sendDiscordAlert(message) {
    try {
        await axios.post(DISCORD_WEBHOOK_URL, { content: message });
    } catch (error) {
        logger.error('❌ Failed to send Discord alert:', error);
    }
}

async function monitor() {
    const ip = await getPublicIP();
    logger.info(`🌐 Public IP: ${ip}`);

    const currentPortStatus = await checkPorts(ip, PORTS_TO_CHECK);
    let logMessage = `🌐 **Public IP:** ${ip}\n`;
    let statusChanged = false;

    for (const port of PORTS_TO_CHECK) {
        const portState = currentPortStatus[port] ? '🟢 Open' : '🔴 Unreachable';
        logMessage += `🔹 **Port ${port}:** ${portState}\n`;

        if (previousPortStatus[port] !== undefined && previousPortStatus[port] !== currentPortStatus[port]) {
            statusChanged = true;
        }
    }

    // Log to console
    logger.info(logMessage);

    // Send to Discord only if it's the first run or if there's a change
    if (Object.keys(previousPortStatus).length === 0 || statusChanged) {
        await sendDiscordAlert(`⚠️ *PiNode Monitoring Update*\n${logMessage}`);
    }

    // Update previous status for next comparison
    previousPortStatus = { ...currentPortStatus };
}

// Run immediately and set interval
setInterval(monitor, 5 * 60 * 1000);
monitor();
