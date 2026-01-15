# IoT Gas Leakage Detection System - Full Stack

A complete end-to-end solution for real-time gas leakage monitoring using ESP32, MQTT, Node.js backend, and React frontend.

## 📋 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ESP32 (MicroPython)                                             │
│  ├─ MQ-2 Gas Sensor (ADC Pin 34)                                 │
│  ├─ Connected to WiFi                                            │
│  └─ Publishes to HiveMQ Cloud (MQTT over TLS/SSL)               │
│                    │                                              │
│                    ↓                                              │
│  HiveMQ Cloud (MQTT Broker)                                      │
│  ├─ LPG/gas/value        (Gas readings)                          │
│  ├─ LPG/gas/status       (NORMAL / GAS_DETECTED)                │
│  └─ LPG/system/control   (ON / OFF / TEST commands)              │
│                    │                                              │
│                    ↓                                              │
│  Backend (Node.js + Express)                                     │
│  ├─ MQTT Subscriber (listens to sensor data)                    │
│  ├─ MQTT Publisher (sends control commands)                      │
│  ├─ Email Service (Nodemailer - sends alerts)                    │
│  ├─ REST APIs (gas/latest, control, subscribe)                   │
│  └─ Data Storage (subscribers.json)                              │
│                    │                                              │
│                    ↓                                              │
│  Frontend (React + Vite + TailwindCSS)                           │
│  ├─ Real-time Dashboard                                          │
│  ├─ Control Panel (ON/OFF/TEST buttons)                          │
│  ├─ Alert Notifications                                          │
│  └─ Email Subscription Form                                      │
│                    │                                              │
│                    ↓                                              │
│  User Email (Gmail, Outlook, etc.)                              │
│  └─ Alert notifications when gas is detected                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ (for ESP32 development, if needed)
- HiveMQ Cloud account (Free tier available)
- Gmail account with App Password (for email alerts)

### 1. Backend Setup

```bash
cd backend
npm install
```

**Create `.env` file:**
```
MQTT_HOST=your-hivemq-host.eu.hivemq.cloud
MQTT_PORT=8883
MQTT_USER=your-username
MQTT_PASSWORD=your-password
MQTT_CLIENT_ID=backend-node-server

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_FROM_EMAIL=your-email@gmail.com

PORT=5000
GAS_THRESHOLD=870
```

**Start the backend:**
```bash
npm start          # Production
npm run dev        # Development with auto-reload
```

Backend runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. ESP32 Setup

Use the provided `main.py` file and upload to your ESP32. Update WIFI and MQTT credentials.

## 📡 MQTT Topics & Messages

### Published by ESP32:
```
Topic: LPG/gas/value
Payload: 892                    (integer gas sensor reading)

Topic: LPG/gas/status
Payload: GAS_DETECTED           (or NORMAL)
```

### Published by Backend (to ESP32):
```
Topic: LPG/system/control
Payload: ON                     (or OFF, TEST)
```

## 🔌 REST API Endpoints

### GET `/api/gas/latest`
Returns current gas sensor reading and status.

**Response:**
```json
{
  "success": true,
  "data": {
    "value": 892,
    "status": "GAS_DETECTED",
    "timestamp": "2026-01-15T10:30:45.123Z"
  },
  "message": "Latest gas reading retrieved successfully"
}
```

### POST `/api/control`
Send control commands to the ESP32.

