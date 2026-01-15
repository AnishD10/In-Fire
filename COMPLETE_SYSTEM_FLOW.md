# Complete System Flow & Integration Guide

## 🎯 System Overview

The IoT Gas Leakage Detection System is a **three-tier real-time monitoring and alert system**:

```
┌─────────────────────────────────────────────────────────────┐
│                     COMPLETE SYSTEM FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TIER 1: IoT DEVICE (ESP32)                         │   │
│  │  - MQ-2 Gas Sensor (ADC on GPIO 34)                │   │
│  │  - Reads every 2 seconds                            │   │
│  │  - Publishes gas value to MQTT                      │   │
│  │  - Subscribed to control commands                   │   │
│  │  - Activates: LEDs, Buzzer, Relay, Servo            │   │
│  │  - Threshold: 1200 (UPDATED)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↑                                    │
│                      MQTT CLOUD                              │
│                      (HiveMQ Cloud)                           │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TIER 2: BACKEND (Node.js + Express)               │   │
│  │  - Receives gas values from MQTT                    │   │
│  │  - Checks threshold (1200)                          │   │
│  │  - When exceeded:                                   │   │
│  │    • Reads subscribers database                     │   │
│  │    • Sends email to EACH subscriber (LIVE)          │   │
│  │  - Manages subscriptions (add/remove)               │   │
│  │  - Publishes control commands to ESP32              │   │
│  └──────────────────────────────────────────────────────┘   │
│                      REST API (port 5000)                    │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TIER 3: FRONTEND (React + Vite)                    │   │
│  │  - Polls backend every 2 seconds                    │   │
│  │  - Displays live gas reading                        │   │
│  │  - Shows status: NORMAL / GAS_DETECTED              │   │
│  │  - Color indicator: GREEN / RED                     │   │
│  │  - Control buttons: ON / OFF / TEST                 │   │
│  │  - Subscribe/Unsubscribe form                       │   │
│  │  - Toast alerts for events                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 SCENARIO 1: Normal Operation

```
TIME: 0s
┌─────────────────────────────────────────────────────────┐
│ ESP32 Loop Iteration #1                                 │
├─────────────────────────────────────────────────────────┤
│ 1. Read gas sensor               → ADC value = 450      │
│ 2. Publish to MQTT               → LPG/gas/value: "450" │
│ 3. Check threshold (450 > 1200)  → NO                   │
│ 4. Safe mode:                                            │
│    - Green LED: ON                                       │
│    - Red LED: OFF                                        │
│    - Buzzer: OFF                                         │
│    - Relay: ON (gas flowing)                            │
│    - Servo: 0° (vent closed)                            │
│ 5. Publish status                → LPG/gas/status: "NORMAL" │
│ 6. Wait 2 seconds                                        │
└─────────────────────────────────────────────────────────┘

CONCURRENT: Backend
┌─────────────────────────────────────────────────────────┐
│ 1. Receive MQTT: "450"                                   │
│ 2. Store in memory: gasReading.value = 450             │
│ 3. Is 450 > 1200? NO                                    │
│ 4. Status = "NORMAL"                                    │
│ 5. Don't send any emails                                │
│ 6. Wait for next message                                │
└─────────────────────────────────────────────────────────┘

CONCURRENT: Frontend
┌─────────────────────────────────────────────────────────┐
│ 1. Poll /api/gas/latest every 2 seconds                │
│ 2. Receive: value=450, status="NORMAL"                 │
│ 3. Display:                                              │
│    - Gas Level: 450 / 1200                             │
│    - Progress bar: 37.5% (GREEN)                       │
│    - Status: ✅ NORMAL                                  │
│ 4. Control buttons ready for user input                │
└─────────────────────────────────────────────────────────┘

TIME: 2s
[Same loop repeats, value might be 480 now]
```

---

## 🚨 SCENARIO 2: Gas Detection Alert

```
TIME: 0s - 10s (BEFORE DETECTION)
[Same as Scenario 1, gas values gradually increasing]
450 → 480 → 520 → 580 → 650 → 750 → 900 → 1000 → 1100 → 1150

