# 🧪 Quick Test Execution Guide

## Run Tests in This Order

### **Test 10: Relay + Servo** (2 min)
```
Purpose: Test basic relay and servo control
File: SYSTEM_TEST_SUITE_10-18.md (Test Case 10)
Expected: Relay clicks, Servo moves
```

### **Test 11: + Sensor** (3 min)
```
Purpose: Add MQ-2 sensor reading
File: SYSTEM_TEST_SUITE_10-18.md (Test Case 11)
Expected: Sensor reads 300-500 ADC (no gas)
```

### **Test 12: + Buzzer** (3 min)
```
Purpose: Add alarm buzzer
File: SYSTEM_TEST_SUITE_10-18.md (Test Case 12)
Expected: 3 beeps, alert simulation works
```

### **Test 13: Complete Hardware** (5 min)
```
Purpose: All components together
File: SYSTEM_TEST_SUITE_10-18.md (Test Case 13)
Expected: LEDs, relay, servo, buzzer, sensor all work
```

### **Test 14: Local System** (5 min)
```
Purpose: Test without cloud
File: SYSTEM_TEST_SUITE_10-18.md (Test Case 14)
Expected: System detects gas locally, activates safety
```

### **Test 15: Cloud Publishing** (5 min)
```
Purpose: Test MQTT gas readings
File: SYSTEM_TEST_SUITE_10-18.md (Test Case 15)
Expected: Backend console shows MQTT messages
```

### **Test 16: Cloud Alerts** (10 min)
```
Purpose: Test email notifications
File: SYSTEM_TEST_SUITE_10-18.md (Test Case 16)
Prerequisites: Subscribers registered, Gmail configured
Expected: Alert email received
```

### **Test 17: VIN Power** (5 min)
```
Purpose: Test external 5V power supply
File: SYSTEM_TEST_SUITE_10-18.md (Test Case 17)
Expected: All components work with VIN power
```

### **Test 18: Full System** (15 min)
```
Purpose: Complete end-to-end test
File: SYSTEM_TEST_SUITE_10-18.md (Test Case 18)
Expected: All phases pass, system production-ready
```

---

## Setup Checklist Before Testing

### Hardware
- [ ] ESP32 connected
- [ ] All wires secure
- [ ] Power supply ready (USB or VIN)
- [ ] Relay module connected to GPIO 33
- [ ] Servo motor connected to GPIO 14 (PWM)
- [ ] MQ-2 sensor connected to GPIO 34 (ADC)
- [ ] Buzzer connected to GPIO 27
- [ ] Green LED connected to GPIO 25
- [ ] Red LED connected to GPIO 26

### Software
- [ ] Thonny IDE or serial monitor open
- [ ] Backend running (`npm start`)
- [ ] Frontend running (`npm run dev`)
- [ ] At least 1 subscriber registered
- [ ] Gmail SMTP configured in `.env`

### Network
- [ ] WiFi credentials in code correct
- [ ] HiveMQ Cloud credentials correct
- [ ] Internet connectivity working

---

## How to Run Each Test

### Step 1: Copy Test Code
From `SYSTEM_TEST_SUITE_10-18.md`, copy the entire test code for your test case.

### Step 2: Create File in Thonny
- File → New
- Paste the test code
- Don't save yet

### Step 3: Run Test
- Click ▶️ Run button in Thonny
- Watch the Shell window for output
- Hardware should respond

### Step 4: Verify Results
- All ✓ marks should appear
- No errors in console
- Hardware responds as expected

### Step 5: Document Results
- Note any failures
- Troubleshoot if needed
- Move to next test

---

## Test Status Tracker

| Test | Purpose | Status | Notes |
|------|---------|--------|-------|
| 10 | Relay + Servo | [ ] Pass [ ] Fail | |
| 11 | + Sensor | [ ] Pass [ ] Fail | |
| 12 | + Buzzer | [ ] Pass [ ] Fail | |
| 13 | Complete HW | [ ] Pass [ ] Fail | |
| 14 | Local System | [ ] Pass [ ] Fail | |
| 15 | Cloud Publish | [ ] Pass [ ] Fail | |
| 16 | Cloud Alerts | [ ] Pass [ ] Fail | |
| 17 | VIN Power | [ ] Pass [ ] Fail | |
| 18 | Full System | [ ] Pass [ ] Fail | |

---

## Expected Hardware Behavior

### During Test 10-13
- **Relay:** Clicks when ON/OFF
- **Servo:** Moves to different angles (0°, 90°, 180°)
- **Buzzer:** Beeps 3 times, sounds alarm
- **LEDs:** Green lights (normal), Red lights (alert)
- **Sensor:** Readings 300-500 ADC (no gas)

