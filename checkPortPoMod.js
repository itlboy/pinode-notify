const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

// Hàm checkPort
async function checkPort() {
  try {
    console.log('Bắt đầu gửi yêu cầu POST đến https://pi-mods.de/nodeports/');

    // Tạo form data
    const form = new FormData();
    form.append('speed', 'fast');
    form.append('scan', 'scan');

    // Gửi yêu cầu POST với form data
    const response = await axios.post('https://pi-mods.de/nodeports/', form, {
      headers: form.getHeaders(),
    });

    console.log('Đã nhận được phản hồi từ server. Bắt đầu phân tích HTML...');
    
    // Sử dụng cheerio để phân tích HTML trả về
    const $ = cheerio.load(response.data);

    console.log('Bắt đầu kiểm tra các cổng...');

    // Danh sách để lưu kết quả trạng thái cổng
    const portStatuses = {};

    $('ul.Pi .container').each((index, element) => {
      // Lấy số port từ văn bản (số trước từ khóa "is open" hoặc "is closed")
      const portMatch = $(element).text().trim().match(/(\d{5})/);  // Match số 5 chữ số (ví dụ: 31400)
      
      if (portMatch) {
        const port = portMatch[0];  // Số port lấy được
        const isOpen = $(element).find('.ok').length > 0;  // Kiểm tra nếu có class "ok" (mở)

        // Lưu trạng thái của cổng vào object portStatuses
        portStatuses[port] = isOpen;
      }
    });

    console.log('Danh sách trạng thái của các cổng:', portStatuses);

    // Trả về kết quả với trạng thái của các cổng yêu cầu
    return portStatuses;
  } catch (error) {
    console.error('Có lỗi xảy ra khi kiểm tra các cổng:', error);
    return {};
  }
}

module.exports = checkPort;