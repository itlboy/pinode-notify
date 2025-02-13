const axios = require('axios');
const logger = require('./logger');

const PORTCHECKER_API_URL = "https://portchecker.io/api/";

async function checkPorts(ip, ports) {
    const portStatus = {};

    for (const port of ports) {
        try {
            const response = await axios.get(`${PORTCHECKER_API_URL}${ip}/${port}`);
            const isReachable = response.data.trim() === "True"; // Fix: Check for "True" as string
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

module.exports = { checkPorts };