**Request:**
```json
{
  "command": "ON"     // or "OFF", "TEST"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Control command 'ON' sent successfully",
  "command": "ON",
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

### POST `/api/subscribe`
Subscribe user email for gas leakage alerts.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to gas leakage alerts!",
  "email": "user@example.com",
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

### GET `/api/subscribe/list`
Get all subscribers (for admin/debug).

**Response:**
```json
{
  "success": true,
  "count": 5,
  "subscribers": [
    {
      "email": "user1@example.com",
      "subscribedAt": "2026-01-10T15:20:00.000Z"
    },
    {
      "email": "user2@example.com",
      "subscribedAt": "2026-01-12T08:45:00.000Z"
    }
  ]
}
```

### DELETE `/api/subscribe/:email`
Unsubscribe user from alerts.

**Response:**
```json
{
  "success": true,
  "message": "Successfully unsubscribed",
  "email": "user@example.com"
}
```

## 🎯 Data Flow Example

1. **ESP32 Publishes Gas Reading:**
   ```
   Topic: LPG/gas/value
   Payload: 925
   ```

2. **Backend Receives (MQTT Subscriber):**
   ```javascript
   gasReading.value = 925
   gasReading.timestamp = new Date()
   ```

3. **Threshold Check:**
   ```javascript
   if (925 > 870) {
     gasReading.status = 'GAS_DETECTED'
     // Send alert emails to all subscribers
   }
   ```

4. **Email Alert Sent:**
   ```
   To: subscriber@example.com
   Subject: 🚨 GAS LEAKAGE ALERT - IMMEDIATE ACTION REQUIRED
   Body: Gas Value: 925, Timestamp: [current time]
   ```

5. **Frontend Polls Backend:**
   ```javascript
   GET /api/gas/latest
   // Every 2 seconds - displays real-time data
   ```

6. **Frontend Shows Alert:**
   - Dashboard turns RED
   - Status indicator pulses
   - Toast notification appears

7. **User Takes Control Action:**
   ```
   POST /api/control
   { "command": "ON" }
   ```

8. **Backend Publishes Control:**
   ```
   Topic: LPG/system/control
   Payload: ON
   ```

9. **ESP32 Receives and Acts:**
   - Processes the command
   - Activates/deactivates relay
   - Adjusts servo angle
   - Updates LED status

## 📁 Project Structure

```
project-root/
│
├── backend/
│   ├── server.js                 # Express app entry point
│   ├── package.json              # Backend dependencies
│   ├── .env.example              # Environment template
│   │
│   ├── mqtt/
│   │   └── mqttClient.js         # MQTT connection & subscribers
│   │
│   ├── routes/
│   │   ├── gasRoutes.js          # GET /api/gas/latest
│   │   ├── controlRoutes.js      # POST /api/control
│   │   └── subscriberRoutes.js   # Subscribe/unsubscribe endpoints
│   │
│   ├── services/
│   │   ├── emailService.js       # Nodemailer setup
│   │   └── alertService.js       # Subscriber management
│   │
│   └── data/
│       └── subscribers.json      # Stored subscriber emails
│
├── frontend/
│   ├── index.html                # HTML entry point
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # TailwindCSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   │
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Main app component
│       ├── index.css             # Global styles
│       │
│       ├── components/
│       │   ├── Dashboard.jsx     # Real-time gas display
│       │   ├── ControlPanel.jsx  # ON/OFF/TEST buttons
│       │   ├── SubscribeForm.jsx # Email subscription
│       │   └── Alerts.jsx        # Alert notifications
│       │
│       ├── services/
│       │   └── api.js            # API helper functions
│       │
│       └── assets/               # Images, icons (placeholder)
│
├── README.md                      # Project documentation
├── SETUP.md                       # Setup instructions
└── ESP32_main.py                 # ESP32 MicroPython code
```

## 🔐 Security Best Practices

### 1. **Environment Variables**
- Never commit `.env` file to git
- Use `.env.example` as template
- Store sensitive data (API keys, passwords) in `.env`

### 2. **Email Security**
- Use Gmail App Passwords (not main password)
- Enable 2FA on Gmail account
- Consider using SendGrid or Mailgun for production

### 3. **MQTT Security**
- Use TLS/SSL connection (port 8883)
- Store credentials in `.env`, not in code
- Change default HiveMQ credentials

### 4. **API Security**
```javascript
// Add in production:
// - Rate limiting (express-rate-limit)
// - Input validation (express-validator)
// - CORS configuration
// - HTTPS enforcement
// - JWT authentication for admin endpoints
```

### 5. **Frontend Security**
- Never expose API keys in frontend code
- Validate all user inputs
- Use HTTPS in production
- Implement CSRF protection

## 🧪 Testing

### Test Backend Endpoints

```bash
# Test gas reading
curl http://localhost:5000/api/gas/latest