TIME: 12s (DETECTION!)
┌─────────────────────────────────────────────────────────┐
│ ESP32 Loop Iteration #7                                 │
├─────────────────────────────────────────────────────────┤
│ 1. Read gas sensor               → ADC value = 1250     │
│ 2. Publish to MQTT               → LPG/gas/value: "1250"│
│ 3. Check threshold (1250 > 1200) → YES! ALERT!         │
│ 4. EMERGENCY MODE ACTIVATED:                             │
│    - Red LED: ON ✔️                                      │
│    - Green LED: OFF                                      │
│    - Buzzer: ON (BEEP BEEP BEEP) ✔️                      │
│    - Relay: OFF (CUTS GAS SUPPLY!) ✔️                    │
│    - Servo: 90° (OPENS VENT!) ✔️                         │
│ 5. Publish alert status:                                 │
│    → LPG/gas/status: "GAS_DETECTED - Value: 1250 - EMERGENCY" │
│ 6. Stay in alert mode for 10 seconds                    │
│ 7. Log: "⚠️ GAS LEAKAGE DETECTED! Value: 1250 (Threshold: 1200)" │
└─────────────────────────────────────────────────────────┘

CONCURRENT: Backend
┌─────────────────────────────────────────────────────────┐
│ 1. Receive MQTT: "1250"                                  │
│ 2. Store: gasReading.value = 1250                      │
│ 3. Is 1250 > 1200? YES!                                 │
│ 4. Status = "GAS_DETECTED"                              │
│ 5. LOG: "⚠️ GAS LEAKAGE DETECTED!"                      │
│ 6. CRITICAL: Get all subscribers from file:             │
│    └─ subscriber1: "user1@example.com"                  │
│    └─ subscriber2: "user2@example.com"                  │
│    └─ subscriber3: "user3@example.com"                  │
│                                                          │
│ 7. LOG: "Sending alerts to 3 subscribers..."            │
│                                                          │
│ 8. For each subscriber, SEND EMAIL:                     │
│    ├─ Email 1:                                          │
│    │  To: user1@example.com                             │
│    │  Subject: 🚨 GAS LEAKAGE ALERT - IMMEDIATE ACTION! │
│    │  Body: Gas Value: 1250 (Threshold: 1200)          │
│    │        Timestamp: 2026-01-15 10:30:45             │
│    │        Safety Instructions: [Evacuation guide]     │
│    │  LOG: "✓ Alert sent to user1@example.com"         │
│    │                                                     │
│    ├─ Email 2:                                          │
│    │  To: user2@example.com                             │
│    │  [Same email content]                              │
│    │  LOG: "✓ Alert sent to user2@example.com"         │
│    │                                                     │
│    └─ Email 3:                                          │
│       To: user3@example.com                             │
│       [Same email content]                              │
│       LOG: "✓ Alert sent to user3@example.com"         │
│                                                          │
│ 9. All subscribers have been notified (LIVE!)          │
│ 10. Wait for next MQTT message                          │
└─────────────────────────────────────────────────────────┘

CONCURRENT: Frontend
┌─────────────────────────────────────────────────────────┐
│ 1. Poll /api/gas/latest                                 │
│ 2. Receive: value=1250, status="GAS_DETECTED"          │
│ 3. Display changes:                                      │
│    - Gas Level: 1250 / 1200 (EXCEEDS!)                 │
│    - Progress bar: 104% (RED, over 100%)               │
│    - Status: ⚠️ GAS LEAKAGE DETECTED                   │
│    - Background: FLASHING RED                           │
│ 4. Show alert toast: "🚨 EMERGENCY: Gas leakage!"      │
│ 5. Control buttons still available for manual override  │
│ 6. Dashboard shows this is LIVE EMERGENCY                │
└─────────────────────────────────────────────────────────┘

