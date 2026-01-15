# 🔧 Complete Troubleshooting & Reference Guide

## GPIO Pin Configuration Reference

```python
# ESP32 GPIO Pinout
GPIO_RELAY = 33      # Relay module (controls gas valve) - HIGH = OFF, LOW = ON
GPIO_SERVO = 14      # Servo motor PWM (vent control) - 0-180 degrees
GPIO_SENSOR = 34     # MQ-2 Gas Sensor ADC input (0-4095 range)
GPIO_BUZZER = 27     # Buzzer alarm (ON/OFF)
GPIO_LED_GREEN = 25  # Green LED (status indicator)
GPIO_LED_RED = 26    # Red LED (alert indicator)

# ADC Value Ranges
NORMAL_GAS = 300-500      # No gas detected, safe
APPROACHING = 900-1199    # Rising but safe
ALERT = 1200+             # GAS DETECTED - ALERT!

# Servo Positions
SERVO_0 = 0          # Fully closed (normal operation)
SERVO_90 = 90        # Mid-open (emergency vent)
SERVO_180 = 180      # Fully open (maximum ventilation)
```

---

## GPIO Pin Mapping Diagram

```
        ┌─────────────────────────────────────────────────┐
        │              ESP32 DEVKIT V1                    │
        │                                                 │
        │  USB  ┌──────────────────────────────────────┐ │
        │    ●──┤ GND    3V3    EN    GPIO36  GPIO39  ├─┤
        │       │                                      │  │
        │       │ GPIO35  GPIO34 (ADC-SENSOR)         │  │
        │       │                                      │  │
        │       │ GPIO33(RELAY) GPIO32                │  │
        │       │                                      │  │
        │       │ GPIO27(BUZZER) GPIO26(RED-LED)      │  │
        │       │                                      │  │
        │       │ GPIO25(GREEN-LED) GPIO14(SERVO)     │  │
        │       │                                      │  │
        │       │ GND    GPIO13  GPIO12  GPIO15  GND  │  │
        │       └──────────────────────────────────────┘  │
        │  5V ──┐     External Power (VIN pin)          │
        │  GND ──┘                                       │
        └─────────────────────────────────────────────────┘
```

---

## Hardware Component Wiring Guide

### 1. **Relay Module (GPIO 33)**
```
Relay Module:
  ┌─────────────┐
  │  + (VCC)    ├─→ 5V Power
  │  - (GND)    ├─→ GND
  │  S (Signal) ├─→ GPIO 33
  │  COM        ├─→ Gas valve common
  │  NO         ├─→ Gas valve normally open
  │  NC         ├─→ Gas valve normally closed
  └─────────────┘

Control Logic:
  GPIO 33 = LOW  → Relay ON  → Gas valve OPEN (safe)
  GPIO 33 = HIGH → Relay OFF → Gas valve CLOSED (alert)
```

### 2. **Servo Motor (GPIO 14)**
```
Servo Motor (SG90 typical):
  ┌─────────────┐
  │  Red (VCC)  ├─→ 5V Power
  │  Brown(GND) ├─→ GND
  │  Orange(PWM)├─→ GPIO 14
  └─────────────┘

Position Mapping (50Hz PWM):
  Pulse Width     Angle
  1.0 ms   →      0°    (fully closed)
  1.5 ms   →      90°   (mid open)
  2.0 ms   →      180°  (fully open)

MicroPython PWM:
  servo = PWM(Pin(14), freq=50)  # 50Hz frequency
  servo.duty(38)    # 0°   (min: ~25)
  servo.duty(77)    # 90°  (mid: ~77)
  servo.duty(102)   # 180° (max: ~102)
```

