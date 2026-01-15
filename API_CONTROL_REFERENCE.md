# System API & Control Reference

## 🚀 Quick Start

```bash
# Terminal 1 - Start Backend
cd d:\In-Fire\backend
npm start
# Running on http://localhost:5000

# Terminal 2 - Start Frontend  
cd d:\In-Fire\frontend
npm run dev
# Running on http://localhost:5173
```

---

## 📡 REST API Endpoints

### Gas Reading Endpoint
```
GET http://localhost:5000/api/gas/latest

Response:
{
  "success": true,
  "data": {
    "value": 450,
    "status": "NORMAL",
    "timestamp": "2026-01-15T10:30:45.123Z"
  }
}
```

### Control System (ON/OFF/TEST)
```
POST http://localhost:5000/api/control

Body:
{
  "command": "ON"  // or "OFF" or "TEST"
}

Response:
{
  "success": true,
  "message": "Command sent successfully",
  "command": "ON"
}
```

### Subscribe to Alerts
```
POST http://localhost:5000/api/subscribe

Body:
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Successfully subscribed to gas leakage alerts!",
  "email": "user@example.com",
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

### Get All Subscribers
```
GET http://localhost:5000/api/subscribe/list

Response:
{
  "success": true,
  "count": 3,
  "subscribers": [
    {
      "email": "user1@example.com",
      "subscribedAt": "2026-01-15T10:15:00.000Z"
    },
    {
      "email": "user2@example.com",
      "subscribedAt": "2026-01-15T10:20:00.000Z"
    }
  ]
}
```

### Unsubscribe from Alerts
```
DELETE http://localhost:5000/api/subscribe/user@example.com

Response:
{
  "success": true,
  "message": "Successfully unsubscribed",
  "email": "user@example.com"
}
```

---

## 🔌 MQTT Topics

### ESP32 → Backend (Backend subscribes)

**Topic:** `LPG/gas/value`  
**Message:** Gas ADC value (0-4095)  
**Frequency:** Every 2 seconds  
**Example:** `450` → `500` → `520` → `1250`

**Topic:** `LPG/gas/status`  
**Message:** System status  
**Values:**
- `NORMAL` - Gas level safe
- `GAS_DETECTED - Value: 1250 - EMERGENCY` - Leakage detected

### Backend → ESP32 (ESP32 subscribes)

**Topic:** `LPG/system/control`  
**Commands:**
- `ON` - Enable system (relay ON, green LED, vent closed)
- `OFF` - Disable system (relay OFF, red LED, vent open)
- `TEST` - Run component test

---

## 💾 Subscriber Database

**File:** `d:\In-Fire\backend\data\subscribers.json`

**Format:**
```json
[
  {
    "email": "user1@example.com",
    "subscribedAt": "2026-01-15T10:15:00.000Z"
  },
  {
    "email": "user2@example.com",
    "subscribedAt": "2026-01-15T10:20:00.000Z"
  }
]
```

When gas > 1200:
- Backend reads this file
- Sends alert email to **each** subscriber
- Logs subscriber count: `Sending alerts to 2 subscribers...`

---

## 🧪 Testing Scenarios

### Scenario 1: Test Gas Detection

**Step 1:** Visit http://localhost:5173 dashboard  
**Step 2:** Subscribe with test email: `test@example.com`  
**Step 3:** Simulate high gas value (or wait for real sensor to exceed 1200)

**Expected Results:**
- Dashboard shows "⚠️ GAS DETECTED"
- Status goes RED
- Red LED turns ON (ESP32)
- Buzzer sounds (ESP32)
- Relay cuts gas supply (ESP32)
- Email alert sent to test@example.com
- Backend console shows: `Sending alerts to 1 subscribers...` and `✓ Alert sent to test@example.com`

### Scenario 2: Test System Control

**Test ON:**
```
Website: Click "ON" button
→ Backend sends POST /api/control with command: "ON"
→ ESP32 receives via MQTT and executes
→ Relay turns ON
→ Green LED turns ON
→ Buzzer turns OFF
→ Vent closes (servo to 0°)
```

**Test OFF:**
```
Website: Click "OFF" button
→ Backend sends POST /api/control with command: "OFF"
→ ESP32 receives via MQTT and executes
→ Relay turns OFF
→ Red LED turns ON
→ Buzzer turns OFF
→ Vent opens fully (servo to 180°)
```

**Test TEST:**
```
Website: Click "TEST" button
→ Backend sends POST /api/control with command: "TEST"
→ ESP32 receives via MQTT and executes test sequence:
  - All components activate (2 seconds)
  - All components return to safe state
  - Green LED ON
