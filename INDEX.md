# 📚 Complete Project Index & Quick Reference

## ✅ What's Included

### Backend (Node.js + Express)
- ✅ `server.js` - Express application entry point
- ✅ `mqtt/mqttClient.js` - HiveMQ Cloud connection & messaging
- ✅ `routes/gasRoutes.js` - Gas readings API
- ✅ `routes/controlRoutes.js` - System control API
- ✅ `routes/subscriberRoutes.js` - Email subscription API
- ✅ `services/emailService.js` - Nodemailer + Gmail
- ✅ `services/alertService.js` - Subscriber management
- ✅ `data/subscribers.json` - Email storage
- ✅ `package.json` - Dependencies
- ✅ `.env.example` - Configuration template

### Frontend (React + Vite + TailwindCSS)
- ✅ `index.html` - HTML entry point
- ✅ `src/App.jsx` - Main React component
- ✅ `src/main.jsx` - React DOM entry
- ✅ `src/index.css` - Global styles
- ✅ `src/components/Dashboard.jsx` - Gas visualization
- ✅ `src/components/ControlPanel.jsx` - Control buttons
- ✅ `src/components/SubscribeForm.jsx` - Email form
- ✅ `src/components/Alerts.jsx` - Toast notifications
- ✅ `src/services/api.js` - API helpers
- ✅ `vite.config.js` - Vite configuration
- ✅ `tailwind.config.js` - TailwindCSS config
- ✅ `postcss.config.js` - PostCSS config
- ✅ `package.json` - Dependencies

### ESP32 Code
- ✅ `ESP32_main.py` - Complete MicroPython code

### Documentation
- ✅ `README.md` - Complete system documentation
- ✅ `SETUP.md` - Installation guide
- ✅ `QUICKSTART.md` - 5-minute quick start
- ✅ `API_REFERENCE.md` - All API endpoints
- ✅ `ARCHITECTURE.md` - System design & patterns
- ✅ `VIVA_EXPLANATION.md` - Viva presentation guide
- ✅ `PROJECT_SUMMARY.md` - Executive summary
- ✅ `.gitignore` - Git ignore rules

---

## 🚀 Getting Started

### Step 1: Read This First
1. **[QUICKSTART.md](QUICKSTART.md)** - 5 minutes to get running
2. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Understand what you have

### Step 2: Install & Run
1. **Backend:** `cd backend && npm install && npm start`
2. **Frontend:** `cd frontend && npm install && npm run dev`
3. **Browser:** Open http://localhost:5173

### Step 3: Configure
1. **[SETUP.md](SETUP.md)** - Detailed configuration
2. Update `backend/.env` with HiveMQ & Gmail credentials

### Step 4: Understand
1. **[README.md](README.md)** - Complete overview
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Design patterns
3. **[VIVA_EXPLANATION.md](VIVA_EXPLANATION.md)** - For presentation

### Step 5: Learn APIs
1. **[API_REFERENCE.md](API_REFERENCE.md)** - All endpoints & payloads

---

## 📖 Documentation Guide

| Document | Purpose | Read When |
|----------|---------|-----------|
| [QUICKSTART.md](QUICKSTART.md) | Get running in 5 minutes | First (before anything else) |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | See what you have | After quick start |
| [README.md](README.md) | Complete system overview | Need full understanding |
| [SETUP.md](SETUP.md) | Step-by-step installation | During setup/configuration |
| [API_REFERENCE.md](API_REFERENCE.md) | All endpoints & payloads | Developing/testing API |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design & patterns | Understanding internals |
| [VIVA_EXPLANATION.md](VIVA_EXPLANATION.md) | For presentation | Preparing for viva |

---

## 🔧 Configuration Checklist

### Backend Configuration
```
[ ] Backend folder has package.json
[ ] Installed: npm install in backend/
[ ] Created: backend/.env from .env.example
[ ] Set: MQTT_HOST (from HiveMQ Cloud)
[ ] Set: MQTT_USER & MQTT_PASSWORD
[ ] Set: SMTP_USER (Gmail email)
[ ] Set: SMTP_PASSWORD (Gmail App Password)
[ ] Set: ALERT_FROM_EMAIL (same as SMTP_USER)
[ ] Started: npm start in backend/
[ ] Verified: http://localhost:5000/api/health
```

