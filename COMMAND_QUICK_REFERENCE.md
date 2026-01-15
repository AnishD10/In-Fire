# 🎮 Command Quick Reference Card

## Frontend Dashboard Commands

### System Control
```
Button: "System ON"      → Command: ON      → ESP32: normal_mode()
Button: "System OFF"     → Command: OFF     → ESP32: all_off()
Button: "Test Alert"     → Command: TEST    → ESP32: test_alert()
```

### Fan Control (Relay GPIO 33)
```
Button: "Fan ON"         → Command: RELAY_ON   → GPIO 33: HIGH (relay.on())
Button: "Fan OFF"        → Command: RELAY_OFF  → GPIO 33: LOW (relay.off())
```
**Logic:**
- Relay ON (HIGH) = Gas valve OPEN = Normal flow
- Relay OFF (LOW) = Gas valve CLOSED = Emergency/Alert

### Servo Control (GPIO 14 PWM)
```
Button: "Servo 0°"       → Command: SERVO_0    → PWM duty: 38 (fully closed)
Button: "Servo 90°"      → Command: SERVO_90   → PWM duty: 77 (half open)
Button: "Servo 180°"     → Command: SERVO_180  → PWM duty: 115 (max open)
```
**PWM Duty Mapping:**
| Angle | Duty | Description |
|-------|------|-------------|
| 0°    | 38   | Vent fully closed |
| 90°   | 77   | Vent half open |
| 180°  | 115  | Vent fully open |

### LED Status (GPIO 25 & 26)
```
Button: "Green LED ON"   → Command: LED_GREEN  → GPIO 25: HIGH
Button: "Red LED ON"     → Command: LED_RED    → GPIO 26: HIGH
Button: "All LEDs OFF"   → Command: LED_OFF    → Both: LOW
```
**Status:**
- Green = Normal operation
- Red = Alert/Gas detected

### Buzzer Alarm (GPIO 27)
```
Button: "Buzzer ON"      → Command: BUZZER_ON  → GPIO 27: HIGH
Button: "Buzzer OFF"     → Command: BUZZER_OFF → GPIO 27: LOW
```

### Integrated Scenarios
```
Button: "Srv+Fan"        → Command: SERVO_WITH_FAN
  Actions:
  - Servo → 90° (vent open for emergency venting)
  - Relay → OFF (gas valve closed - emergency stop)
  - LED Green → OFF
  - LED Red → ON (alert indicator)
  - Buzzer → ON (alarm sound)
  - Wait 2 seconds, then Buzzer OFF

Button: "Full Alert"     → Command: ALERT_MODE
  Actions:
  - Servo → 90° (emergency vent)
  - Relay → OFF (gas closed)
  - LED → Red ON, Green OFF
  - Buzzer → ON continuously
  - Log: "ALERT MODE activated"

Button: "Normal Mode"    → Command: NORMAL_MODE
  Actions:
  - Servo → 0° (vent closed)
  - Relay → ON (gas open - normal flow)
  - LED → Green ON, Red OFF
  - Buzzer → OFF
  - Log: "NORMAL MODE activated"
```

## MQTT Topic Structure

```
LPG/gas/value           ← ESP32 publishes gas readings
                          Example: "1250" (ADC value 0-4095)

LPG/gas/status          ← ESP32 publishes system status
                          Example: "GAS_DETECTED - Value: 1250"
                          or "NORMAL"

LPG/system/control      ← Backend publishes commands
                          ESP32 listens for: ON, OFF, TEST,
                          RELAY_ON, RELAY_OFF, SERVO_0, SERVO_90,
                          SERVO_180, LED_GREEN, LED_RED, LED_OFF,
                          BUZZER_ON, BUZZER_OFF, ALERT_MODE,
                          NORMAL_MODE, SERVO_WITH_FAN

LPG/system/log          ← ESP32 publishes log messages
                          Example: "System started"
                          "Relay ON (Gas valve OPEN)"
                          "GAS ALERT: Value 1250"
```

## GPIO Pin Mapping

```
GPIO 33: Relay Module
  ├─ Pin Direction: OUTPUT
  ├─ ON State: HIGH (relay.on())
  ├─ OFF State: LOW (relay.off())
  └─ Control: Gas valve open/close

GPIO 14: Servo Motor (PWM)
  ├─ Pin Direction: PWM Output (50Hz)
  ├─ Duty Range: 25-128 (0-180°)
  ├─ 0°   → duty(38)
  ├─ 90°  → duty(77)
  ├─ 180° → duty(115)
  └─ Control: Vent position

GPIO 34: Gas Sensor (ADC)
  ├─ Pin Direction: INPUT (ADC)
  ├─ Range: 0-4095 (12-bit)
  ├─ Resolution: 0.8mV per unit
  ├─ Normal Reading: 300-500 ADC
  ├─ Alert Threshold: > 1200 ADC
  └─ Control: Read sensor values

GPIO 27: Buzzer
  ├─ Pin Direction: OUTPUT
  ├─ ON: HIGH (buzzer.on())
  ├─ OFF: LOW (buzzer.off())
  └─ Control: Sound alarm

GPIO 25: Green LED
  ├─ Pin Direction: OUTPUT
  ├─ ON: HIGH (led_green.on())
  ├─ OFF: LOW (led_green.off())
  └─ Status: Normal operation indicator

GPIO 26: Red LED
  ├─ Pin Direction: OUTPUT
  ├─ ON: HIGH (led_red.on())
  ├─ OFF: LOW (led_red.off())
  └─ Status: Alert indicator
```

