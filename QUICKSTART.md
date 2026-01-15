# Quick Start Guide

Get the IoT Gas Detection System running in 5 minutes!

## 🚀 Prerequisites

- Node.js 16+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Git (optional)

## ⚡ 5-Minute Setup

### 1. Backend (2 minutes)

```bash
# Navigate to backend
cd backend

# Install packages
npm install

# Create .env file (copy the example)
cp .env.example .env

# Edit .env with your credentials:
# - MQTT_HOST, MQTT_USER, MQTT_PASSWORD from HiveMQ Cloud
# - SMTP_USER, SMTP_PASSWORD from Gmail

# Start backend
npm start
```

✅ **Backend running:** http://localhost:5000/api/health

### 2. Frontend (2 minutes)

```bash
# In new terminal, navigate to frontend
cd frontend

# Install packages
npm install

# Start development server
npm run dev
```

✅ **Frontend running:** http://localhost:5173

### 3. Open Browser

Open http://localhost:5173 in your browser

**You should see:**
- 📊 Real-time Gas Dashboard
- 🎮 Control Panel (ON/OFF/TEST buttons)
- 📧 Subscribe Form
- ⚠️ Alert notifications

---

## 🔧 Configuration

### HiveMQ Cloud Credentials

1. Go to https://www.hivemq.cloud/
2. Create free account or login
3. Create cluster
4. Copy credentials to `.env`:

```env
MQTT_HOST=your-cluster-id.eu.hivemq.cloud
MQTT_PORT=8883
MQTT_USER=your-username
MQTT_PASSWORD=your-password
```

### Gmail SMTP Setup

1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy to `.env`:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 🧪 Test the System

### Test 1: API Health

```bash
curl http://localhost:5000/api/health
```

Expected: `{"status":"Backend is running"...}`

### Test 2: Gas Reading

```bash
curl http://localhost:5000/api/gas/latest
```

Expected: `{"success":true,"data":{"value":0,"status":"NORMAL",...}}`

### Test 3: Subscribe

```bash
curl -X POST http://localhost:5000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected: `{"success":true,"message":"Successfully subscribed..."}`

### Test 4: Send Command

```bash
curl -X POST http://localhost:5000/api/control \
  -H "Content-Type: application/json" \
  -d '{"command":"ON"}'
```

Expected: `{"success":true,"message":"Control command 'ON' sent..."}`

---

## 🆘 Troubleshooting

### Port 5000 Already in Use

```bash
# Find and kill process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# macOS/Linux
lsof -i :5000
kill -9 [PID]
```

### MQTT Connection Failed

- ✅ Check HiveMQ cluster is running
- ✅ Verify credentials in `.env`
- ✅ Check firewall allows port 8883
- ✅ Test with MQTT Explorer

### Email Not Sending

- ✅ Verify Gmail App Password (not regular password)
- ✅ Check 2FA is enabled on Gmail
- ✅ Verify email in `.env`
- ✅ Check spam folder

### Frontend Not Connecting to Backend

- ✅ Verify backend is running (http://localhost:5000/api/health)
- ✅ Check console for CORS errors
- ✅ Backend must be started before frontend

---

## 📁 Project Structure

```
In-Fire/
├── backend/              ← Node.js + Express server
│   ├── mqtt/            ← MQTT client
│   ├── routes/          ← API endpoints
│   ├── services/        ← Email & subscriber logic
│   ├── data/            ← subscribers.json
│   ├── server.js        ← Entry point
│   ├── package.json
│   └── .env             ← Your credentials
│
├── frontend/            ← React + Vite app
│   ├── src/
│   │   ├── components/  ← Dashboard, Controls, etc.
│   │   ├── services/    ← API calls
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── README.md            ← Full documentation
├── SETUP.md             ← Detailed setup
├── API_REFERENCE.md     ← API endpoints
└── ARCHITECTURE.md      ← System design
```

---

## 📚 Documentation

- **[README.md](README.md)** - Complete system overview
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[API_REFERENCE.md](API_REFERENCE.md)** - All endpoints & payloads
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design & patterns

---

## 🎯 Next Steps

1. ✅ Backend running
2. ✅ Frontend running
3. ✅ API responding
4. ✅ Subscribe to alerts
5. 🔄 Simulate gas reading (via MQTT)
6. 📊 Watch dashboard update
7. 📧 Check email for alert
8. 🎮 Test ON/OFF/TEST commands
9. 📚 Read ARCHITECTURE.md for deep dive
10. 🚀 Deploy to production

---

## 💡 Pro Tips

**Dual Terminal Setup:**
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - Monitor MQTT (optional)
# Use MQTT Explorer or mosquitto_sub
```

**Browser DevTools:**
- **Network Tab** - See API calls
- **Console Tab** - Check for errors
- **Application Tab** - See local storage/cookies

**Backend Logging:**
- Watch for `✓` (success) and `✗` (error) messages
- Check MQTT connection status
- Monitor email sending logs

---

## 🎉 You're Ready!

Your IoT Gas Detection System is now running!

Questions? Check the docs or review the code comments.

Happy coding! 🚀