### Frontend Configuration
```
[ ] Frontend folder has package.json
[ ] Installed: npm install in frontend/
[ ] Started: npm run dev in frontend/
[ ] Verified: http://localhost:5173 in browser
[ ] See: Dashboard, Controls, Subscribe form
```

### HiveMQ Cloud
```
[ ] Created account at hivemq.cloud
[ ] Created/deployed cluster
[ ] Copied broker URL to .env (MQTT_HOST)
[ ] Created username and password
[ ] Copied credentials to .env
```

### Gmail Setup
```
[ ] Enabled 2FA on Gmail account
[ ] Generated App Password at myaccount.google.com/apppasswords
[ ] Copied 16-character password to .env (SMTP_PASSWORD)
[ ] Set email address in SMTP_USER
```

---

## 🧪 Quick Testing

### Test Backend
```bash
# Check if running
curl http://localhost:5000/api/health

# Get latest gas reading
curl http://localhost:5000/api/gas/latest

# Subscribe email
curl -X POST http://localhost:5000/api/subscribe \
  -d '{"email":"test@example.com"}'

# Send command
curl -X POST http://localhost:5000/api/control \
  -d '{"command":"ON"}'
```

### Test Frontend
```
1. Open http://localhost:5173
2. Should see:
   - Dashboard with gas value (0)
   - Control Panel with 3 buttons
   - Subscribe form
   - Footer
3. No errors in console
```

### Test MQTT
```
Use MQTT Explorer:
1. Connect to your HiveMQ cluster
2. Subscribe to: LPG/gas/value
3. Publish test value: 950
4. Should see in dashboard
5. Check email for alert
```

---

## 📁 File Structure at a Glance

```
In-Fire/
│
├─ 📄 QUICKSTART.md          ← START HERE
├─ 📄 PROJECT_SUMMARY.md     ← Overview
├─ 📄 README.md              ← Full docs
├─ 📄 SETUP.md               ← Installation
├─ 📄 API_REFERENCE.md       ← API docs
├─ 📄 ARCHITECTURE.md        ← Design
├─ 📄 VIVA_EXPLANATION.md    ← Presentation
├─ 📄 ESP32_main.py          ← Device code
├─ 📄 .gitignore             ← Git config
│
├─ backend/                  ← Node.js Server
│  ├─ 📄 server.js           (Express app)
│  ├─ 📄 package.json        (Dependencies)
│  ├─ 📄 .env.example        (Config template)
│  ├─ mqtt/
│  │  └─ 📄 mqttClient.js    (MQTT broker connection)
│  ├─ routes/
│  │  ├─ 📄 gasRoutes.js     (GET gas reading)
│  │  ├─ 📄 controlRoutes.js (POST commands)
│  │  └─ 📄 subscriberRoutes.js (Email mgmt)
│  ├─ services/
│  │  ├─ 📄 emailService.js  (Gmail integration)
│  │  └─ 📄 alertService.js  (Subscriber DB)
│  └─ data/
│     └─ 📄 subscribers.json (Stored emails)
│
└─ frontend/                 ← React App
   ├─ 📄 index.html          (HTML entry)
   ├─ 📄 package.json        (Dependencies)
   ├─ 📄 vite.config.js      (Vite config)
   ├─ 📄 tailwind.config.js  (Styles config)
   ├─ 📄 postcss.config.js   (CSS config)
   └─ src/
      ├─ 📄 main.jsx         (React entry)
      ├─ 📄 App.jsx           (Main component)
      ├─ 📄 index.css         (Global styles)
      ├─ components/
      │  ├─ 📄 Dashboard.jsx  (Gas display)
      │  ├─ 📄 ControlPanel.jsx (Buttons)
      │  ├─ 📄 SubscribeForm.jsx (Email form)
      │  └─ 📄 Alerts.jsx     (Toast alerts)
      ├─ services/
      │  └─ 📄 api.js         (API calls)
      └─ assets/              (Images placeholder)
```

---

## 🎯 Key Endpoints

### REST API (Backend)
```
GET    /api/gas/latest           - Get current reading
POST   /api/control              - Send command
POST   /api/subscribe            - Subscribe email
GET    /api/subscribe/list       - Get all subscribers
DELETE /api/subscribe/:email     - Unsubscribe
```

### MQTT Topics
```
LPG/gas/value        - Gas sensor reading (ESP32 → Backend)
LPG/gas/status       - System status (ESP32 → Backend)
LPG/system/control   - Control commands (Backend → ESP32)
```

