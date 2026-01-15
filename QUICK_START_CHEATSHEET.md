# ⚡ Quick Start Cheat Sheet

## 1. Update WiFi (CRITICAL!)

**File:** `ESP32_COMPLETE_FIRMWARE.py` (lines 43-44)

Change this:
```python
WIFI_SSID = 'your_wifi_name'
WIFI_PASSWORD = 'your_wifi_password'
```

To your actual WiFi:
```python
WIFI_SSID = 'MyNetwork'
WIFI_PASSWORD = 'MyPassword123'
```

## 2. Upload to ESP32

1. Open Thonny
2. Open `ESP32_COMPLETE_FIRMWARE.py`
3. Right-click → "Save a copy..." → "Micro Python device"
4. Save as `main.py`
5. Click Run (F5)

**Expected Output:**
```
✓ All hardware initialized!
✓ WiFi Connected!
✓ MQTT Connected!
✓ System Ready! Starting monitoring...
```

## 3. Test Dashboard Commands

Open: **http://localhost:5173**

| Button | Watch For |
|--------|-----------|
| Fan ON | Relay clicks, Thonny shows: `💨 Relay ON` |
| Servo 0° | Servo moves left, Thonny shows: `📍 Servo: 0°` |
| Servo 90° | Servo moves middle, Thonny shows: `📍 Servo: 90°` |
| Green LED | Light turns on, Thonny shows: `🟢 Green LED ON` |
| Red LED | Light turns on, Thonny shows: `🔴 Red LED ON` |
| Buzzer ON | Beep sound, Thonny shows: `🔔 Buzzer ON` |
| Full Alert | Red LED + Servo 90° + Buzzer + Relay OFF |
| Normal Mode | Green LED + Servo 0° + Relay ON + Buzzer OFF |

## 4. Test Gas Detection

1. Start system (should show "✓ System Ready!")
2. Watch gas readings in Thonny: `Gas: 350 ADC (Normal)`
3. Bring lighter/acetone near sensor
4. When value > 1200:
   - Red LED turns ON
   - Buzzer sounds
   - Relay turns OFF
   - Servo moves to 90°
   - Email sent to subscribers
5. Remove gas source
6. System recovers to normal

## 5. Troubleshooting in 30 Seconds

### WiFi fails?
- Check SSID spelling (case-sensitive)
- Check password
- Check ESP32 near router

### MQTT fails?
- WiFi must be connected first
- Wait 5 seconds after WiFi connects
- Check MQTT broker name (starts with d9224a...)

### Commands don't work?
- Check Thonny shows "✓ MQTT Connected!"
- Check button in dashboard is clicked
- Check Thonny shows `[MQTT] LPG/system/control: COMMAND`

### Relay doesn't click?
- Check GPIO 33 wire is connected
- Check power supply (5V minimum)
- Try `relay.on()` in Thonny REPL

### Servo doesn't move?
- Check GPIO 14 wire is connected
- Check servo power (red=5V, black=GND)
- Try `servo.duty(77)` in Thonny REPL

### Gas sensor reads 0?
- Check GPIO 34 wire is connected
- Wait 30 seconds for sensor warmup
- Check sensor power supply

### Emails don't arrive?
- Check subscriber registered in dashboard
- Check backend `.env` has correct Gmail credentials
- Check backend running (`npm start`)
- Check Thonny shows gas value > 1200

## 6. Command Reference (One-Liner)

```
System:     ON, OFF, TEST
Relay:      RELAY_ON (open), RELAY_OFF (close)
Servo:      SERVO_0 (0°), SERVO_90 (90°), SERVO_180 (180°)
LED:        LED_GREEN, LED_RED, LED_OFF
Buzzer:     BUZZER_ON, BUZZER_OFF
Integrated: ALERT_MODE, NORMAL_MODE, SERVO_WITH_FAN
```

## 7. GPIO Pinout (Paste This)

```
ESP32 Pin → Device → Function
────────────────────────────
GPIO 33 → Relay → Gas valve (ON=open, OFF=closed)
GPIO 14 → Servo → Vent position (PWM 50Hz)
GPIO 34 → Sensor → Gas reading (ADC 0-4095)
GPIO 27 → Buzzer → Alarm sound
GPIO 25 → LED Green → Normal status
GPIO 26 → LED Red → Alert status
5V → All modules power
GND → All modules ground
```

## 8. MQTT Topics (Reference)

```
Subscribe:  LPG/system/control    ← Commands from backend
Publish:    LPG/gas/value         ← Gas readings
Publish:    LPG/gas/status        ← System status
Publish:    LPG/system/log        ← Log messages
```

## 9. Quick Tests

