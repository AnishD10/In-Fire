# 🔧 Complete Thonny Deployment & Testing Guide

## File Reference

**Main ESP32 Code:** `ESP32_COMPLETE_FIRMWARE.py`
- Contains all hardware control logic
- Handles all MQTT commands
- Ready to copy-paste into Thonny

## Step 1: Prepare Thonny

1. **Download Thonny** from https://thonny.org/
2. **Install MicroPython** on ESP32:
   - Connect ESP32 via USB
   - Thonny → Tools → Manage Devices → Install or Upgrade MicroPython

## Step 2: Configure WiFi Credentials

Open `ESP32_COMPLETE_FIRMWARE.py` in a text editor (or Thonny):

Find this section (around line 43):
```python
# ==========================================
# WiFi Configuration
# ==========================================
WIFI_SSID = 'your_wifi_name'
WIFI_PASSWORD = 'your_wifi_password'
```

**Replace with YOUR WiFi:**
```python
WIFI_SSID = 'your_actual_network_name'
WIFI_PASSWORD = 'your_actual_password'
```

## Step 3: Upload Code to ESP32

1. **Open Thonny**
2. **File → Open** → Select `ESP32_COMPLETE_FIRMWARE.py`
3. **Right-click on file** → "Save a copy..." → "Micro Python device"
4. **Save as:** `main.py`
5. **Click "Run"** (Green button) or **Ctrl+F5**

You should see output:
```
Initializing hardware...
  ✓ Relay (GPIO 33) initialized
  ✓ Servo (GPIO 14) PWM initialized
  ✓ Gas Sensor (GPIO 34) ADC initialized
  ✓ Buzzer (GPIO 27) initialized
  ✓ LEDs (GPIO 25, 26) initialized

✓ All hardware initialized!

Connecting to WiFi: your_wifi_name...
✓ WiFi Connected! IP: 192.168.x.x
Connecting to MQTT: d9224a...
✓ MQTT Connected!

✓ System Ready! Starting monitoring...
```

## Step 4: Test Individual Components

### Component Testing (without dashboard)

Create a test file in Thonny:

```python
# Test Relay
from machine import Pin
import time

relay = Pin(33, Pin.OUT)

print("Test 1: Relay ON")
relay.on()  # Gas valve OPEN
time.sleep(2)

print("Test 2: Relay OFF")
relay.off()  # Gas valve CLOSED
time.sleep(2)

print("Test complete!")
```

### Test Servo
```python
from machine import PWM, Pin
import time

servo = PWM(Pin(14), freq=50)

print("Servo 0°")
servo.duty(38)
time.sleep(2)

print("Servo 90°")
servo.duty(77)
time.sleep(2)

print("Servo 180°")
servo.duty(115)
time.sleep(2)

servo.duty(38)  # Return to 0°
```

### Test Gas Sensor
```python
from machine import ADC, Pin
import time

adc = ADC(Pin(34))
adc.atten(ADC.ATTN_11DB)
adc.width(ADC.WIDTH_12BIT)

for i in range(10):
    value = adc.read()
    print(f"Gas Value: {value} ADC")
    time.sleep(1)
```

### Test Buzzer
```python
from machine import Pin
import time

buzzer = Pin(27, Pin.OUT)

print("Buzzer test - 3 beeps")
for i in range(3):
    buzzer.on()
    time.sleep(0.2)
    buzzer.off()
    time.sleep(0.2)
```

### Test LEDs
```python
from machine import Pin
import time

led_green = Pin(25, Pin.OUT)
led_red = Pin(26, Pin.OUT)

print("Green ON")
led_green.on()
time.sleep(1)

print("Green OFF, Red ON")
led_green.off()
led_red.on()
time.sleep(1)

print("All OFF")
led_red.off()
```

## Step 5: Use Dashboard Control

Once code is running and MQTT connected:

1. **Open Frontend:** http://localhost:5173
2. **You should see:**
   - Real-time gas readings
   - Status indicator
   - 6 command sections:
     - System Control (ON/OFF/TEST)
     - Fan Control (RELAY_ON/RELAY_OFF)
     - Servo Control (0°/90°/180°)
     - LED Control (GREEN/RED/OFF)
     - Buzzer Control (ON/OFF)
     - Integrated Scenarios

3. **Click any button to send command**
4. **Watch Thonny serial output** to see command received:
   ```
   [MQTT] LPG/system/control: RELAY_ON
   >>> Executing command: RELAY_ON
     💨 Relay ON - Gas flowing
   ```

## Command Reference

| Frontend Button | Command Sent | ESP32 Action | Hardware |
|---|---|---|---|
| Fan ON | RELAY_ON | relay.on() | GPIO 33 HIGH |
| Fan OFF | RELAY_OFF | relay.off() | GPIO 33 LOW |
| Servo 0° | SERVO_0 | servo.duty(38) | GPIO 14 PWM |
| Servo 90° | SERVO_90 | servo.duty(77) | GPIO 14 PWM |
| Servo 180° | SERVO_180 | servo.duty(115) | GPIO 14 PWM |
| Green LED | LED_GREEN | led_green.on() | GPIO 25 HIGH |
| Red LED | LED_RED | led_red.on() | GPIO 26 HIGH |
| LEDs OFF | LED_OFF | Both off | GPIO 25,26 LOW |
| Buzzer ON | BUZZER_ON | buzzer.on() | GPIO 27 HIGH |
| Buzzer OFF | BUZZER_OFF | buzzer.off() | GPIO 27 LOW |
| Srv+Fan | SERVO_WITH_FAN | servo 90° + relay off | Combined |
| Alert Mode | ALERT_MODE | Full alert sequence | All |
| Normal Mode | NORMAL_MODE | Green + Relay ON | All |