## Execution Flow

### Gas Detection Flow
```
1. ESP32 reads ADC every 2 seconds
   └─ Gas value = sensor.read() (0-4095)

2. Compare with threshold (1200)
   ├─ If value <= 1200:
   │  └─ Normal mode (Green LED, Relay ON, Servo 0°, Buzzer OFF)
   │     └─ Publish gas value to LPG/gas/value
   │
   └─ If value > 1200:
      └─ Alert mode (Red LED, Relay OFF, Servo 90°, Buzzer ON)
         └─ Publish alert to LPG/gas/status
         └─ Backend sends email to subscribers
         └─ Hold alert for 10 seconds
         └─ If value drops, recover to normal

3. Loop every 2 seconds
```

### Command Execution Flow
```
1. Frontend button clicked
   └─ Command published to LPG/system/control

2. Backend receives via MQTT
   └─ Publishes command to MQTT broker

3. ESP32 receives command
   ├─ Parse command string
   ├─ Execute corresponding function
   │  └─ Modify GPIO states
   │  └─ Publish confirmation
   └─ Loop continues

4. Frontend receives confirmation
   └─ Display "Command executed"
   └─ Log to console
```

## Testing Checklist

```
Component Testing:
□ Relay clicks when toggled (GPIO 33)
□ Servo moves to each position (GPIO 14)
□ Gas sensor reads values (GPIO 34)
□ Buzzer makes sound (GPIO 27)
□ Green LED lights up (GPIO 25)
□ Red LED lights up (GPIO 26)

Integration Testing:
□ Normal Mode: Green + Relay ON + Servo 0° + Buzzer OFF
□ Alert Mode: Red + Relay OFF + Servo 90° + Buzzer ON
□ Srv+Fan: Emergency sequence works
□ Test Alert: 3 beeps + alert sequence

Sensor Testing:
□ Reads 300-500 ADC in fresh air
□ Increases when exposed to gas
□ Triggers alert at > 1200 ADC
□ Recovers when gas removed

MQTT Testing:
□ "✓ WiFi Connected!" in output
□ "✓ MQTT Connected!" in output
□ Commands received: "[MQTT] LPG/system/control: ..."
□ Gas values published: "[MQTT] LPG/gas/value: ..."

Email Testing:
□ Subscribers registered in system
□ Alert email sent when gas > 1200
□ Email contains gas value and instructions
□ Email received within 30 seconds
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| WiFi not connecting | Wrong SSID/password | Edit WiFi_SSID and WIFI_PASSWORD |
| MQTT not connecting | WiFi not connected first | Ensure WiFi connects before MQTT |
| Commands not working | MQTT not connected | Check "✓ MQTT Connected!" message |
| Relay doesn't click | GPIO 33 not connected | Verify wire to relay signal pin |
| Servo doesn't move | GPIO 14 not connected | Verify wire to servo signal pin |
| Gas sensor always 0 | Sensor not powered | Check sensor power supply |
| Emails not sending | No subscribers | Register email in dashboard |
| Emails not sending | .env not configured | Check backend .env file |

## System States

```
┌─────────────────────────────────────────┐
│         SYSTEM NORMAL STATE             │
│  ✓ Green LED: ON                        │
│  ✓ Relay: ON (gas open)                 │
│  ✓ Servo: 0° (vent closed)              │
│  ✓ Buzzer: OFF (silent)                 │
│  ✓ Status: "NORMAL"                     │
│  ✓ Gas value < 1200 ADC                 │
└─────────────────────────────────────────┘
                    ↓
        Gas value increases to > 1200
                    ↓
┌─────────────────────────────────────────┐
│          ALERT STATE TRIGGERED          │
│  ✗ Green LED: OFF                       │
│  ✗ Red LED: ON (blink alert)            │
│  ✗ Relay: OFF (gas blocked)             │
│  ✗ Servo: 90° (vent open)               │
│  ✗ Buzzer: ON (alarm sound)             │
│  ✗ Status: "GAS_DETECTED"               │
│  ✗ Email: Sent to subscribers           │
│  ✗ Hold: 10 seconds wait                │
└─────────────────────────────────────────┘
                    ↓
    Gas value drops below 1200
                    ↓
┌─────────────────────────────────────────┐
│      RECOVERY TO NORMAL STATE           │
│  ✓ Green LED: ON                        │
│  ✓ Red LED: OFF                         │
│  ✓ Relay: ON (gas open)                 │
│  ✓ Servo: 0° (vent closed)              │
│  ✓ Buzzer: OFF                          │
│  ✓ Status: "NORMAL"                     │
└─────────────────────────────────────────┘
```

## Production Deployment

```
Pre-Deployment Checklist:
✓ All components tested individually
✓ WiFi connects automatically
✓ MQTT connects automatically  
✓ Gas detection triggers correctly
✓ Emails sent to all subscribers
✓ Dashboard controls work
✓ Threshold set to 1200
✓ Thonny code saved as main.py on ESP32

Deployment Steps:
1. Power off ESP32
2. Ensure all wiring secure
3. Use VIN pin for 5V power (not USB)
4. Power on
5. Wait for "✓ System Ready!" message
6. Monitor dashboard for readings
7. Keep Thonny open to monitor errors

Ongoing Monitoring:
□ Check gas readings every day
□ Verify alert emails if triggered
□ Check subscriber list weekly
□ Monitor for error messages
□ Record any false alarms
```

---

**Reference Complete! Ready for Full Deployment 🚀**
