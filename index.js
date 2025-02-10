const logger = require('./logger');
const publicIp = require('public-ip');

const PORTS_TO_CHECK = Array.from({ length: 10 }, (_, i) => 31400 + i);

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
    const failedPorts = [];
    const isPortReachable = (await import('is-port-reachable')).default; // Fix import

    for (const port of PORTS_TO_CHECK) {
        try {
            const isReachable = await isPortReachable(port, { host: ip });
            if (isReachable) {
                logger.info(`🟢 Port ${port} on ${ip} is open.`);
            } else {
                logger.warn(`🔴 Port ${port} on ${ip} is unreachable.`);
                failedPorts.push(port);
            }
        } catch (error) {
            logger.error(`❌ Error checking port ${port} on ${ip}:`, error);
            failedPorts.push(port);
        }
    }

    return failedPorts;
}


async function monitor() {
    const ip = await getPublicIP();
    logger.info(`🌐 Public IP: ${ip}`);

    const failedPorts = await checkPorts(ip);

    if (failedPorts.length > 0) {
        const alertMessage = `⚠️ *PiNode ALERT*\n🔹 Public IP: ${ip}\n🔹 ❌ Failed Ports: ${failedPorts.join(', ')}\n📢 Check immediately!`;
        logger.warn(alertMessage);
    } else {
        logger.info('✅ All ports are reachable.');
    }
}

setInterval(monitor, 5 * 60 * 1000);
monitor();