### 3. **MQ-2 Gas Sensor (GPIO 34 ADC)**
```
MQ-2 Sensor:
  ┌─────────────┐
  │  VCC (+5V)  ├─→ 5V Power
  │  GND        ├─→ GND
  │  D0 (Digital)├─→ (Not used, threshold is in code)
  │  A0 (Analog)├─→ GPIO 34 (ADC Input)
  └─────────────┘

ADC Reading Range:
  0-4095 (12-bit ADC)
  0    = No voltage (no gas)
  2048 = 2.5V (middle)
  4095 = 3.3V (max)

Sensor Warm-up:
  First 30 seconds: High readings (warm-up phase)
  After 30s: Stable readings

Calibration in Fresh Air:
  Normal reading in open air: 300-500 ADC
  (Don't worry if varies by 100, sensor naturally has drift)
```

### 4. **Buzzer (GPIO 27)**
```
Buzzer (Active or Passive):
  ┌──────────┐
  │  + (VCC) ├─→ 5V Power (or GPIO 27 if active)
  │  - (GND) ├─→ GND
  └──────────┘

Active Buzzer (with built-in oscillator):
  GPIO 27 = HIGH  → Buzzer ON (beeps)
  GPIO 27 = LOW   → Buzzer OFF (silent)

Passive Buzzer (requires frequency):
  GPIO 27 = PWM   → Frequency controls pitch
  (Recommended: Use Active buzzer for simplicity)
```

### 5. **LEDs (GPIO 25 & 26)**
```
Green LED - GPIO 25 (Status):
  ┌────────────┐
  │  Long(+)   ├─→ 3.3V (or GPIO 25 HIGH)
  │  Short(-)  ├─→ Through 220Ω resistor → GND
  └────────────┘
  Status: Normal operation

Red LED - GPIO 26 (Alert):
  ┌────────────┐
  │  Long(+)   ├─→ 3.3V (or GPIO 26 HIGH)
  │  Short(-)  ├─→ Through 220Ω resistor → GND
  └────────────┘
  Status: Gas detected, alert mode

LED Logic:
  Normal Mode:  Green ON, Red OFF
  Alert Mode:   Green OFF, Red ON
```

### 6. **External Power Supply (VIN Pin)**
```
5V Power Supply:
  ┌──────────────┐
  │  + (5V)      ├─→ VIN Pin
  │  - (GND)     ├─→ GND Pin
  │  (USB case)  │
  └──────────────┘

Power Requirements:
  ESP32 alone:     500 mA
  + All hardware:  1000-1500 mA (1.5A)
  Recommended:     2A power supply for headroom

VIN vs USB Power:
  USB Power:  Good for development & testing
  VIN Power:  Required for production deployment
              (More stable, less prone to drops)
```

---

## Software Setup Reference

### 1. **MicroPython Code Structure**
```python
# Pin definitions (match wiring)
GPIO_RELAY = 33
GPIO_SERVO = 14
GPIO_SENSOR = 34
GPIO_BUZZER = 27
GPIO_LED_GREEN = 25
GPIO_LED_RED = 26

# Configuration (update these)
THRESHOLD = 1200        # ADC value for gas alert
HOLD_TIME = 10          # Seconds to hold alert
WIFI_SSID = "Your_WiFi_Name"
WIFI_PASSWORD = "Your_WiFi_Password"
MQTT_BROKER = "your_broker.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USER = "your_username"
MQTT_PASSWORD = "your_password"

# Hardware objects
relay = Pin(GPIO_RELAY, Pin.OUT)
servo = PWM(Pin(GPIO_SERVO), freq=50)
sensor = ADC(Pin(GPIO_SENSOR))
buzzer = Pin(GPIO_BUZZER, Pin.OUT)
led_green = Pin(GPIO_LED_GREEN, Pin.OUT)
led_red = Pin(GPIO_LED_RED, Pin.OUT)

# MQTT client
mqtt_client = MQTTClient(...)
mqtt_client.connect()
mqtt_client.subscribe(b"LPG/system/control")

# Main loop
while True:
    value = sensor.read()
    if value > THRESHOLD:
        alert_mode()  # Red LED, relay off, servo 90°, buzzer
    else:
        normal_mode()  # Green LED, relay on, servo 0°, no buzzer
```

