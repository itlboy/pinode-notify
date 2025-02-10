const logger = require('./logger');
const publicIp = require('public-ip');
const axios = require('axios');
require('dotenv').config();

const PORTS_TO_CHECK = Array.from({ length: 10 }, (_, i) => 31400 + i);
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL) {
    console.error('❌ DISCORD_WEBHOOK_URL is not set in .env file');
    process.exit(1);
}

let previousPortStatus = {};

async function getPublicIP() {
    return "1.54.227.114";
    try {
        const publicIpModule = await import('public-ip');
        return await publicIpModule.publicIpv4();
    } catch (error) {
        logger.error('❌ Failed to retrieve public IP:', error);
        return 'Unknown';
    }
}

async function checkPorts(ip) {
    const isPortReachable = (await import('is-port-reachable')).default;
    const portStatus = {};

    for (const port of PORTS_TO_CHECK) {
        try {
            const isReachable = await isPortReachable(port, { host: ip });
            portStatus[port] = isReachable;

            if (isReachable) {
                logger.info(`🟢 Port ${port} on ${ip} is open.`);
            } else {
                logger.warn(`🔴 Port ${port} on ${ip} is unreachable.`);
            }
        } catch (error) {
            logger.error(`❌ Error checking port ${port} on ${ip}:`, error);
            portStatus[port] = false;
        }
    }

    return portStatus;
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

    const currentPortStatus = await checkPorts(ip);
    let logMessage = `🌐 **Public IP:** ${ip}\n`;
    let statusChanged = false;

    for (const port of PORTS_TO_CHECK) {
        const portState = currentPortStatus[port] ? '🟢 Open' : '🔴 Unreachable';
        logMessage += `🔹 **Port ${port}:** ${portState}\n`;

        if (previousPortStatus[port] !== undefined && previousPortStatus[port] !== currentPortStatus[port]) {
            statusChanged = true;
        }
    }

    // Log the port status to console
    logger.info(logMessage);

    // Only send to Discord if it's the first run or if there's a change
    if (Object.keys(previousPortStatus).length === 0 || statusChanged) {
        await sendDiscordAlert(`⚠️ *PiNode Monitoring Update*\n${logMessage}`);
    }

    // Update previous status for next comparison
    previousPortStatus = { ...currentPortStatus };
}

// Run immediately and set interval
setInterval(monitor, 5 * 60 * 1000);
monitor();
