# 🎯 IoT Gas Leakage Detection System - Complete Solution

## 📋 What You Have

A **production-ready full-stack IoT Gas Leakage Detection System** with:

### ✅ Backend (Node.js + Express)
- **MQTT Client** - Connects to HiveMQ Cloud with TLS/SSL
- **REST API** - 5 endpoints for frontend communication
- **Email Service** - Automated alerts via Gmail SMTP
- **Subscriber Management** - JSON-based database
- **Real-time Processing** - In-memory gas readings

### ✅ Frontend (React + Vite + TailwindCSS)
- **Dashboard** - Real-time gas visualization with progress bar
- **Control Panel** - ON/OFF/TEST system commands
- **Subscribe Form** - Email subscription for alerts
- **Alert Notifications** - Toast-based feedback system
- **Auto-refresh** - 2-second polling for live updates

### ✅ Documentation
- **README.md** - Complete system overview & architecture
- **SETUP.md** - Step-by-step installation guide
- **QUICKSTART.md** - 5-minute quick start
- **API_REFERENCE.md** - All endpoints & payloads
- **ARCHITECTURE.md** - Design patterns & system flow

---

## 🚀 Start in 3 Steps

### Step 1: Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with HiveMQ & Gmail credentials
npm start
```

### Step 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 3: Open Browser
Visit **http://localhost:5173**

---

## 🔌 System Architecture

```
ESP32 (Gas Sensor)
    ↓ (MQTT Publish)
HiveMQ Cloud (Broker)
    ↓ (Subscribe)
Node.js Backend
    ├─ Stores data
    ├─ Sends emails
    └─ Publishes commands
    ↓ (REST API)
React Frontend
    ├─ Dashboard
    ├─ Controls
    └─ Alerts
    ↓
User Email
    └─ Alert notifications
```

---

## 📡 MQTT Topics

| Topic | Direction | Payload | Example |
|-------|-----------|---------|---------|
| `LPG/gas/value` | ESP32 → Backend | Integer | `892` |
| `LPG/gas/status` | ESP32 → Backend | String | `GAS_DETECTED` |
| `LPG/system/control` | Backend → ESP32 | String | `ON` / `OFF` / `TEST` |

---

## 🔌 REST API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/gas/latest` | Get current gas reading |
| POST | `/api/control` | Send command (ON/OFF/TEST) |
| POST | `/api/subscribe` | Subscribe email for alerts |
| GET | `/api/subscribe/list` | Get all subscribers |
| DELETE | `/api/subscribe/:email` | Unsubscribe |

---

## 📧 Email Alerts

**Triggered when:** Gas value > 870
**Sent to:** All subscribed users
**Contains:**
- ⚠️ Alert status
- 📊 Gas reading value
- ⏰ Timestamp
- 🚨 Safety instructions
- 🔗 Link to dashboard

---

## 📁 Project Structure

```
In-Fire/
│
├─ backend/
│  ├─ mqtt/
│  │  └─ mqttClient.js         (MQTT connection)
│  ├─ routes/
│  │  ├─ gasRoutes.js          (GET /api/gas/latest)
│  │  ├─ controlRoutes.js      (POST /api/control)
│  │  └─ subscriberRoutes.js   (Subscribe/unsubscribe)
│  ├─ services/
│  │  ├─ emailService.js       (Gmail integration)
│  │  └─ alertService.js       (Subscriber management)
│  ├─ data/
│  │  └─ subscribers.json      (Stored emails)
│  ├─ server.js                (Express app)
│  ├─ package.json
│  └─ .env.example
│
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ Dashboard.jsx      (Gas visualization)
│  │  │  ├─ ControlPanel.jsx   (Command buttons)
│  │  │  ├─ SubscribeForm.jsx  (Email subscription)
│  │  │  └─ Alerts.jsx         (Notifications)
│  │  ├─ services/
│  │  │  └─ api.js             (API helpers)
│  │  ├─ App.jsx               (Main component)
│  │  └─ index.css             (Styles)
│  ├─ index.html
│  ├─ vite.config.js
│  ├─ tailwind.config.js
│  └─ package.json
│
├─ README.md                   (Full documentation)
├─ SETUP.md                    (Setup instructions)
├─ QUICKSTART.md               (5-minute start)
├─ API_REFERENCE.md            (All endpoints)
├─ ARCHITECTURE.md             (Design patterns)
└─ .gitignore
```

---

## 🎯 Key Features

### Real-time Dashboard
- ✅ Live gas sensor readings
- ✅ Status indicator (Normal/Alert)
- ✅ Visual progress bar
- ✅ Color-coded alerts (green/red)
- ✅ Auto-refresh every 2 seconds

### System Control
- ✅ ON button - Activate system
- ✅ OFF button - Deactivate system
- ✅ TEST button - Run diagnostics
- ✅ Instant feedback on actions
- ✅ Last command display