### 2. **Backend Node.js Setup**
```javascript
// .env configuration
MQTT_BROKER=your_broker.hivemq.cloud
MQTT_PORT=8883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
THRESHOLD=1200

// Backend listens to:
MQTT Topic: LPG/gas/value
  → Incoming gas sensor readings
  → Publishes to frontend via WebSocket

MQTT Topic: LPG/system/control
  → Backend sends control commands
  → ESP32 receives and executes

// Backend services:
1. MQTT Client: Receives sensor data, sends alerts
2. Email Service: Sends alert emails to subscribers
3. Alert Service: Processes alert logic
4. REST API: /api/subscribe, /api/control, etc.
```

### 3. **Frontend React Setup**
```javascript
// App.jsx listens to:
WebSocket: localhost:5000/socket.io
  → Receives gas readings
  → Receives alert status

// Controls available:
GET /api/dashboard     → Current gas value, status
POST /api/control/on   → Enable gas (relay ON)
POST /api/control/off  → Disable gas (relay OFF)
POST /api/control/test → Send test alert
POST /api/subscribe    → Register email
DELETE /api/subscribe  → Unregister email
GET /api/subscribers   → List all subscribers

// Dashboard displays:
- Real-time gas reading (0-4095 ADC)
- Current status (NORMAL / ALERT / RECOVERY)
- Control buttons (ON / OFF / TEST)
- Subscriber list
- Alert history
```

---

## Threshold Calculation Guide

### Current Setting: 1200 ADC

```
MQ-2 Sensor Response:

ADC Range: 0 ────────┬────────┬─────────────► 4095
           0V        │        │              3.3V
                     │        │
          300-500    │ 1200   │ 2000+
          Normal     │ Alert  │ Danger
          (Safe)     │ Point  │ (High gas)

Decision Logic:
  IF gas_value < 1200:
    → Normal mode: Green LED, relay ON, servo 0°, no alarm
  ELSE (gas_value >= 1200):
    → Alert mode: Red LED, relay OFF, servo 90°, buzzer ON
    → Email sent to all subscribers
    → Wait 10 seconds for recovery option
```

### Adjusting Threshold (If Needed)

```
Too Sensitive (false alarms)?
  Current: THRESHOLD = 1200
  Try: THRESHOLD = 1500 (higher value = less sensitive)
  Edit: Line 37 in ESP32_main.py

Too Insensitive (missing gas)?
  Current: THRESHOLD = 1200
  Try: THRESHOLD = 900 (lower value = more sensitive)
  Edit: Line 37 in ESP32_main.py

After changing:
  1. Save file in Thonny
  2. Restart ESP32 (Ctrl+D or power off/on)
  3. Re-run tests
```

---

## WiFi Connectivity Troubleshooting

### Test 1: Basic WiFi Connection
```python
import network

# Scan available networks
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
print(wlan.scan())  # See list of networks

# Try to connect
wlan.connect('YourSSID', 'YourPassword')
while not wlan.isconnected():
    print('Connecting...')
    time.sleep(1)
print('Connected! IP:', wlan.ifconfig())
```

### Test 2: MQTT Connection
```python
from umqtt.simple import MQTTClient

broker = "your_broker.hivemq.cloud"
port = 8883
username = "your_username"
password = "your_password"
client_id = "esp32_client"

# Connect with SSL
client = MQTTClient(
    client_id, 
    broker, 
    port=port,
    user=username,
    password=password,
    ssl=True
)

try:
    client.connect()
    print("MQTT Connected!")
except Exception as e:
    print(f"MQTT Failed: {e}")
```

### Issue Checklist
```
❌ WiFi won't connect?
  □ Check SSID spelling (case-sensitive)
  □ Check password correct
  □ Try moving closer to router
  □ Restart router
  □ Check ESP32 antenna position
  □ Try WiFi from phone to confirm signal strength

❌ Can connect to WiFi but MQTT fails?
  □ Check internet connectivity
  □ Verify MQTT broker hostname correct
  □ Verify MQTT port (8883 for TLS)
  □ Check username/password correct
  □ Verify SSL certificates installed
  □ Check firewall/NAT not blocking
  □ Try from different network if available

❌ MQTT connected but no messages received?
  □ Check MQTT topic subscriptions correct
  □ Verify publish topic matches
  □ Check message format (bytes not strings)
  □ Enable MQTT debugging in code
  □ Check backend is running
  □ Verify HiveMQ dashboard shows messages
```