TIME: 12s - 22s (ALERT PERIOD)
[ESP32 stays in emergency mode for 10 seconds]
[All hardware continues to protect: relay OFF, vent open, buzzer on]
[Subscribers have received their emails]

TIME: 22s (RECOVERY - if gas drops)
[ESP32 checks gas again]
[If value < 1200, return to normal mode]
[Publish "NORMAL" status]
[All hardware resets to safe state]
```

---

## 🎮 SCENARIO 3: Website Control - Turn System ON

```
USER ACTION
┌─────────────────────────────────────────────────────────┐
│ Website Dashboard (http://localhost:5173)               │
│ User clicks: [ON] button                                 │
└─────────────────────────────────────────────────────────┘

FRONTEND
┌─────────────────────────────────────────────────────────┐
│ 1. Handle click event                                    │
│ 2. Send POST request:                                    │
│    URL: http://localhost:5000/api/control               │
│    Body: { "command": "ON" }                            │
│ 3. Log: "Sending command: ON"                           │
│ 4. Show loading state on button                          │
│ 5. Wait for response                                     │
└─────────────────────────────────────────────────────────┘

BACKEND
┌─────────────────────────────────────────────────────────┐
│ 1. Receive POST /api/control                             │
│ 2. Extract command: "ON"                                │
│ 3. Validate command                                      │
│ 4. Publish to MQTT:                                      │
│    Topic: LPG/system/control                            │
│    Message: "ON"                                         │
│ 5. Log: "Published control command: ON"                 │
│ 6. Response: { success: true, command: "ON" }          │
│ 7. Send response to frontend                            │
└─────────────────────────────────────────────────────────┘

MQTT CLOUD
┌─────────────────────────────────────────────────────────┐
│ Topic: LPG/system/control                               │
│ Message: "ON"                                            │
│ [Waiting for ESP32 to receive]                           │
└─────────────────────────────────────────────────────────┘

ESP32 (MQTT Callback)
┌─────────────────────────────────────────────────────────┐
│ 1. mqtt_client.check_msg() detects new message          │
│ 2. Trigger: mqtt_callback(LPG/system/control, "ON")    │
│ 3. Log: "[MQTT] Received: LPG/system/control = ON"    │
│ 4. If command == "ON":                                  │
│    - Log: "🟢 System turned ON"                         │
│    - relay.on()          → Gas valve OPENS              │
│    - green.on()          → Green LED LIGHTS UP          │
│    - red.off()           → Red LED turns OFF             │
│    - buzzer.off()        → Buzzer SILENT                │
│    - set_angle(0)        → Vent CLOSES                  │
│ 5. System now ready to flow gas                         │
└─────────────────────────────────────────────────────────┘

FRONTEND (After response)
┌─────────────────────────────────────────────────────────┐
│ 1. Receive success response                              │
│ 2. Log: "System turned ON successfully"                 │
│ 3. Show success toast: "✅ System ON"                    │
│ 4. Update button appearance: disabled/greyed out         │
│ 5. Next poll cycle shows:                                │
│    - Green indicator                                     │
│    - Gas flowing (relay active)                          │
│ 6. User sees confirmation                                │
└─────────────────────────────────────────────────────────┘

RESULT: System is now operational
[Device is ready to supply gas]
[Sensors are monitoring continuously]
[Dashboard shows green status]
```

---

## ✉️ SCENARIO 4: User Subscribes to Alerts

```
USER ACTION
┌─────────────────────────────────────────────────────────┐
│ Website Dashboard                                        │
│ User enters email: "john@example.com"                   │
│ User clicks: [Subscribe] button                          │
└─────────────────────────────────────────────────────────┘

FRONTEND
┌─────────────────────────────────────────────────────────┐
│ 1. Validate email format                                 │
│ 2. If valid, send POST request:                         │
│    URL: http://localhost:5000/api/subscribe             │
│    Body: { "email": "john@example.com" }               │
│ 3. Show loading state                                    │
│ 4. Wait for response                                     │
└─────────────────────────────────────────────────────────┘

BACKEND
┌─────────────────────────────────────────────────────────┐
│ 1. Receive POST /api/subscribe                           │
│ 2. Extract email: "john@example.com"                    │
│ 3. Validate email format                                │
│ 4. Get all current subscribers (subscribers.json)        │
│ 5. Check if already subscribed → NO                      │
│ 6. Add new subscriber to database:                       │
│    {                                                      │
│      "email": "john@example.com",                        │
│      "subscribedAt": "2026-01-15T10:30:00.000Z"        │
│    }                                                      │
│ 7. Log: "✓ Added subscriber: john@example.com"         │
│ 8. Send welcome email:                                  │
│    To: john@example.com                                 │
│    Subject: ✓ Welcome to Gas Detection System           │
│    Body: [Welcome message, alert explanation]           │
│ 9. Log: "✓ Welcome email sent to john@example.com"    │
│ 10. Response: { success: true }                         │
└─────────────────────────────────────────────────────────┘

DATABASE UPDATE
┌─────────────────────────────────────────────────────────┐
│ File: subscribers.json (UPDATED)                         │
│ [                                                         │
│   { "email": "user1@example.com", "subscribedAt": "..." },│
│   { "email": "john@example.com", "subscribedAt": "2026..." │
│ ]                                                         │
│ NEW ENTRY: john@example.com                             │
└─────────────────────────────────────────────────────────┘

FRONTEND
┌─────────────────────────────────────────────────────────┐
│ 1. Receive success response                              │
│ 2. Show toast: "✅ You're subscribed!"                   │
│ 3. Clear email input field                               │
│ 4. Update button state                                   │
│ 5. Show message: "You will receive alerts when gas is detected" │
└─────────────────────────────────────────────────────────┘

RESULT: john@example.com is now in the system
[From now on, any gas detection will alert him]
[Welcome email confirms subscription]
[Database tracks subscription timestamp]

FUTURE SCENARIO: Gas is detected
┌─────────────────────────────────────────────────────────┐
│ When gas > 1200:                                         │
│ Backend reads subscribers.json                           │
│ Finds: john@example.com                                 │
│ Sends: Alert email to john@example.com                  │
│ John receives: 🚨 GAS LEAKAGE ALERT email              │
│ John can now take action from anywhere                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📧 Email Alert Content (When gas > 1200)

```
FROM: noreply@gasdetection.com
TO: john@example.com
SUBJECT: 🚨 GAS LEAKAGE ALERT - IMMEDIATE ACTION REQUIRED
DATE: 2026-01-15 10:30:45

═══════════════════════════════════════════════════════════════

             ⚠️ GAS LEAKAGE DETECTED!

═══════════════════════════════════════════════════════════════

DETAILS:
────────
Current Gas Value: 1250 ADC Units
Threshold: 1200 ADC Units
Detection Time: 2026-01-15 10:30:45
Status: EMERGENCY

IMMEDIATE ACTIONS REQUIRED:
──────────────────────────
❌ EVACUATE the area immediately
❌ Turn off ALL electrical equipment
❌ Contact emergency services (Call 911 or local number)
❌ Do NOT use open flames or create sparks
❌ Do NOT re-enter until area is clear

WHAT IS HAPPENING:
──────────────────
✓ Gas supply has been automatically CUT OFF
✓ Ventilation has been AUTOMATICALLY OPENED
✓ Alarm system is ACTIVE
✓ System is in EMERGENCY MODE

YOU RECEIVED THIS BECAUSE:
─────────────────────────
You are subscribed to receive real-time gas leakage alerts.
This is an automated alert from the IoT Gas Detection System.

VIEW DASHBOARD:
───────────────
[Click here to access the system dashboard]
http://localhost:5173

QUESTIONS?
──────────
For support, contact your system administrator.

═══════════════════════════════════════════════════════════════
This is an automated alert. Do not reply to this email.
IoT Gas Leakage Detection System
```

---

## 🔄 Complete Data Flow Diagram

```
TIMELINE:

0s ────────────────────────────────────────────────────────────

   ESP32 LOOP:
   └─ Read sensor: 450
   └─ Check: 450 > 1200? NO
   └─ Publish: LPG/gas/value = "450"
   └─ Status: "NORMAL"

   BACKEND:
   └─ Receive: 450
   └─ Store: gasReading.value = 450
   └─ No alert needed

   FRONTEND:
   └─ Poll: /api/gas/latest
   └─ Receive: 450, "NORMAL"
   └─ Display: Green, Gas: 450

   [Cycle repeats every 2 seconds...]

10s ────────────────────────────────────────────────────────────

   Gas values increasing...
   500 → 600 → 700 → 800 → 900 → 1000 → 1100 → 1150

12s ────────────────────────────────────────────────────────────

   ⚠️ THRESHOLD CROSSED! Value: 1250 > 1200

   ESP32:
   ├─ Red LED: ON
   ├─ Buzzer: ON
   ├─ Relay: OFF (cuts gas)
   ├─ Servo: 90° (opens vent)
   └─ Publish: "GAS_DETECTED - Value: 1250 - EMERGENCY"

   BACKEND:
   ├─ Receive: 1250
   ├─ Detect: 1250 > 1200
   ├─ Read: subscribers.json
   ├─ Found: 3 subscribers
   ├─ Send email #1 to subscriber1@email.com
   ├─ Send email #2 to subscriber2@email.com
   ├─ Send email #3 to subscriber3@email.com
   └─ Log: "✓ Alerts sent to 3 subscribers"

   FRONTEND:
   ├─ Receive: 1250, "GAS_DETECTED"
   ├─ Display: RED indicator
   ├─ Show: ⚠️ GAS LEAKAGE DETECTED
   └─ Toast: Emergency alert

   EMAIL BOXES:
   ├─ subscriber1: 📬 New: GAS LEAKAGE ALERT
   ├─ subscriber2: 📬 New: GAS LEAKAGE ALERT
   └─ subscriber3: 📬 New: GAS LEAKAGE ALERT

22s ────────────────────────────────────────────────────────────

   [Alert period over - system checks gas again]
   Gas value has dropped below 1200 → NORMAL

   ESP32:
   ├─ Red LED: OFF
   ├─ Green LED: ON
   ├─ Buzzer: OFF
   ├─ Relay: ON (re-enables gas)
   ├─ Servo: 0° (closes vent)
   └─ Publish: "NORMAL"

   BACKEND:
   ├─ Status changes to: NORMAL
   └─ No more alerts sent

   FRONTEND:
   ├─ Display returns to GREEN
   └─ Status: ✅ NORMAL
```

---

## 🎓 System Advantages

| Feature | Benefit |
|---------|---------|
| **Real-time Alerts** | Subscribers notified instantly when danger detected |
| **Automatic Safety** | Cuts gas and opens vent without human intervention |
| **Remote Control** | Can turn ON/OFF/TEST system from anywhere |
| **Email Notifications** | Alerts sent to email for permanent record |
| **Multi-subscriber** | Entire team gets alerts simultaneously |
| **Web Dashboard** | Real-time status visible online anytime |
| **Logging** | All events timestamped and logged |
| **Scalable** | Can add unlimited subscribers |
| **Reliable** | MQTT with cloud broker (HiveMQ) |
| **Secure** | TLS/SSL encrypted communication |

---

## 📱 Mobile-Friendly

Subscribers receive email alerts on their phone/email app:
- Can see alert **immediately**
- Contains all critical information
- Can access dashboard via link
- Works offline (email is delivered)

---

## ✅ System Complete

All features working:
- ✅ Gas detection (threshold: 1200)
- ✅ Real-time email alerts to subscribers
- ✅ Website control (ON/OFF/TEST)
- ✅ Subscribe/Unsubscribe management
- ✅ Safety mechanisms (relay, vent, buzzer, LED)
- ✅ Live dashboard
- ✅ Cloud connectivity
- ✅ Logging and monitoring

**Ready for Production Deployment! 🚀**