```

### Scenario 3: Test Subscribe/Unsubscribe

**Subscribe:**
```
1. Website form: Enter email
2. Click "Subscribe"
3. Backend adds to subscribers.json
4. Welcome email sent
5. User added to alert list
```

**Unsubscribe:**
```
1. Website: Click "Unsubscribe"
2. Backend removes from subscribers.json
3. No more alerts sent to that email
```

---

## 🔧 Configuration

**Backend Environment:** `d:\In-Fire\backend\.env`

```
# MQTT Configuration
MQTT_HOST=d9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud
MQTT_PORT=8883
MQTT_USER=LPG_Detection
MQTT_PASSWORD=Fire@101
MQTT_CLIENT_ID=backend-node-server

# Email Configuration (Gmail)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

ALERT_FROM_EMAIL=noreply@gasdetection.com
```

**ESP32 Configuration:** `ESP32_main.py` (top of file)

```python
# WiFi Networks
WIFI_NETWORKS = [
    {"ssid": "IIC_WIFI", "password": "!tah@rIntl2025"},
    {"ssid": "oh-ho!", "password": "Dangals.LM10"}
]

# MQTT Broker
MQTT_HOST = "d9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud"
MQTT_USER = "LPG_Detection"
MQTT_PASS = "Fire@101"

# Threshold
THRESHOLD = 1200
```

---

## 📊 Data Flow Summary

```
1. ESP32 reads gas sensor every 2 seconds
   ↓
2. Publishes value to MQTT topic: LPG/gas/value
   ↓
3. Backend receives and stores in memory
   ↓
4. If value > 1200:
   - Marks status as "GAS_DETECTED"
   - Reads subscribers.json
   - Sends email alert to EACH subscriber
   - Logs alert with subscriber count
   ↓
5. Frontend polls backend every 2 seconds for latest reading
   ↓
6. Dashboard displays:
   - Current gas value
   - Status (NORMAL or GAS_DETECTED)
   - Color indicator (GREEN or RED)
```

---

## 🎯 Key Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Gas Detection | ✅ Threshold: 1200 | ESP32 + Backend |
| Real-time Alerts | ✅ Email to subscribers | Backend emailService |
| Website Control | ✅ ON/OFF/TEST | Frontend + MQTT |
| Subscribe/Unsubscribe | ✅ Full functionality | Backend routes |
| Sensor Monitoring | ✅ Every 2 seconds | ESP32 main loop |
| Safety Controls | ✅ Relay + Vent + Buzzer | ESP32 GPIO |
| Dashboard Display | ✅ Live updates | Frontend React |
| System Logging | ✅ Console output | Backend + ESP32 |

---

## ⚙️ Technical Details

### Threshold Logic
```python
# ESP32
if value > THRESHOLD (1200):
    ALERT_MODE()

# Backend
if (value > 1200) {
    alert_all_subscribers()
}
```

### Email Alert Content
When gas exceeds 1200, subscribers receive:

✓ Subject: `🚨 GAS LEAKAGE ALERT - IMMEDIATE ACTION REQUIRED`  
✓ Current gas value and threshold  
✓ Timestamp of detection  
✓ Safety instructions:
  - Evacuate area immediately
  - Turn off electrical equipment
  - Contact emergency services
  - Avoid open flames
✓ Link to dashboard for monitoring  

### Website Interface
The dashboard displays:
- **Gas Value** (live, updates every 2s)
- **Status Indicator** (NORMAL/GAS_DETECTED)
- **Color Indicator** (Green/Red)
- **Control Buttons** (ON / OFF / TEST)
- **Subscribe Form** (with email validation)
- **Alert Messages** (toast notifications)

---

## 🆘 Debug Mode

### Backend Console Output

**Normal Operation:**
```
Gas Value: 450
Gas Value: 480
Gas Value: 520
```

**Gas Detection:**
```
⚠️ GAS LEAKAGE DETECTED! Value: 1250 (Threshold: 1200)
Sending alerts to 2 subscribers...
✓ Alert sent to user1@example.com
✓ Alert sent to user2@example.com
```

**Subscribe Event:**
```
✓ Added subscriber: newuser@example.com
✓ Welcome email sent to newuser@example.com
```

**Unsubscribe Event:**
```
✓ Removed subscriber: olduser@example.com
```

---

## ✅ Pre-Deployment Checklist

- [ ] ESP32 code updated with threshold 1200
- [ ] Backend `.env` configured with credentials
- [ ] `npm install` completed in both folders
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MQTT connection successful
- [ ] WiFi connection successful
- [ ] Test subscriber added
- [ ] Gas detection triggers email
- [ ] Website controls work (ON/OFF/TEST)
- [ ] Unsubscribe functionality works
- [ ] All console logs appear correct

---

**System Version:** 1.0 Final  
**Last Updated:** January 15, 2026  
**Status:** Production Ready 🚀