---

## Email Alert Troubleshooting

### Test: Send Email from Backend
```bash
# SSH into your server or local machine
node

// In Node REPL:
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_app_password' // NOT regular password!
  }
});

transporter.sendMail({
  from: 'your_email@gmail.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  html: '<h1>Test email</h1>'
}, (err, info) => {
  if (err) console.log('Error:', err);
  else console.log('Sent:', info.response);
});
```

### Gmail App Password Setup (Required)
```
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with your Gmail account
3. Select "Mail" and "Windows Computer" (or your platform)
4. Click "Generate"
5. Copy the 16-character password
6. Paste in .env: GMAIL_PASS=xxxxxxxxxxxxxxxx
7. Use that password in transporter config (NOT your regular Gmail password)

Common Issues:
  ❌ Regular Gmail password → Use App Password instead
  ❌ 2FA not enabled → Enable 2FA first, then generate App Password
  ❌ Account not verified → Verify in Gmail settings
  ❌ Less secure apps → Not needed if using App Password
```

### Verify Subscriber Setup
```bash
# Check subscribers are registered
cat backend/data/subscribers.json

# Should look like:
{
  "subscribers": [
    "email1@example.com",
    "email2@example.com"
  ]
}

# If empty, POST to subscribe endpoint first:
curl -X POST http://localhost:5000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@example.com"}'
```

---

## Serial Monitor Output Interpretation

### Successful Boot Sequence
```
MicroPython 1.20.0 on 2023-10-17; ESP32 module with ESP32
Type "help()" for more information.
>>>
-- Initializing hardware...
   ✓ Relay (GPIO 33) ready
   ✓ Servo (GPIO 14) ready
   ✓ Sensor (GPIO 34) ready
   ✓ Buzzer (GPIO 27) ready
   ✓ LEDs ready
-- Connecting to WiFi: "YourSSID"...
   Connected! IP: 192.168.1.100
-- Connecting to MQTT broker...
   ✓ MQTT Connected!
-- System ready. Monitoring gas levels...
```

### Normal Operation
```
Gas Level: 350 ADC (Normal)
Gas Level: 380 ADC (Normal)
Gas Level: 425 ADC (Normal)
...
```

### Alert Triggered
```
⚠️  GAS ALERT TRIGGERED!
    Gas Value: 1250 ADC (> 1200 threshold)
    Status: GAS_DETECTED - Value: 1250 - EMERGENCY
    Actions:
      → Red LED ON
      → Relay OFF (gas closed)
      → Servo 90° (vent open)
      → Buzzer ON
    Alert email sent to subscribers
```

### Recovery
```
Gas Level: 950 ADC (Returning to normal)
Gas Level: 500 ADC (Safe)
Gas Level: 400 ADC (Normal)
-- Recovery complete. System stable.
```

### Common Error Messages
```
ERROR: Failed to connect to WiFi
  → Check SSID/password in code

ERROR: MQTT connection timeout
  → Check internet, broker address, firewall

ERROR: Sensor read failed
  → Check GPIO 34 connection

ERROR: Relay not responding
  → Check GPIO 33 connection, power supply

ERROR: Failed to send email
  → Check Gmail credentials, App Password
  → Check SMTP settings
  → Verify subscriber list not empty
```

---

## Performance Benchmarks

### Expected System Response Times

```
Component          Response Time
─────────────────────────────────
Sensor Reading:    20-30 ms
ADC Conversion:    100-200 ms
Alert Detection:   < 1 second
Relay Switching:   50-100 ms
Servo Movement:    200-300 ms (full range)
Buzzer Activation: Immediate
LED Indicators:    Immediate
MQTT Publish:      500-1000 ms
Email Delivery:    5-30 seconds (depending on SMTP)

Total Alert Time (from detection to email):
  Sensor value > 1200 → 1-2 seconds for full activation
  Email typically arrives within 10-20 seconds
```

