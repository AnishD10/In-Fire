# API Reference & Data Formats

## 📡 REST API Endpoints

### 1. Gas Reading Endpoint

#### GET `/api/gas/latest`

Get the latest gas sensor reading and system status.

**Request:**
```bash
curl http://localhost:5000/api/gas/latest
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "value": 892,
    "status": "GAS_DETECTED",
    "timestamp": "2026-01-15T10:30:45.123Z"
  },
  "message": "Latest gas reading retrieved successfully"
}
```

**Response (500 Error):**
```json
{
  "success": false,
  "error": "Failed to retrieve reading"
}
```

---

### 2. Control Command Endpoint

#### POST `/api/control`

Send a control command to the ESP32 system.

**Request:**
```bash
curl -X POST http://localhost:5000/api/control \
  -H "Content-Type: application/json" \
  -d '{"command":"ON"}'
```

**Valid Commands:**
- `ON` - Turn system ON
- `OFF` - Turn system OFF
- `TEST` - Run system test

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Control command 'ON' sent successfully",
  "command": "ON",
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

**Response (400 Bad Request - Invalid Command):**
```json
{
  "success": false,
  "error": "Invalid command. Valid commands: ON, OFF, TEST"
}
```

**Response (500 Error):**
```json
{
  "success": false,
  "error": "MQTT client not connected"
}
```

---

### 3. Subscribe Endpoint

#### POST `/api/subscribe`

Subscribe user email to receive gas leakage alerts.

**Request:**
```bash
curl -X POST http://localhost:5000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully subscribed to gas leakage alerts!",
  "email": "user@example.com",
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

**Response (400 Bad Request - Invalid Email):**
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

**Response (400 Bad Request - Already Subscribed):**
```json
{
  "success": false,
  "error": "Email already subscribed"
}
```

---

### 4. Get Subscribers List

#### GET `/api/subscribe/list`

Get list of all subscribed emails (admin endpoint).

**Request:**
```bash
curl http://localhost:5000/api/subscribe/list
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "subscribers": [
    {
      "email": "user1@example.com",
      "subscribedAt": "2026-01-10T15:20:00.000Z"
    },
    {
      "email": "user2@example.com",
      "subscribedAt": "2026-01-12T08:45:00.000Z"
    },
    {
      "email": "admin@example.com",
      "subscribedAt": "2026-01-14T12:30:00.000Z"
    }
  ]
}
```

---

### 5. Unsubscribe Endpoint

#### DELETE `/api/subscribe/:email`

Unsubscribe user from gas leakage alerts.

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/subscribe/user@example.com
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully unsubscribed",
  "email": "user@example.com"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Email not found in subscribers"
}
```

---

## 🔔 MQTT Topics & Payloads

### Topics Published by ESP32

#### Topic: `LPG/gas/value`
Real-time gas sensor readings

| Property | Type | Example | Range |
|----------|------|---------|-------|
| Payload | Integer | 892 | 0-4095 |

**Frequency:** Every 2 seconds (configurable in ESP32 code)

**Example:**
```
Topic: LPG/gas/value
Payload: 892
```

#### Topic: `LPG/gas/status`
System status indicator

| Property | Type | Values |
|----------|------|--------|
| Payload | String | `NORMAL` or `GAS_DETECTED` |

**Frequency:** When status changes or with reading

**Example:**
```
Topic: LPG/gas/status
Payload: GAS_DETECTED
```

---

### Topics Published by Backend

#### Topic: `LPG/system/control`
Control commands for ESP32

| Property | Type | Values |
|----------|------|--------|
| Payload | String | `ON`, `OFF`, `TEST` |

**Command Descriptions:**
- `ON` - Activate all systems (relay, servo, LEDs)
- `OFF` - Deactivate all systems
- `TEST` - Run system test (all components activate briefly)

**Example:**
```
Topic: LPG/system/control
Payload: ON
```

---

## 📧 Email Alert Format

### Welcome Email

**Sent immediately after subscription**

```
From: noreply@gasdetection.com
To: subscriber@example.com
Subject: ✓ Welcome to Gas Leakage Detection System

Content:
- Welcome message
- Features overview
- Unsubscribe information
```

### Gas Leakage Alert Email

**Sent when gas value > 870**

```
From: noreply@gasdetection.com
To: subscriber@example.com
Subject: 🚨 GAS LEAKAGE ALERT - IMMEDIATE ACTION REQUIRED

Content:
- Alert status: GAS_DETECTED
- Gas value: 892
- Timestamp: 2026-01-15 10:30:45
- Safety instructions
- Action items:
  1. Evacuate immediately
  2. Turn off electrical equipment
  3. Contact emergency services
- Link to dashboard
```

