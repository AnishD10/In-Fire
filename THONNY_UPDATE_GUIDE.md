# Thonny Update Guide - ESP32 Gas Detection System

## 📋 What's Updated

### ✅ Threshold Updated to 1200
- **Previous**: 870
- **New**: 1200
- Gas leakage detection now triggers at 1200 ADC value

### ✅ Live Alert Messages to Subscribers
- When gas exceeds 1200, **all subscribed members receive email alerts immediately**
- Backend checks subscribers and sends email with:
  - Current gas value
  - Timestamp
  - Safety instructions
  - Link to dashboard

### ✅ Website Control Functionality
- **ON**: Turns system ON, opens relay, green LED, closes vent
- **OFF**: Turns system OFF, cuts gas supply, red LED, opens vent
- **TEST**: Runs full system test on all components

### ✅ Unsubscribe Functionality
- **DELETE** endpoint available: `DELETE /api/subscribe/:email`
- Subscribers can unsubscribe from the website

---

## 🔧 How to Update ESP32 in Thonny

### Step 1: Open Thonny IDE
1. Launch **Thonny** on your computer
2. Connect ESP32 via USB cable

### Step 2: Copy the Updated Code

**Copy the entire code below into a new file in Thonny:**

```python
"""
IoT Gas Leakage Detection System - ESP32 MicroPython Code
Compatible with HiveMQ Cloud MQTT Broker
Threshold: 1200 | Control: ON/OFF/TEST
Author: Academic Project
Updated: January 2026
"""

from machine import Pin, ADC, PWM
import network
import time
from umqtt.simple import MQTTClient

# ==================================================
# WiFi Configuration (Multiple Networks)
# ==================================================
WIFI_NETWORKS = [
    {"ssid": "IIC_WIFI", "password": "!tah@rIntl2025"},
    {"ssid": "oh-ho!", "password": "Dangals.LM10"}
]

# ==================================================
# HiveMQ Cloud Configuration (SSL/TLS)
# ==================================================
MQTT_HOST = "d9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USER = "LPG_Detection"
MQTT_PASS = "Fire@101"
MQTT_CLIENT_ID = "d9224a87ae11416ebdfea8fc7ef45621"
MQTT_TOPIC_GAS = b"LPG/gas/value"
MQTT_TOPIC_STATUS = b"LPG/gas/status"
MQTT_TOPIC_CONTROL = b"LPG/system/control"

# ==================================================
# MQ-2 Gas Sensor
# ==================================================
gas = ADC(Pin(34))
gas.atten(ADC.ATTN_11DB)
THRESHOLD = 1200

# ==================================================
# Actuators (GPIO Configuration)
# ==================================================
green = Pin(25, Pin.OUT)      # Green LED (normal state)
red = Pin(26, Pin.OUT)         # Red LED (alert state)
buzzer = Pin(27, Pin.OUT)      # Buzzer (alarm)
relay = Pin(33, Pin.OUT)       # Relay (gas valve control)
servo = PWM(Pin(14), freq=50)  # Servo motor (vent control)

# ==================================================
# Servo Control Function
# ==================================================
def set_angle(angle):
    """
    Control servo angle (0-180 degrees)
    0° = Vent closed
    90° = Vent open
    180° = Fully open
    """
    duty = int((angle / 180) * 75 + 40)
    servo.duty(duty)

# ==================================================
# WiFi Connection (Try Multiple Networks)
# ==================================================
def connect_wifi():
    """
    Connect to WiFi with fallback to multiple networks
    Returns: True if connected, False otherwise
    """
    wifi = network.WLAN(network.STA_IF)
    wifi.active(True)
    
    for net in WIFI_NETWORKS:
        print(f"Trying: {net['ssid']}...")
        wifi.connect(net['ssid'], net['password'])
        
        # Wait up to 10 seconds
        for attempt in range(20):
            if wifi.isconnected():
                print(f"✓ Connected to {net['ssid']}!")
                print(f"IP: {wifi.ifconfig()[0]}")
                return True
            time.sleep(0.5)
        
        # Failed, try next network
        wifi.disconnect()
    
    print("✗ Failed to connect to any WiFi network")
    return False

# ==================================================
# MQTT Callback Handler
# ==================================================
def mqtt_callback(topic, msg):
    """
    Handle incoming MQTT messages
    Expects control commands: ON, OFF, TEST
    """
    command = msg.decode()
    print(f"[MQTT] Received: {topic.decode()} = {command}")
    
    if topic == MQTT_TOPIC_CONTROL:
        if command == "ON":
            print("🟢 System turned ON")
            relay.on()
            green.on()
            red.off()
            buzzer.off()
            set_angle(0)
            
        elif command == "OFF":
            print("🔴 System turned OFF")
            relay.off()
            green.off()
            red.on()
            buzzer.off()
            set_angle(180)
            
        elif command == "TEST":
            print("🧪 Running system test...")
            # Test all components
            relay.on()
            red.on()
            buzzer.on()
            set_angle(90)
            time.sleep(2)
            
            # Return to safe state
            relay.on()
            red.off()
            green.on()
            buzzer.off()
            set_angle(0)
            print("✓ Test complete")

# ==================================================
# MQTT Connection with SSL/TLS
# ==================================================
def connect_mqtt():
    """
    Connect to HiveMQ Cloud MQTT broker
    Uses TLS/SSL on port 8883
    """
    ssl_params = {"server_hostname": MQTT_HOST}
    
    client = MQTTClient(
        client_id=MQTT_CLIENT_ID,
        server=MQTT_HOST,
        port=MQTT_PORT,
        user=MQTT_USER,
        password=MQTT_PASS,
        ssl=True,
        ssl_params=ssl_params
    )
    
    client.set_callback(mqtt_callback)
    
    print("Connecting to HiveMQ Cloud...")
    try:
        client.connect()
        print("✓ Connected to HiveMQ Cloud via TLS!")
        
        # Subscribe to control topic
        client.subscribe(MQTT_TOPIC_CONTROL)
        print("✓ Subscribed to control topic")
        
        return client
    except Exception as e:
        print(f"✗ MQTT Connection Failed: {e}")
        return None

# ==================================================
# System Initialization
# ==================================================
print("\n" + "="*50)
print("IoT Gas Leakage Detection System")
print("Threshold: 1200 | Updated: Jan 2026")
print("="*50)

# Connect WiFi
if not connect_wifi():
    raise Exception("WiFi connection failed")

# Connect MQTT
mqtt_client = connect_mqtt()
if not mqtt_client:
    raise Exception("MQTT connection failed")

# Initial state
set_angle(0)  # Vent closed
relay.on()    # System ON
green.on()    # Green LED
red.off()     # Red LED off
buzzer.off()  # Buzzer off

print("✓ System initialized and ready")
print("="*50 + "\n")

# ==================================================
# Main Loop - Continuous Monitoring
# ==================================================
while True:
    try:
        # Process MQTT messages
        mqtt_client.check_msg()
        
        # Read gas sensor
        value = gas.read()
        print(f"Gas Value: {value}")
        
        # Publish gas reading
        mqtt_client.publish(MQTT_TOPIC_GAS, bytes(str(value), "utf-8"))
        
        # Check if gas leakage (Threshold: 1200)
        if value > THRESHOLD:
            print("⚠️ GAS LEAKAGE DETECTED! Value: {} (Threshold: {})".format(value, THRESHOLD))
            
            # Alert mode
            red.on()
            green.off()
            buzzer.on()
            relay.off()           # Cut gas supply
            set_angle(90)         # Open vent
            
            # Publish alert status with value
            alert_msg = "GAS_DETECTED - Value: {} - EMERGENCY".format(value)
            mqtt_client.publish(MQTT_TOPIC_STATUS, bytes(alert_msg, 'utf-8'))
            
            # Backend will automatically send emails to all subscribers!
            # Stay in alert for 10 seconds
            time.sleep(10)
            
        else:
            # Normal mode
            print("✅ Gas Level Normal")
            
            red.off()
            green.on()
            buzzer.off()
            relay.on()
            set_angle(0)
            
            # Publish status
            mqtt_client.publish(MQTT_TOPIC_STATUS, b"NORMAL")
        
        # Wait before next reading
        time.sleep(2)
        
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(2)
```

