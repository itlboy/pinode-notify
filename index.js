const logger = require('./logger');
const publicIp = require('public-ip');
const isPortReachable = require('is-port-reachable');
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
    try {
        const publicIpModule = await import('public-ip');
        return await publicIpModule.publicIpv4();
    } catch (error) {
        logger.error('❌ Failed to retrieve public IP:', error);
        return 'Unknown';
    }
}

async function checkPorts(ip) {
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

    // First-time run: Log all ports to Discord
    if (Object.keys(previousPortStatus).length === 0) {
        let startupMessage = `🚀 *PiNode Monitoring Started*\n🔹 **Public IP:** ${ip}\n`;
        startupMessage += PORTS_TO_CHECK.map(
            (port) =>
                `🔹 **Port ${port}**: ${currentPortStatus[port] ? '🟢 Open' : '🔴 Unreachable'}`
        ).join('\n');
        await sendDiscordAlert(startupMessage);
    } else {
        // Log only if there's a status change
        let changeMessage = '';
        for (const port of PORTS_TO_CHECK) {
            if (previousPortStatus[port] !== currentPortStatus[port]) {
                changeMessage += `🔹 **Port ${port}** changed: ${
                    currentPortStatus[port] ? '🟢 Open' : '🔴 Unreachable'
                }\n`;
            }
        }
        if (changeMessage) {
            await sendDiscordAlert(`⚠️ *Port Status Change Detected*\n${changeMessage}`);
        }
    }

    // Update previous status for next comparison
    previousPortStatus = { ...currentPortStatus };
}

// Run immediately and set interval
setInterval(monitor, 5 * 60 * 1000);
monitor();