---

## 🔄 Data Flow Sequence

### Complete Gas Leak Detection Flow

```
1. ESP32 PUBLISHES
   ├─ Topic: LPG/gas/value
   ├─ Payload: 925
   └─ Frequency: Every 2 seconds

2. BACKEND SUBSCRIBES
   ├─ Receives: 925
   ├─ Stores: gasReading.value = 925
   └─ Checks: 925 > 870? YES

3. THRESHOLD CHECK
   ├─ gasReading.status = "GAS_DETECTED"
   └─ Triggers: Email alert sending

4. EMAIL ALERTS SENT
   ├─ Get all subscribers
   ├─ Send alert email to each
   └─ Log: "✓ Alert email sent to user@example.com"

5. BACKEND PUBLISHES STATUS
   ├─ Topic: LPG/gas/status
   └─ Payload: GAS_DETECTED

6. FRONTEND POLLS
   ├─ GET /api/gas/latest (every 2 seconds)
   ├─ Receives: { value: 925, status: "GAS_DETECTED" }
   └─ Updates: UI with red alert

7. FRONTEND DISPLAYS
   ├─ Dashboard: RED background
   ├─ Status: "ALERT"
   ├─ Toast: "⚠️ GAS LEAKAGE DETECTED!"
   └─ Progress bar: 100% filled (red)

8. USER TAKES ACTION
   ├─ Clicks: "ON" / "OFF" / "TEST" button
   └─ Sends: POST /api/control

9. BACKEND PUBLISHES COMMAND
   ├─ Topic: LPG/system/control
   └─ Payload: ON / OFF / TEST

10. ESP32 EXECUTES
    ├─ Receives MQTT command
    ├─ Activates/deactivates relay
    ├─ Updates servo position
    └─ Changes LED status
```

---

## 📊 Response Time & Performance

### Expected Latencies

| Operation | Time | Notes |
|-----------|------|-------|
| Gas reading (ESP32→MQTT) | < 100ms | Wireless publish |
| MQTT delivery (HiveMQ) | < 200ms | Cloud broker |
| Backend processing | < 50ms | In-memory processing |
| Backend→Frontend (REST) | < 100ms | HTTP request |
| Frontend update | < 100ms | React re-render |
| **Total: ESP32 to Frontend** | **< 500ms** | Mostly network latency |
| Email sending | 1-5 seconds | Gmail SMTP |

### Data Storage

**subscribers.json** format:
```json
[
  {
    "email": "user1@example.com",
    "subscribedAt": "2026-01-10T15:20:00.000Z"
  },
  {
    "email": "user2@example.com",
    "subscribedAt": "2026-01-12T08:45:00.000Z"
  }
]
```

---

## 🔐 Error Handling

### Common Error Codes

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| 400 | Invalid email address | Wrong format | Use valid email |
| 400 | Email already subscribed | Duplicate | Use different email |
| 400 | Invalid command | Wrong value | Use ON/OFF/TEST |
| 404 | Email not found | Unsubscribe error | Email not in list |
| 500 | MQTT client not connected | Backend issue | Check MQTT connection |
| 500 | Failed to retrieve reading | No data | Ensure ESP32 publishing |

---

## 🧪 Example Test Cases

### Test 1: Normal Operation
```bash
# 1. Subscribe
curl -X POST http://localhost:5000/api/subscribe \
  -d '{"email":"test@example.com"}'

# 2. Publish low gas value via MQTT
# Topic: LPG/gas/value
# Payload: 500

# 3. Check frontend - should show green/NORMAL
curl http://localhost:5000/api/gas/latest
# Response: { status: "NORMAL", value: 500 }
```

### Test 2: Gas Leak Alert
```bash
# 1. Publish high gas value via MQTT
# Topic: LPG/gas/value
# Payload: 950

# 2. Check backend response
curl http://localhost:5000/api/gas/latest
# Response: { status: "GAS_DETECTED", value: 950 }

# 3. Check email inbox - alert should arrive in 1-5 seconds
```

### Test 3: Control Commands
```bash
# Test ON command
curl -X POST http://localhost:5000/api/control \
  -d '{"command":"ON"}'

# Test OFF command
curl -X POST http://localhost:5000/api/control \
  -d '{"command":"OFF"}'

# Test TEST command
curl -X POST http://localhost:5000/api/control \
  -d '{"command":"TEST"}'
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Email addresses are case-insensitive but stored as-is
- Gas threshold is configurable in `.env` (default: 870)
- MQTT connection uses TLS 1.2 (secure)
- Frontend polling interval: 2 seconds (configurable)
