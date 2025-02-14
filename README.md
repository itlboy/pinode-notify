# 📢 Pi Node Notify

Pi Node Notify là một ứng dụng giám sát tình trạng của Pi Node bằng cách kiểm tra trạng thái cổng (`port`) và gửi thông báo lên Discord. Ứng dụng sẽ tự động kiểm tra định kỳ và gửi thông báo khi có sự thay đổi.

---

## 🚀 **Tính năng chính**
- ✅ **Kiểm tra trạng thái các cổng của Pi Node**.
- ✅ **Gửi thông báo lên Discord nếu có thay đổi về trạng thái cổng**.
- ✅ **Gửi thông báo mỗi ngày vào các giờ được cấu hình (`9h sáng` và `9h tối` mặc định)**.
- ✅ **Cho phép tuỳ chỉnh tần suất kiểm tra và giờ gửi thông báo qua `.env`**.
- ✅ **Hỗ trợ Docker & có thể build thành ứng dụng trên Windows/Mac**.

---

## 📥 **1. Cài đặt**
### 🔹 **1.1. Cài đặt trực tiếp**
Yêu cầu:
- **Node.js v22+**
- **Git**
- **Discord Webhook URL**

📍 **Cài đặt ứng dụng:**
```sh
git clone https://github.com/YOUR_GITHUB/pi-node-notify.git
cd pi-node-notify
npm install
```

### 🔹 **1.2. Chạy bằng Docker**
Nếu bạn muốn chạy ứng dụng bằng Docker:
```sh
docker run -d --env-file .env ghcr.io/YOUR_GITHUB/pi-node-notify:latest
```

---

## ⚙️ **2. Cấu hình `.env`**
📍 **Tạo file `.env` trong thư mục dự án:**
```ini
# 🔗 Webhook của Discord để nhận thông báo
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN

# ⏰ Giờ gửi notify hằng ngày (mặc định 9h sáng & 9h tối)
SCHEDULE_NOTIFY_HOURS=9,21

# ⏳ Thời gian kiểm tra cổng (mặc định 5 phút)
PORT_CHECK_INTERVAL_MINUTES=5
```

📌 **Mô tả các biến môi trường:**
| Biến                 | Mô tả                                                  | Mặc định |
|----------------------|------------------------------------------------------|---------|
| `DISCORD_WEBHOOK_URL` | Webhook Discord để nhận thông báo                  | Bắt buộc |
| `SCHEDULE_NOTIFY_HOURS` | Giờ gửi thông báo mỗi ngày (cách nhau bằng dấu `,`) | `9,21` (9h sáng & 9h tối) |
| `PORT_CHECK_INTERVAL_MINUTES` | Số phút kiểm tra port định kỳ                 | `5` phút |

---

## ▶ **3. Chạy ứng dụng**
📍 **Chạy ứng dụng sau khi cài đặt:**
```sh
npm start
```
Hoặc chạy với Docker:
```sh
docker run -d --env-file .env ghcr.io/YOUR_GITHUB/pi-node-notify:latest
```

---

## 🔨 **4. Build ứng dụng cho Windows & macOS**
Nếu bạn muốn build thành ứng dụng Desktop:
```sh
npm run build
```
📍 **Sau khi build, file `.exe` hoặc `.dmg` sẽ được tạo trong thư mục `dist/`.**

---

## 📦 **5. Đóng góp & Phát triển**
Nếu bạn muốn đóng góp, vui lòng:
1. Fork repository.
2. Tạo một branch mới (`feature/my-new-feature`).
3. Commit thay đổi (`git commit -m 'Add new feature'`).
4. Push lên GitHub (`git push origin feature/my-new-feature`).
5. Tạo một Pull Request.

---

## 📜 **6. Giấy phép**
Ứng dụng này được phát hành dưới [MIT License](LICENSE).
