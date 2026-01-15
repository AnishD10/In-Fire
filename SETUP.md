# Setup Instructions

## ⚙️ Step-by-Step Setup Guide

### Step 1: Clone/Setup Project

```bash
# Navigate to project directory
cd In-Fire

# Verify structure
ls -la
# Should see: backend/ frontend/ README.md
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `.env` with your credentials:**

```
# MQTT Configuration (HiveMQ Cloud)
MQTT_HOST=d9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud
MQTT_PORT=8883
MQTT_USER=LPG_Detection
MQTT_PASSWORD=Fire@101
MQTT_CLIENT_ID=backend-node-server

# Gmail SMTP (for email alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_FROM_EMAIL=your-email@gmail.com

# Server Configuration
PORT=5000
NODE_ENV=development
GAS_THRESHOLD=870
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password
4. Paste in `.env` as `SMTP_PASSWORD`

**Start Backend:**
```bash
npm start        # Production mode
npm run dev      # Development with auto-reload
```

✓ Backend running on `http://localhost:5000`

### Step 3: Frontend Setup

```bash
# From project root
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✓ Frontend running on `http://localhost:5173`

### Step 4: Verify Connections

**Check Backend Health:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "Backend is running",
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

**Check Frontend:**
Open http://localhost:5173 in browser

### Step 5: Configure ESP32

Update `main.py` with:
```python
WIFI_NETWORKS = [
    {"ssid": "your_wifi_ssid", "password": "your_password"}
]

MQTT_HOST = "d9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud"
MQTT_USER = "LPG_Detection"
MQTT_PASS = "Fire@101"
```

Upload to ESP32 using Thonny or esptool.

## 🧪 Testing the Complete System

### Test 1: Verify MQTT Connection

**Check Backend MQTT Status:**
```
Expected console output:
✓ Connected to HiveMQ Cloud!
✓ Subscribed to MQTT topics
```

### Test 2: Simulate Gas Reading

Use MQTT client (MQTT Explorer) to publish:
```
Topic: LPG/gas/value
Payload: 950
```

**Expected on Frontend:**
- Gas value updates to 950
- Status changes to GAS_DETECTED (since 950 > 870)
- Alert notification appears

### Test 3: Subscribe to Alerts

1. Open Frontend (http://localhost:5173)
2. Scroll to "Subscribe to Alerts" section
3. Enter email: test@example.com
4. Click "Subscribe Now"
5. Check email for welcome message

### Test 4: Control Commands

1. Click "ON" button in Control Panel
2. Check console: "✓ Published control command: ON"
3. Message published to MQTT topic `LPG/system/control`

### Test 5: Email Alert

1. Publish gas value > 870 via MQTT
2. Check subscribed email for alert
3. Verify alert contains gas value and timestamp

## 🚀 Production Deployment

### Backend Deployment (Heroku/Railway/AWS)

```bash
# Create Procfile in backend/
echo "web: node server.js" > Procfile

# Set environment variables on platform
# Then deploy
```

### Frontend Deployment (Vercel/Netlify)

```bash
cd frontend

# Build
npm run build

# Deploy the dist/ folder
```

## 📋 Deployment Checklist

- [ ] Update `.env` with production credentials
- [ ] Change `NODE_ENV` to "production"
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Add input validation
- [ ] Set up monitoring/logging
- [ ] Test all endpoints in production
- [ ] Configure backups for `subscribers.json`

## 🆘 Common Setup Issues

### Port Already in Use

**Backend (5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

**Frontend (5173):**
```bash
# Change port in vite.config.js
export default defineConfig({
  server: {
    port: 5174,  // Use different port
  }
})
```

### MQTT Connection Issues

- Check HiveMQ credentials
- Verify firewall allows port 8883
- Test MQTT connection with MQTT Explorer
- Check network connectivity

### Email Not Sending

```bash
# Test SMTP connection
# Use SMTP testing tool or check:
# 1. Gmail 2FA enabled
# 2. App Password generated
# 3. Email in .env is correct
# 4. Check Gmail "Less Secure Apps" setting
```

### CORS Errors

Add to `backend/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://yourdomain.com'  // production domain
  ],
  credentials: true
}))
```

## 📞 Support

For issues:
1. Check console logs (backend & browser)
2. Verify `.env` configuration
3. Test with MQTT Explorer
4. Check network connectivity
5. Review README.md troubleshooting section

---

**All set! Your IoT Gas Detection System is ready.** 🎉