### During Test 14
- **LED:** Green ON (normal mode)
- **Relay:** ON (gas enabled)
- **Servo:** 0° (vent closed)
- **Buzzer:** OFF (quiet)
- **Sensor:** Continuously reads values

### During Test 15
- **Backend console:** Shows "MQTT messages received"
- **MQTT topic:** LPG/gas/value showing readings

### During Test 16
- **Backend console:** Shows "Sending alerts to X subscribers"
- **Email inbox:** Alert email received
- **Hardware:** Red LED ON, Relay OFF, Servo 90°

### During Test 17
- **Power:** Connected via VIN (not USB)
- **Behavior:** Identical to USB power tests
- **Components:** All respond normally

### During Test 18
- **Phase 1:** All hardware tests
- **Phase 2:** WiFi connects
- **Phase 3:** MQTT connects
- **Phase 4:** Gas monitoring
- **Phase 5:** Alert triggered
- **Phase 6:** System recovers
- **Result:** System production-ready

---

## Common Issues & Solutions

### Issue: Relay doesn't click
**Solution:**
- Check GPIO 33 connection
- Verify power supply (5V needed)
- Test with multimeter

### Issue: Servo doesn't move
**Solution:**
- Check GPIO 14 PWM signal
- Verify servo power (5V)
- Check PWM frequency (50Hz)

### Issue: Sensor reads 0 or 4095
**Solution:**
- Check GPIO 34 connection
- Verify sensor powered
- Test with different values
- May need calibration

### Issue: Buzzer doesn't sound
**Solution:**
- Check GPIO 27 connection
- Verify polarity (+ / -)
- Check power supply

### Issue: WiFi doesn't connect
**Solution:**
- Verify SSID correct in code
- Check password correct
- Ensure signal strength good
- Try second network option

### Issue: MQTT connection fails
**Solution:**
- Verify HiveMQ credentials
- Check internet connection
- Ensure WiFi is connected first
- Check firewall/NAT settings

### Issue: Emails not received
**Solution:**
- Verify Gmail .env settings
- Check App Password used (not regular password)
- Verify subscriber email in database
- Check spam folder
- Enable "Less secure apps" if needed

---

## Quick Troubleshooting

**Hardware not responding?**
→ Check power supply (5V minimum)
→ Verify GPIO connections
→ Test with multimeter

**WiFi fails?**
→ Check SSID/password in code
→ Move closer to router
→ Try alternate network

**MQTT fails?**
→ Verify WiFi connected first
→ Check HiveMQ credentials
→ Test internet connectivity

**Alerts not working?**
→ Check backend running
→ Verify .env configured
→ Check subscriber registered
→ Look for backend errors

---

## Success Indicators

✅ **Test passes when:**
- No error messages in console
- All hardware responds as expected
- Backend/Frontend receive updates
- Emails delivered to subscribers
- System recovers from alert

❌ **Test fails if:**
- Red error messages appear
- Hardware doesn't respond
- Timeout errors
- Emails not received
- System doesn't recover

---

## Next Steps After Testing

### If All Tests Pass:
1. ✅ System is production-ready
2. ✅ Document results
3. ✅ Take screenshots
4. ✅ Schedule field deployment

### If Tests Fail:
1. Identify which test failed
2. Review troubleshooting section
3. Fix issue
4. Re-run failing test
5. Continue with next test

---

## Test Documentation Template

```
Test Case: [Number and Name]
Date: [Date]
Tester: [Name]
Hardware: [Configuration]
Power: [USB / VIN]

Results:
- Component 1: [✓ Pass / ✗ Fail]
- Component 2: [✓ Pass / ✗ Fail]
- Network: [✓ Pass / ✗ Fail]

Issues Found:
[List any issues]

Solutions Applied:
[List any fixes]

Overall Status: [✓ PASS / ✗ FAIL]

Notes:
[Additional observations]
```

---

## Estimated Timeline

```
Test 10:  [████░░░░░░] 2 min
Test 11:  [████░░░░░░] 3 min
Test 12:  [████░░░░░░] 3 min
Test 13:  [████░░░░░░] 5 min
Test 14:  [████░░░░░░] 5 min
Test 15:  [████░░░░░░] 5 min
Test 16:  [████░░░░░░] 10 min
Test 17:  [████░░░░░░] 5 min
Test 18:  [████░░░░░░] 15 min
─────────────────────────────
Total:    ≈ 55 minutes
```

---

## Ready to Start Testing?

1. ✅ Read this guide
2. ✅ Check all prerequisites
3. ✅ Open SYSTEM_TEST_SUITE_10-18.md
4. ✅ Copy Test Case 10 code
5. ✅ Run in Thonny
6. ✅ Document results
7. ✅ Continue to Test 11

**Good luck with testing! 🚀**