## Testing Procedure

### 1. Individual Component Tests (2-3 min each)
```
□ RELAY_ON  → Relay clicks
□ RELAY_OFF → Relay clicks
□ SERVO_0   → Servo moves to closed
□ SERVO_90  → Servo moves to open
□ SERVO_180 → Servo moves to max
□ LED_GREEN → Green light on
□ LED_RED   → Red light on
□ LED_OFF   → Both lights off
□ BUZZER_ON → Buzzer sounds
□ BUZZER_OFF → Buzzer stops
```

### 2. Combined Tests
```
□ ALERT_MODE → Red + Relay OFF + Servo 90° + Buzzer ON
□ NORMAL_MODE → Green + Relay ON + Servo 0° + Buzzer OFF
□ SERVO_WITH_FAN → Servo 90° + Relay OFF (emergency)
```

### 3. Gas Detection Test
```
□ Start system in NORMAL_MODE
□ Ensure gas value < 1200
□ Create gas near sensor (lighter, acetone, etc.)
□ Watch gas value increase
□ When > 1200:
  - Red LED should turn ON
  - Buzzer should sound
  - Relay should turn OFF
  - Servo should move to 90°
  - Email alert sent to subscribers
```

## Serial Monitor Output Examples

### Successful Startup
```
Initializing hardware...
  ✓ Relay (GPIO 33) initialized
  ✓ Servo (GPIO 14) PWM initialized
  ✓ Gas Sensor (GPIO 34) ADC initialized
  ✓ Buzzer (GPIO 27) initialized
  ✓ LEDs (GPIO 25, 26) initialized

✓ All hardware initialized!

Connecting to WiFi: MyNetwork...
✓ WiFi Connected! IP: 192.168.1.100
Connecting to MQTT: d9224a87ae11416...
✓ MQTT Connected!

✓ System Ready! Starting monitoring...
```

### Gas Detected
```
Gas: 380 ADC (Normal)
Gas: 420 ADC (Normal)
Gas: 890 ADC (Normal)
Gas: 1250 ADC

⚠️  GAS ALERT! Value: 1250 (> 1200)
  ⚠️ ALERT MODE: Red LED + Relay OFF + Servo 90° + Buzzer ON
```

### Command Received
```
[MQTT] LPG/system/control: RELAY_ON
>>> Executing command: RELAY_ON
  💨 Relay ON - Gas flowing
```

### Recovery
```
Gas: 1100 ADC
Gas: 800 ADC
Gas: 500 ADC

✓ Gas level returning to normal (500)
  ✅ NORMAL MODE: Green LED + Relay ON + Servo 0° + Buzzer OFF
```

## Troubleshooting

### Problem: WiFi won't connect
```
Solution:
1. Check WIFI_SSID spelling (case-sensitive)
2. Verify WIFI_PASSWORD is correct
3. Move ESP32 closer to router
4. Restart router
```

### Problem: MQTT connection fails
```
Solution:
1. Verify WiFi is connected first
2. Check MQTT broker address (should be: d9224a87ae11416...)
3. Check MQTT credentials (username: LPG_Detection, pass: Fire@101)
4. Ensure port 8883 is not blocked by firewall
```

### Problem: Commands not working
```
Solution:
1. Check MQTT "✓ MQTT Connected!" in output
2. Verify command is being received "[MQTT] LPG/system/control: COMMAND"
3. Check GPIO pin connections
4. Verify power supply (5V minimum for all components)
```

### Problem: Relay doesn't click
```
Solution:
1. Check GPIO 33 is connected to relay signal pin
2. Verify power supply (5V to relay module)
3. Test with multimeter on GPIO 33 (should toggle 0-3.3V)
4. Try relay.on() and relay.off() in REPL
```

### Problem: Servo doesn't move
```
Solution:
1. Check GPIO 14 is connected to servo signal
2. Verify servo power (usually red=5V, black=GND)
3. Test different PWM duty values: 25, 77, 115
4. Check servo isn't stalled (remove obstruction)
```

### Problem: Gas sensor always reads 0 or 4095
```
Solution:
1. Check GPIO 34 ADC connection
2. Verify sensor is powered (check red LED)
3. Wait 30 seconds for sensor warm-up
4. Test with adc.read() in REPL multiple times
5. May need to recalibrate sensor
```

## Advanced: Modify Threshold

Edit line 20 in `ESP32_COMPLETE_FIRMWARE.py`:

```python
THRESHOLD = 1200  # Change this number
```

Lower value = more sensitive
Higher value = less sensitive

Common values:
- 800 = Very sensitive (many false alarms)
- 1000 = Sensitive
- 1200 = Balanced (recommended)
- 1500 = Less sensitive
- 2000 = Very insensitive (might miss leaks)

## File Structure

```
Your Project/
├── ESP32_COMPLETE_FIRMWARE.py    ← Main code
├── backend/
│   └── .env                        ← Email/MQTT settings
└── frontend/
    └── src/
        └── components/
            └── ControlPanel.jsx    ← Dashboard commands
```

## Next Steps

1. ✅ Configure WiFi credentials
2. ✅ Upload to ESP32
3. ✅ Test each component individually
4. ✅ Test integrated scenarios
5. ✅ Test with actual gas detection
6. ✅ Monitor email alerts
7. ✅ Deploy to production

**Ready to test! 🚀**