### Step 3: Save & Upload to ESP32
1. **File → Save As** → Name it `main.py`
2. **Select "Raspberry Pi Pico"** from device dropdown
3. Click **"Save"** (it will save to ESP32 automatically)
4. The script will **auto-run on ESP32 startup**

### Step 4: Verify Upload
- Check the Shell window in Thonny for:
  ```
  ✓ Connected to WiFi!
  ✓ Connected to HiveMQ Cloud via TLS!
  ✓ Subscribed to control topic
  ✓ System initialized and ready
  Gas Value: xxx
  ```

---

## 📊 System Data Flow

```
┌─────────────┐
│   ESP32     │ Reads MQ-2 sensor (ADC value)
└──────┬──────┘
       │ MQTT Publish: LPG/gas/value (every 2 sec)
       ↓
┌─────────────────────┐
│  HiveMQ Cloud       │ (Cloud MQTT Broker)
└──────┬──────────────┘
       │
       ├─ Subscribe to: LPG/gas/value ─→ Backend receives reading
       │
       └─ Subscribe to: LPG/system/control ← Backend sends commands
          (ON/OFF/TEST)
       
┌──────────────────────────────────────┐
│         Backend (Node.js)            │
│  - Receives gas reading (every 2s)   │
│  - If value > 1200:                  │
│    - Gets all subscribers from DB     │
│    - Sends email alert to each       │
│    - Logs alert to console           │
└──────────────────────────────────────┘
       ↓ REST API
┌──────────────────────────────────────┐
│     Frontend (React/Vite)            │
│  - Displays live gas reading         │
│  - Shows status (NORMAL/GAS_DETECTED)│
│  - Control buttons (ON/OFF/TEST)     │
│  - Subscribe/Unsubscribe form        │
└──────────────────────────────────────┘
```