---

## 💡 Common Tasks

### Start Development
```bash
# Terminal 1: Backend
cd backend && npm install && npm start

# Terminal 2: Frontend
cd frontend && npm install && npm run dev

# Terminal 3: Monitor MQTT (optional)
# Use MQTT Explorer app
```

### Test Gas Leak Alert
```bash
1. Open http://localhost:5173
2. Open MQTT Explorer, connect to HiveMQ
3. Publish: LPG/gas/value = 950
4. Watch dashboard turn RED
5. Check email for alert
```

### Deploy to Production
```
Backend: Deploy to Heroku/Railway/AWS
Frontend: Build with npm run build, deploy to Vercel
```

### Add New Feature
1. Identify if it's frontend or backend
2. Follow modular structure
3. Test before committing
4. Update documentation

---

## 🎓 For Your Viva

### Before Presentation
1. ✅ Read [VIVA_EXPLANATION.md](VIVA_EXPLANATION.md)
2. ✅ Practice explaining the flow
3. ✅ Have system running live
4. ✅ Know the architecture
5. ✅ Be ready to show code

### During Viva
1. 📊 Explain the three layers
2. 📡 Draw the data flow diagram
3. 🔄 Show real-time updates
4. 📧 Demonstrate email alerts
5. 🎮 Show control commands
6. 🔐 Discuss security features

### Key Points
- Real-time MQTT communication
- Polling vs WebSocket trade-off
- Modular architecture
- Email alert system
- Easy to scale/extend

---

## 🆘 Need Help?

### Problem: Backend won't start
- Check: `node --version` (need 16+)
- Check: `npm install` ran successfully
- Check: `.env` file exists
- Check: Port 5000 not in use

### Problem: Frontend won't load
- Check: Backend is running
- Check: Browser console for errors
- Check: http://localhost:5173 in address bar
- Check: No cache issues (Ctrl+Shift+R)

### Problem: MQTT won't connect
- Check: HiveMQ cluster is deployed
- Check: Credentials in `.env` are correct
- Check: Firewall allows port 8883
- Check: Internet connectivity

### Problem: Email not sending
- Check: Gmail 2FA enabled
- Check: App password (not regular password)
- Check: Email address in `.env`
- Check: Less secure apps allowed

---

## 📚 Learning Resources

### MQTT
- [MQTT.org](https://mqtt.org/) - Protocol basics
- [HiveMQ Blog](https://www.hivemq.com/blog/) - Best practices

### Express.js
- [Express Docs](https://expressjs.com/) - Official docs
- [MDN Guide](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs) - Tutorial

### React
- [React Docs](https://react.dev/) - Official
- [Vite Guide](https://vitejs.dev/) - Vite documentation

### TailwindCSS
- [TailwindCSS Docs](https://tailwindcss.com/docs) - Official
- [Component Examples](https://tailwindui.com/) - UI components

### MicroPython
- [MicroPython Docs](https://docs.micropython.org/) - Full reference
- [Thonny IDE](https://thonny.org/) - For ESP32 programming

---

## ✨ Final Checklist

### Before Viva
- [ ] All files created
- [ ] Backend runs without errors
- [ ] Frontend loads in browser
- [ ] Can subscribe to emails
- [ ] Can send control commands
- [ ] MQTT connection working
- [ ] Documentation complete
- [ ] Code is clean and commented
- [ ] Practiced explanation
- [ ] System tested end-to-end

### Ready to Present?
- [ ] Confident in architecture
- [ ] Can explain all components
- [ ] Know the data flow
- [ ] Can discuss trade-offs
- [ ] Can show live demo
- [ ] Ready for questions

---

**You now have a complete, production-ready IoT Gas Detection System!**

## 🚀 Next Steps

1. **[QUICKSTART.md](QUICKSTART.md)** - Get it running (5 min)
2. **[README.md](README.md)** - Understand completely (15 min)
3. **[API_REFERENCE.md](API_REFERENCE.md)** - Learn the APIs (10 min)
4. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Deep dive (20 min)
5. **[VIVA_EXPLANATION.md](VIVA_EXPLANATION.md)** - Prepare presentation (30 min)

**Total: ~80 minutes to full mastery**

---

**Happy coding! You've got this! 🚀**