### Email Alerts
- ✅ Automatic when gas detected
- ✅ Beautiful HTML templates
- ✅ Safety instructions included
- ✅ Dashboard link for quick access
- ✅ One-click unsubscribe

### Subscriber Management
- ✅ Add email addresses
- ✅ Auto-removal of duplicates
- ✅ View all subscribers (admin)
- ✅ Easy unsubscribe
- ✅ Persistent JSON storage

---

## 🔐 Security Features

- ✅ MQTT TLS/SSL encryption (port 8883)
- ✅ Email credentials in .env (not in code)
- ✅ Input validation (email format, commands)
- ✅ CORS configuration
- ✅ Error handling without exposing internals
- ✅ .gitignore for sensitive files

---

## 🧪 Testing

### Quick Test Commands

**Check backend:**
```bash
curl http://localhost:5000/api/health
```

**Get latest reading:**
```bash
curl http://localhost:5000/api/gas/latest
```

**Subscribe:**
```bash
curl -X POST http://localhost:5000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Send command:**
```bash
curl -X POST http://localhost:5000/api/control \
  -H "Content-Type: application/json" \
  -d '{"command":"ON"}'
```

---

## 💡 For Your Viva Presentation

### Key Points to Highlight:

1. **System Integration**
   - ESP32 publishes real-time sensor data via MQTT
   - Backend subscribes and processes data asynchronously
   - Frontend polls backend for live updates

2. **Scalability**
   - Modular architecture (separate routes, services)
   - Can add multiple ESP32 devices
   - Easy to extend with new features

3. **Real-time Capabilities**
   - MQTT for instant sensor updates
   - 2-second frontend polling
   - Automatic email alerts

4. **Email System**
   - Nodemailer + Gmail SMTP
   - HTML templates for professional look
   - Graceful error handling

5. **User Interface**
   - TailwindCSS for responsive design
   - React hooks for state management
   - Toast notifications for feedback

6. **Code Quality**
   - Clean separation of concerns
   - Reusable components
   - Environment variables for configuration
   - Proper error handling

---

## 🎓 Explain the Flow During Viva:

**"When a gas leakage is detected..."**

1. ESP32 reads analog sensor value (892)
2. Publishes to MQTT topic: `LPG/gas/value`
3. Backend MQTT client receives the message
4. Checks if value > threshold (870)
5. If yes, retrieves all subscribers from JSON file
6. Sends alert email to each subscriber (via Gmail SMTP)
7. Updates in-memory gasReading object
8. Frontend polls `/api/gas/latest` every 2 seconds
9. Receives updated status: `GAS_DETECTED`
10. React re-renders with red alert
11. User sees dashboard turn red + toast notification
12. User clicks "ON" button to activate system
13. POST request to `/api/control` with command "ON"
14. Backend publishes to MQTT: `LPG/system/control`
15. ESP32 receives and executes command
16. System activates: relay, LEDs, servo, buzzer
17. Problem resolved

---

## 📚 Documentation Files

- **[README.md](README.md)** - Complete overview, architecture, troubleshooting
- **[SETUP.md](SETUP.md)** - Installation & configuration
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute quick start
- **[API_REFERENCE.md](API_REFERENCE.md)** - All API endpoints, payloads, data formats
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Design patterns, security, scaling

---

## 🚀 Production Deployment

### Backend (Heroku/Railway/AWS)
```bash
npm install
npm start
```
Set environment variables on platform.

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

---

## 🆘 Need Help?

1. **Backend won't start?**
   - Check .env file exists
   - Verify Node.js installed: `node --version`
   - Check port 5000 not in use

2. **MQTT won't connect?**
   - Verify HiveMQ credentials
   - Check firewall allows 8883
   - Test with MQTT Explorer

3. **Email not sending?**
   - Use Gmail App Password, not regular password
   - Enable 2FA on Gmail
   - Check spam folder

4. **Frontend not updating?**
   - Check backend health: curl http://localhost:5000/api/health
   - Check browser console for errors
   - Verify API URL is correct

---

## 📊 What's Included

✅ Complete backend with MQTT + Express + Email
✅ Full frontend with React + Vite + TailwindCSS
✅ 4 React components (Dashboard, Controls, Alerts, Subscribe)
✅ 3 backend routes (gas, control, subscribe)
✅ 2 backend services (email, alerts)
✅ MQTT client with auto-reconnect
✅ Email alert system with HTML templates
✅ Real-time data polling
✅ Error handling & validation
✅ Comprehensive documentation
✅ Environment configuration template
✅ Git ignore file

---

## 🎉 You're All Set!

Your complete IoT Gas Leakage Detection System is ready to go.

**Next steps:**
1. Follow QUICKSTART.md to get running
2. Test the system with MQTT Explorer
3. Review ARCHITECTURE.md to understand design
4. Customize as needed for your requirements
5. Deploy to production

Good luck with your project! 🚀

---

**For questions about any part of the system, check the relevant documentation file listed above.**