---

## 🎮 Website Control Commands

### Control the System from Website:

| Command | Effect |
|---------|--------|
| **ON** | ✅ Relay ON, Green LED, Close vent, Enable gas flow |
| **OFF** | 🔴 Relay OFF, Red LED, Open vent, Block gas |
| **TEST** | 🧪 Test all components (2 sec), then return to safe state |

### How It Works:
1. Website sends **POST /api/control** with command
2. Backend publishes to **LPG/system/control** MQTT topic
3. ESP32 receives command via **mqtt_callback()**
4. ESP32 executes command (controls relay, LEDs, buzzer, servo)

---

## 📧 Email Alert System

### When Gas Exceeds 1200:

1. **ESP32 detects** gas value > 1200
2. **ESP32 publishes** `GAS_DETECTED - Value: xxxx - EMERGENCY`
3. **Backend receives** the alert
4. **Backend gets** all subscribed emails from `subscribers.json`
5. **Backend sends** email to each subscriber with:
   - 🚨 GAS LEAKAGE ALERT (Subject)
   - Current gas value and threshold
   - Safety instructions
   - Link to dashboard
   - Timestamp

### Alert Email Contains:
```
To: subscriber@email.com
Subject: 🚨 GAS LEAKAGE ALERT - IMMEDIATE ACTION REQUIRED

Body:
⚠️ GAS LEAKAGE DETECTED!
Current Value: 1450 (Threshold: 1200)

Safety Instructions:
✓ Evacuate the area immediately
✓ Turn off all electrical equipment  
✓ Contact emergency services
✓ Do not use open flames or create sparks

[View System Dashboard] button
```