### Hardware Power Consumption

```
Component               Current Draw
────────────────────────────────────
ESP32 (idle):          ~80 mA
MQ-2 Sensor:           ~150 mA
Relay (inactive):      ~0 mA
Relay (active):        ~100 mA
Servo (moving):        ~200-500 mA (peak)
Buzzer (ON):           ~50-100 mA
LEDs (both ON):        ~20 mA
WiFi (connected):      +50-100 mA
MQTT (idle):           included above

Total (running):       300-400 mA normal
Total (alert/servo):   700-1000 mA peak (1A)

Power Supply Recommendation: 2A @ 5V (10W)
```

---

## Backup & Recovery

### Backup Current Code
```bash
# In Thonny, save main.py
# In terminal, backup:
cp /path/to/ESP32_main.py ESP32_main_backup.py

# Keep timestamp:
mv ESP32_main.py "ESP32_main_$(date +%Y%m%d_%H%M%S).py"
```

### Restore Previous Version
```
1. Open Thonny
2. Open your backup file from File menu
3. Delete current main.py on ESP32
4. Copy backup content into new main.py
5. Save to ESP32
6. Restart ESP32
```

### Factory Reset ESP32
```python
# CAUTION: Deletes all files on ESP32
import os
for file in os.listdir('/'):
    if file != 'boot.py':
        os.remove('/' + file)
print("All files deleted. Restart ESP32.")

# Then reload main.py normally
```

---

## Getting Help

### Debug Mode (Add to code)
```python
DEBUG = True  # Set to True for verbose output

def log(msg):
    if DEBUG:
        print(f"[DEBUG] {msg}")

# Use throughout code:
log(f"Sensor reading: {sensor.read()}")
log(f"Relay state: {relay.value()}")
log(f"WiFi connected: {wlan.isconnected()}")
```

### Check System Status
```python
# ESP32 system info
import esp32
import machine

print(f"Chip ID: {esp32.chip_id()}")
print(f"MAC Address: {machine.unique_id()}")
print(f"Heap Free: {esp32.idf_heap_stats()}")
print(f"Temperature: {esp32.raw_temperature()}")
```

### Backend Debugging
```bash
# Enable debug mode
DEBUG=true npm start

# Check logs for errors
tail -f logs/app.log

# Test API endpoints
curl http://localhost:5000/api/dashboard
curl http://localhost:5000/api/subscribers

# Check MQTT in HiveMQ Cloud dashboard
# Visit: https://client.hivemq.cloud/
```

### Frontend Debugging
```javascript
// In browser console (F12):
console.log('Gas readings:', gasReadings);
console.log('Current status:', systemStatus);
console.log('MQTT messages:', mqttMessages);

// Check network tab for:
// - WebSocket connection to /socket.io
// - REST API calls to /api/*
```

---

## Version Reference

### Current System Version
```
System: IoT Gas Leakage Detection System v2.0
Release Date: 2024
Hardware: ESP32 DevKit V1
Firmware: MicroPython 1.20.0+

Components:
  - ESP32 main controller
  - MQ-2 gas sensor (ADC GPIO 34)
  - Relay module (GPIO 33)
  - Servo motor (GPIO 14 PWM)
  - Buzzer (GPIO 27)
  - Status LEDs (GPIO 25, 26)
  - External 5V power (VIN)

Configuration:
  - Threshold: 1200 ADC
  - Read interval: 2 seconds
  - Hold time: 10 seconds
  - Alert recipients: Configurable via subscribers.json

Backend:
  - Node.js + Express
  - MQTT client for ESP32 communication
  - Email alerts via Nodemailer
  - REST API for web control

Frontend:
  - React 18.2 + Vite
  - Real-time updates via Socket.io
  - Dashboard with controls
  - Subscription management
```

---

**Last Updated:** 2024
**Status:** Production Ready ✅
**Test Coverage:** 9 complete test cases (Test 10-18)
**Documentation:** Complete