# Test control command
curl -X POST http://localhost:5000/api/control \
  -H "Content-Type: application/json" \
  -d '{"command":"ON"}'

# Test subscribe
curl -X POST http://localhost:5000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test get subscribers
curl http://localhost:5000/api/subscribe/list
```

### Monitor MQTT Messages

Using an MQTT client (e.g., MQTT Explorer):
```
Connect to: your-hivemq-host.eu.hivemq.cloud
Port: 8883
Username: your-username
Password: your-password

Subscribe to:
- LPG/gas/value
- LPG/gas/status
- LPG/system/control
```

## 📊 Real-Time Features

### Frontend Polling
```javascript
// Fetches every 2 seconds
setInterval(() => {
  getLatestReading()
}, 2000)
```

### Alert Notifications
```javascript
// Toast notifications appear on:
- Gas leakage detection (red alert)
- System status change
- Subscription success/error
- Control command sent
```

### Email Alerts
```
Automatically sent when:
- Gas value > 870
- Status becomes GAS_DETECTED
```

## 🔧 Troubleshooting

### Backend Issues

**MQTT Connection Failed**
- Check HiveMQ credentials in `.env`
- Verify firewall allows port 8883
- Ensure internet connectivity
- Check HiveMQ Cloud dashboard

**Email Not Sending**
- Verify Gmail App Password (not regular password)
- Enable "Less Secure Apps" if needed
- Check spam folder
- Verify email address in `.env`

**CORS Errors**
- Ensure frontend is on http://localhost:5173
- Backend has cors middleware configured
- Check browser console for exact error

### Frontend Issues

**API Calls Failing**
- Verify backend is running (`npm start` in backend/)
- Check Network tab in browser DevTools
- Ensure API URL is correct (http://localhost:5000/api)
- Clear browser cache if needed

**Styles Not Applied**
- Run `npm run build` to compile TailwindCSS
- Check if tailwind.config.js is correct
- Restart dev server after config changes

**Real-time Data Not Updating**
- Check if backend has MQTT connection (check terminal)
- Verify ESP32 is publishing to correct topic
- Check frontend polling interval (2 seconds)

## 📚 Additional Resources

- **MQTT Documentation:** https://mqtt.org/
- **HiveMQ Cloud:** https://www.hivemq.cloud/
- **Express.js Docs:** https://expressjs.com/
- **React Documentation:** https://react.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **Vite Guide:** https://vitejs.dev/

## 🎓 For Viva Explanation

### Key Points to Highlight:

1. **System Integration:**
   - ESP32 publishes real-time sensor data via MQTT
   - Backend subscribes and processes data
   - Frontend polls backend for live updates

2. **Email Alert System:**
   - Nodemailer integration with Gmail
   - Automatic alerts when threshold exceeded
   - Beautiful HTML email templates

3. **REST API Design:**
   - RESTful endpoints for all operations
   - JSON request/response format
   - Proper error handling

4. **Real-time Dashboard:**
   - React hooks for state management
   - TailwindCSS for responsive design
   - 2-second polling for live data

5. **Modular Architecture:**
   - Separated concerns (routes, services, mqtt)
   - Reusable components in frontend
   - Easy to extend and maintain

6. **Security Considerations:**
   - TLS/SSL for MQTT
   - Environment variables for credentials
   - Input validation
   - CORS configuration

## 📝 License

Academic project - feel free to use and modify for educational purposes.

## 👤 Author

IoT Gas Leakage Detection System - 2026