### Test Relay (60 sec)
```python
from machine import Pin
import time
relay = Pin(33, Pin.OUT)
relay.on()   # Click!
time.sleep(2)
relay.off()  # Click!
```

### Test Servo (60 sec)
```python
from machine import PWM, Pin
import time
servo = PWM(Pin(14), freq=50)
servo.duty(38)   # 0°
time.sleep(1)
servo.duty(77)   # 90°
time.sleep(1)
servo.duty(115)  # 180°
```

### Test Sensor (30 sec)
```python
from machine import ADC, Pin
adc = ADC(Pin(34))
adc.atten(ADC.ATTN_11DB)
adc.width(ADC.WIDTH_12BIT)
for i in range(5):
    print(adc.read())
    time.sleep(1)
```

### Test Buzzer (30 sec)
```python
from machine import Pin
import time
buzzer = Pin(27, Pin.OUT)
for i in range(3):
    buzzer.on()
    time.sleep(0.2)
    buzzer.off()
    time.sleep(0.2)
```

### Test LEDs (30 sec)
```python
from machine import Pin
import time
led_g = Pin(25, Pin.OUT)
led_r = Pin(26, Pin.OUT)
led_g.on()  # Green on
time.sleep(1)
led_r.on()  # Red on
time.sleep(1)
led_g.off()  # Green off
```

## 10. Expected System Behavior

### Normal Mode (Gas < 1200 ADC)
```
✓ Green LED: ON
✓ Red LED: OFF
✓ Relay: ON (gas open)
✓ Servo: 0° (vent closed)
✓ Buzzer: OFF
✓ Status: NORMAL
```

### Alert Mode (Gas > 1200 ADC)
```
✗ Green LED: OFF
✗ Red LED: ON
✗ Relay: OFF (gas closed)
✗ Servo: 90° (vent open)
✗ Buzzer: ON
✗ Status: GAS_DETECTED
✗ Email: Sent to all subscribers
```

### Recovery (Gas drops < 1200 again)
```
✓ Returns to Normal Mode
✓ Status: NORMAL
✓ Email: Sent to confirm recovery
```

## 11. Frontend Buttons (What to Click)

```
System Control:
  [🟢 System ON]  [🔴 System OFF]  [🧪 Test Alert]

Fan Control:
  [💨 Fan ON]  [🔒 Fan OFF]

Servo Control:
  [📍 Servo 0°]  [📍 Servo 90°]  [📍 Servo 180°]

LED Control:
  [🟢 Green LED ON]  [🔴 Red LED ON]  [⚫ All LEDs OFF]

Buzzer Control:
  [🔔 Buzzer ON]  [🔇 Buzzer OFF]

Integrated:
  [🚨 Srv+Fan]  [⚠️ Full Alert]  [✅ Normal Mode]
```

## 12. Files to Modify

| File | What to Change | Line |
|------|---|---|
| `ESP32_COMPLETE_FIRMWARE.py` | WiFi SSID | 43 |
| `ESP32_COMPLETE_FIRMWARE.py` | WiFi Password | 44 |
| `ESP32_COMPLETE_FIRMWARE.py` | Threshold (if needed) | 20 |
| `backend/.env` | Already configured | ✓ |
| `frontend/src/components/ControlPanel.jsx` | Already updated | ✓ |

## 13. Key Folders

```
d:\In-Fire\
├── ESP32_COMPLETE_FIRMWARE.py      ← Upload this to ESP32
├── THONNY_DEPLOYMENT_GUIDE.md      ← How to upload
├── COMMAND_QUICK_REFERENCE.md      ← Command list
├── HARDWARE_CONTROL_SYSTEM.md      ← This system
├── backend/
│   └── .env                        ← Email config
└── frontend/
    └── src/components/
        └── ControlPanel.jsx        ← Dashboard UI
```

## 14. Success Checklist

```
□ WiFi updated and connected
□ MQTT shows connected
□ Dashboard buttons show responses in Thonny
□ Each relay/servo/LED responds
□ Gas sensor reads values
□ Gas alert triggers at > 1200
□ Email sent when alert
□ System recovers when gas removed
□ All buttons work from dashboard
```

## 15. Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| `WiFi Connection Failed!` | WiFi SSID/password wrong | Update WiFi credentials |
| `MQTT Connection failed` | MQTT broker unreachable | Ensure WiFi connected first |
| `[MQTT] error` | Command failed | Check GPIO connection |
| `Relay doesn't click` | GPIO 33 not responding | Check wiring/power |
| `Servo doesn't move` | GPIO 14 PWM not working | Check wiring/servo power |
| No gas readings | ADC not reading | Check GPIO 34 wiring |

---

**You're ready! Update WiFi → Upload → Test → Deploy 🚀**
