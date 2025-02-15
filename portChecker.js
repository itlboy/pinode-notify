const axios = require('axios');
const logger = require('./logger');

// ✅ Hàm kiểm tra trạng thái của một cổng với timeout 30 giây
async function checkPort(ip, port) {
    try {
        const response = await axios.get(`https://portchecker.io/api/${ip}/${port}`, { timeout: 30000 }); // ⏳ Timeout 30 giây
        return response.data === "True";
    } catch (error) {
        logger.error(`❌ Error checking port ${port} on ${ip}:`, error.message);
        return false; // Nếu lỗi, giả định cổng đóng
    }
}

// ✅ Kiểm tra danh sách các cổng
async function checkPorts(ip, ports) {
    const results = {};
    for (const port of ports) {
        results[port] = await checkPort(ip, port);
    }
    return results;
}

module.exports = { checkPorts };
