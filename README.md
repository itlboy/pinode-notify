# 🚀 PiNode Notify - Monitoring & Alert System  

PiNode Notify is a monitoring system that checks the operational status of a PiNode by:  
✅ Retrieving the **public IP** of the machine  
✅ Pinging ports **31400 - 31409**  
✅ Sending alerts if any port is unreachable  
✅ Supporting **Discord notifications**  

---

## 📌 1. Installation  

### **Prerequisites**  
- **Docker & Docker Compose** (recommended)  
- **A Discord Webhook URL** (for notifications)  

### **Preferred Installation: Using Docker Compose**  
1. **Clone the repository**  
   ```sh
   git clone https://github.com/<your-github-username>/pinode-notify.git
   cd pinode-notify
   ```

2. **Set up environment variables**  
   Create a `.env` file in the root directory and add the following:  
   ```
   DISCORD_WEBHOOK_URL=your_discord_webhook_url
   ```

   🔹 **How to get your Discord Webhook URL?**  
   - Open Discord and go to the channel where you want to receive notifications.  
   - Click **Edit Channel** → **Integrations** → **Webhooks**.  
   - Click **"New Webhook"**, give it a name, and copy the Webhook URL.  
   - Paste the copied URL into the `.env` file as `DISCORD_WEBHOOK_URL`.

3. **Run the application with Docker Compose**  
   ```sh
   docker-compose up --build -d
   ```
   This will automatically build and run the application inside a Docker container.

4. **Check logs to ensure everything is working correctly**  
   ```sh
   docker logs -f pinode-notify
   ```

---

### **Alternative Installation: Manual Setup**  
If you prefer to run the application without Docker, follow these steps:

1. **Install dependencies**  
   ```sh
   npm install
   ```

2. **Run the application**  
   ```sh
   node index.js
   ```

---

## 📌 2. How It Works  

1. On startup, the system retrieves the **public IP** and checks the status of ports **31400 - 31409**.  
2. If any port is unreachable, an **alert is sent to Discord**.  
3. The monitoring process runs every **5 minutes** to check port availability and send alerts if needed.  

---

## 📌 3. Logging  

- The application uses **Winston** for logging.  
- Logs are displayed in the console and saved to `error.log` if an error occurs.  

---

## 📌 4. Contributing  

Feel free to fork this repository and submit pull requests. Contributions are always welcome!  

---

## 📌 5. License  

This project is open-source and available under the **MIT License**.  

---

🚀 **Happy Monitoring!**  