---

## 🔐 Unsubscribe Functionality

### For Users:
1. Click **"Unsubscribe"** button on website
2. Sends: **DELETE /api/subscribe/email@example.com**
3. User is removed from `subscribers.json`
4. No more alerts sent to that email

### For Admins (Manual):
```javascript
// DELETE request
DELETE http://localhost:5000/api/subscribe/user@email.com
Response: {"success": true, "message": "Unsubscribed"}
```

---

## 🧪 Testing the System

### Test 1: Check Gas Reading
```
Expected: Gas values printed every 2 seconds
Example output:
Gas Value: 450
Gas Value: 480
Gas Value: 520
```

### Test 2: Simulate Gas Detection
- Bring something that might trigger the sensor (smoke, etc.)
- Look for:
  ```
  ⚠️ GAS LEAKAGE DETECTED! Value: 1250 (Threshold: 1200)
  Red LED turns ON
  Buzzer sounds
  Relay turns OFF (cuts gas)
  Vent opens (servo to 90°)
  Email sent to all subscribers
  ```

### Test 3: Control from Website
- **ON button**: Relay ON, Green LED ON, Buzzer OFF
- **OFF button**: Relay OFF, Red LED ON, Buzzer OFF
- **TEST button**: All components test for 2 seconds

### Test 4: Email Subscription
- Visit website: http://localhost:5173
- Subscribe with test email
- Trigger gas detection
- Check email inbox for alert

---

## 📝 Configuration Summary

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Threshold** | 1200 | Gas detection trigger point |
| **Read Interval** | 2 seconds | How often ESP32 reads sensor |
| **Alert Hold Time** | 10 seconds | Duration of alert state |
| **Subscriber Alerts** | Email | Sent to all subscribed members |
| **Control Commands** | ON/OFF/TEST | Via website dashboard |
| **WiFi Networks** | 2 (fallback) | Auto-switches if primary fails |
| **MQTT Protocol** | TLS/SSL | Port 8883 (secure) |

---

## 🆘 Troubleshooting

### Issue: "WiFi Connection Failed"
**Solution**: 
- Check WiFi SSID and password
- Restart ESP32
- Try connecting to another network

### Issue: "MQTT Connection Failed"
**Solution**:
- Verify WiFi is connected
- Check HiveMQ credentials
- Ensure internet is available

### Issue: "No emails being sent when gas detected"
**Solution**:
- Check backend is running: `npm start` in backend folder
- Verify `.env` file has Gmail credentials
- Check subscriber emails exist in `subscribers.json`
- View backend console for error messages

### Issue: "Website can't control ESP32"
**Solution**:
- Ensure backend and ESP32 are connected to MQTT
- Check if control command reaches backend logs
- Verify MQTT topic names match

---

## 📚 File Locations

| File | Location | Purpose |
|------|----------|---------|
| ESP32 Code | `d:\In-Fire\ESP32_main.py` | Updated with threshold 1200 |
| Backend MQTT | `d:\In-Fire\backend\mqtt\mqttClient.js` | Updated with alert logic |
| Subscribers DB | `d:\In-Fire\backend\data\subscribers.json` | Email list |
| Website | `d:\In-Fire\frontend\` | React dashboard |

---

## ✅ Checklist Before Production

- [ ] Update ESP32 code in Thonny with threshold 1200
- [ ] Backend running: `npm start` in backend folder
- [ ] Frontend running: `npm run dev` in frontend folder
- [ ] Configured `.env` with MQTT and Gmail credentials
- [ ] Tested gas detection (value > 1200)
- [ ] Tested email alerts to subscribers
- [ ] Tested website controls (ON/OFF/TEST)
- [ ] Tested unsubscribe functionality
- [ ] Verified WiFi connection works
- [ ] Verified MQTT connection works

---

**System Ready for Production! 🎉**
