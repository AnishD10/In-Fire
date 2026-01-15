# System Design & Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                   │
│         (React + Vite + TailwindCSS)                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Dashboard | ControlPanel | SubscribeForm | Alerts│   │
│  └──────────────────────────────────────────────────┘   │
│                        ↑ ↓ (REST HTTP)                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│        (Node.js + Express + MQTT + Nodemailer)          │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routes     │  │   Services   │  │    MQTT      │  │
│  │              │  │              │  │   Client     │  │
│  │ - gasRoutes  │  │ - emailSvc   │  │              │  │
│  │ - controlRts │  │ - alertSvc   │  │ - Subscribe  │  │
│  │ - subRts     │  │              │  │ - Publish    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│        ↑                  ↓                   ↑          │
│        └──────────────────┼───────────────────┘          │
│                           ↓ (Global State)               │
│                    gasReading Object                     │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   MESSAGE LAYER                          │
│              (HiveMQ Cloud MQTT Broker)                  │
│                                                          │
│  Topics:                                                 │
│  ├─ LPG/gas/value (ESP32 → Backend)                     │
│  ├─ LPG/gas/status (ESP32 → Backend)                    │
│  └─ LPG/system/control (Backend → ESP32)                │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   DEVICE LAYER                           │
│              (ESP32 MicroPython)                         │
│                                                          │
│  ├─ MQ-2 Gas Sensor (ADC Pin 34)                        │
│  ├─ WiFi Connection                                      │
│  ├─ Actuators: LEDs, Relay, Servo, Buzzer               │
│  └─ MQTT Publisher/Subscriber                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Backend Architecture

### Component Diagram

```
                    ┌─────────────────┐
                    │   Express App   │
                    │   (server.js)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼────┐         ┌──────▼──────┐       ┌────▼───┐
    │ Routes │         │  Middleware │       │ MQTT   │
    │        │         │             │       │Client  │
    │ ├─ gas │         │ ├─ CORS     │       │        │
    │ ├─ ctrl│         │ ├─ bodyPr.  │       │ HiveMQ │
    │ └─ sub │         │ └─ error    │       │ Cloud  │
    └────┬───┘         └─────┬───────┘       └────┬───┘
         │                   │                     │
    ┌────▼───────────────────▼──────────────┬─────▼────┐
    │         Data Store                     │ Global   │
    │  ┌──────────────────────────────────┐ │ State    │
    │  │  subscribers.json                │ │          │
    │  │  [                               │ │ gasRead. │
    │  │    {email, subscribedAt},        │ │  │value │
    │  │    ...                           │ │  │status │
    │  │  ]                               │ │ │timestr │
    │  └──────────────────────────────────┘ └──────────┘
    │         ↓ ↑ (File I/O)
    │  Services Layer
    │  ├─ emailService.js
    │  └─ alertService.js
    │
    └──────────────┬──────────────┐
                   │              │
              ┌────▼──────┐  ┌────▼──────┐
              │ Nodemailer │  │ File Sys  │
              │ (Gmail)    │  │ (Node.js) │
              └────────────┘  └───────────┘
```

### Data Flow

```
INBOUND (ESP32 → Backend):

ESP32 publishes
      ↓
MQTT Topic received
      ↓
mqttClient.on('message')
      ↓
Parse payload (gasValue or status)
      ↓
Update global: gasReading = { value, status, timestamp }
      ↓
Check threshold: if value > THRESHOLD
      ↓
  YES: Send alert emails to all subscribers
       for each subscriber in getSubscribers()
           sendAlertEmail(email, message)
      ↓
      NO: Just update gasReading


OUTBOUND (Backend → Frontend):

GET /api/gas/latest
      ↓
getGasReading() from global state
      ↓
Return JSON response
      ↓
Frontend receives + updates UI


CONTROL (Frontend → Backend → ESP32):

User clicks button (ON/OFF/TEST)
      ↓
POST /api/control with command
      ↓
Validate command
      ↓
publishControl(command) to MQTT
      ↓
Topic: LPG/system/control
Payload: command value
      ↓
ESP32 subscribes and executes
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
                      ┌──────────────┐
                      │   App.jsx    │
                      │  (Root)      │
                      └──────┬───────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼─────┐      ┌───────▼──────┐      ┌────▼────────┐
    │ Header  │      │   Main       │      │   Footer    │
    │(Static) │      │ (Grid Cont.) │      │  (Static)   │
    └─────────┘      └───────┬──────┘      └─────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼──────────┐   ┌─────▼──────┐      ┌────▼────────┐
   │  Dashboard    │   │ Control    │      │ Subscribe   │
   │               │   │ Panel      │      │ Form        │
   │ - Gas value   │   │            │      │             │
   │ - Status      │   │ - ON btn   │      │ - Email in  │
   │ - Progress    │   │ - OFF btn  │      │ - Submit    │
   │ - Alerts      │   │ - TEST btn │      │ - Features  │
   └────┬──────────┘   └────────────┘      └─────────────┘
        │
   ┌────▼──────────────────────────┐
   │    Alerts Component            │
   │  (Toast Notifications)         │
   │  - Fixed position              │
   │  - Auto-dismiss                │
   └───────────────────────────────┘
```

### State Management

```
App.jsx (Main State)
│
├─ gasData: {value, status, timestamp}
│   └─ Updated: every 2 seconds via polling
│   └─ Passed to: Dashboard component
│
├─ alerts: [{id, message, type}]
│   └─ Updated: by user actions
│   └─ Passed to: Alerts component
│
├─ loading: boolean
│   └─ Updated: during API calls
│   └─ Passed to: Dashboard component
│
└─ error: string
    └─ Updated: on API errors
    └─ Displayed: error banner
```

### API Service Layer

```
services/api.js
│
├─ getLatestReading()
│  └─ GET /api/gas/latest
│
├─ sendControl(command)
│  └─ POST /api/control
│
├─ subscribe(email)
│  └─ POST /api/subscribe
│
├─ getSubscribers()
│  └─ GET /api/subscribe/list
│
└─ unsubscribe(email)
   └─ DELETE /api/subscribe/:email
```

---

## 🔄 Complete System Flow

### Scenario: Gas Leakage Detection & Alert

```
1️⃣ SENSOR READING (ESP32)
   Time: T+0ms
   ├─ MQ-2 sensor detects high gas
   ├─ ADC reads: 925
   ├─ Publishes: LPG/gas/value = 925
   └─ Publishes: LPG/gas/status = GAS_DETECTED

2️⃣ MQTT DELIVERY (HiveMQ)
   Time: T+100ms
   ├─ Message routed to broker
   └─ Delivered to all subscribers

3️⃣ BACKEND PROCESSING
   Time: T+200ms
   ├─ Backend MQTT client receives
   ├─ Updates: gasReading.value = 925
   ├─ Updates: gasReading.status = GAS_DETECTED
   ├─ Checks: 925 > 870? YES
   └─ Retrieves: getSubscribers() → [user1@..., user2@...]

4️⃣ EMAIL ALERTS
   Time: T+500ms - T+5s
   ├─ For each subscriber:
   │  ├─ Create HTML email
   │  ├─ Send via Nodemailer/Gmail SMTP
   │  ├─ Log success/failure
   │  └─ Typical: 1-3 seconds per email
   └─ Subscribers receive emails

5️⃣ FRONTEND POLLING
   Time: T+2s (scheduled)
   ├─ Timer triggers: GET /api/gas/latest
   ├─ Backend returns: gasReading object
   ├─ Frontend updates state: gasData = response
   ├─ React re-renders with new data
   └─ UI updates: Dashboard shows RED alert

6️⃣ USER NOTIFICATION
   Time: T+2.5s
   ├─ Dashboard background turns RED
   ├─ Status indicator pulses RED
   ├─ Progress bar shows 100%
   ├─ Toast notification: "⚠️ GAS LEAKAGE DETECTED!"
   └─ User sees critical alert

7️⃣ USER ACTION
   Time: T+5s (user response)
   ├─ User clicks "ON" / "OFF" / "TEST" button
   ├─ Frontend: POST /api/control {command: "ON"}
   ├─ Toast: "✓ Command 'ON' sent successfully"
   └─ User feedback immediate

8️⃣ BACKEND EXECUTION
   Time: T+5.1s
   ├─ Backend receives control command
   ├─ Validates: command in [ON, OFF, TEST]
   ├─ Publishes: Topic: LPG/system/control, Payload: ON
   ├─ Updates: systemStatus = ON
   └─ Logs: "✓ Published control command: ON"

9️⃣ ESP32 RESPONSE
   Time: T+5.2s
   ├─ ESP32 receives MQTT message
   ├─ Parses: command = "ON"
   ├─ Executes:
   │  ├─ relay.on() → Circuit activated
   │  ├─ green.on(), red.off() → Green LED on
   │  ├─ buzzer.off() → Silence buzzer
   │  └─ set_angle(0) → Servo returns to 0°
   └─ System normalized

🔟 NEXT POLL CYCLE
   Time: T+7.2s (2 seconds later)
   ├─ Frontend polls: GET /api/gas/latest
   ├─ Backend returns: updated gasReading
   ├─ Sensor shows normal level (e.g., 450)
   ├─ gasData.status = NORMAL
   ├─ UI updates: Dashboard turns GREEN
   └─ User sees: ✅ Gas Level Normal
```

---

## 🔐 Security Architecture

### Security Layers

```
1. TRANSPORT LAYER
   ├─ MQTT: TLS 1.2 (port 8883)
   ├─ REST API: HTTP (upgrade to HTTPS in production)
   └─ Email: TLS via SMTP (Gmail)

2. AUTHENTICATION LAYER
   ├─ MQTT: Username/Password (HiveMQ)
   ├─ Email: Gmail App Password (2FA required)
   └─ API: Currently public (add JWT in production)

3. DATA VALIDATION
   ├─ Email format validation
   ├─ Command whitelist validation
   ├─ MQTT payload type checking
   └─ Input sanitization

4. STORAGE LAYER
   ├─ subscribers.json: Local file (no encryption)
   ├─ gasReading: In-memory (ephemeral)
   ├─ .env: Environment variables (never committed)
   └─ Sensitive data: Never logged to console
```

### Recommended Production Enhancements

```javascript
// 1. Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// 2. Add input validation
const { body, validationResult } = require('express-validator');
app.post('/api/subscribe',
  body('email').isEmail(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors });
    // Process...
  }
);

// 3. Add HTTPS enforcement
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// 4. Add JWT authentication
const jwt = require('jsonwebtoken');
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// 5. Add database instead of JSON file
// Use MongoDB, PostgreSQL, or Firebase for production
```

---

## 🧪 Testing Strategy

### Unit Tests (Backend)

```javascript
// alertService.test.js
test('addSubscriber - adds new subscriber', () => {
  const result = addSubscriber('test@example.com');
  expect(result.success).toBe(true);
  expect(getSubscribers()).toContainEqual(
    expect.objectContaining({email: 'test@example.com'})
  );
});

test('addSubscriber - prevents duplicates', () => {
  addSubscriber('test@example.com');
  const result = addSubscriber('test@example.com');
  expect(result.success).toBe(false);
  expect(result.error).toContain('already subscribed');
});

// emailService.test.js
test('sendAlertEmail - creates proper HTML', async () => {
  const mockTransporter = {
    sendMail: jest.fn()
  };
  await sendAlertEmail('test@example.com', 'Test alert');
  expect(mockTransporter.sendMail).toHaveBeenCalled();
});
```

### Integration Tests (API)

```javascript
describe('POST /api/control', () => {
  test('accepts valid ON command', async () => {
    const res = await request(app)
      .post('/api/control')
      .send({command: 'ON'});
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.command).toBe('ON');
  });

  test('rejects invalid command', async () => {
    const res = await request(app)
      .post('/api/control')
      .send({command: 'INVALID'});
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/subscribe', () => {
  test('subscribes valid email', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .send({email: 'test@example.com'});
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/subscribe')
      .send({email: 'invalid-email'});
    
    expect(res.status).toBe(400);
  });
});
```

### E2E Tests (Frontend)

```javascript
describe('Dashboard Component', () => {
  test('displays gas reading', () => {
    const gasData = {value: 450, status: 'NORMAL'};
    render(<Dashboard gasData={gasData} loading={false} />);
    
    expect(screen.getByText('450')).toBeInTheDocument();
  });

  test('shows alert when gas detected', () => {
    const gasData = {value: 950, status: 'GAS_DETECTED'};
    render(<Dashboard gasData={gasData} loading={false} />);
    
    expect(screen.getByText('ALERT')).toBeInTheDocument();
    expect(screen.getByText(/GAS LEAKAGE DETECTED/)).toBeInTheDocument();
  });
});
```

---

## 📈 Scaling Considerations

### Current Architecture (Single Instance)
- ✅ Good for: Development, small deployments
- ⚠️ Limitation: Single point of failure

### Scaling to Multiple Backends

```
                    ┌──────────────┐
                    │ Load Balancer│
                    └──────┬───────┘
                           │
        ┌────────────┬─────┼─────┬────────────┐
        │            │           │            │
    ┌───▼──┐    ┌──▼──┐    ┌───▼───┐   ┌──▼──┐
    │BE #1 │    │BE #2│    │ BE #3 │   │BE #4│
    └───┬──┘    └──┬──┘    └───┬───┘   └──┬──┘
        │         │            │          │
        └─────────┼────────────┼──────────┘
                  │
        ┌─────────▼──────────┐
        │  Shared Database   │
        │  (MongoDB/PG)      │
        └────────────────────┘

- All backends subscribe to same MQTT topics
- Shared database for subscribers.json
- Load balancer distributes REST API calls
- Messages persisted to database
```

### Scaling Email Delivery

```
Current: Direct SMTP
├─ Bottleneck: 1-3s per email
├─ Max: ~20 emails/minute
└─ Issue: Blocks on network I/O

Improved: Message Queue
├─ Tool: Redis or AWS SQS
├─ Process: Send → Queue → Worker processes
├─ Benefits: Non-blocking, scalable
└─ Max: 100+ emails/minute
```

---

## 📊 Monitoring & Observability

### Logging Strategy

```javascript
// Implement structured logging
const logger = require('winston');

logger.info('MQTT Connected', {
  timestamp: new Date(),
  component: 'mqtt',
  host: MQTT_HOST
});

logger.warn('Email send failed', {
  timestamp: new Date(),
  email: 'user@example.com',
  error: err.message
});

logger.error('Critical error', {
  timestamp: new Date(),
  stack: err.stack,
  context: 'API request'
});
```

### Metrics to Monitor

```
Backend:
- ✅ MQTT connection status
- ✅ Messages received/published count
- ✅ Emails sent success rate
- ✅ API response times
- ✅ Gas threshold breach events
- ✅ Subscriber count
- ✅ Error rates

Frontend:
- ✅ Page load time
- ✅ API call latency
- ✅ Component render time
- ✅ User interactions
- ✅ Error tracking
- ✅ Browser compatibility

Device:
- ✅ ESP32 uptime
- ✅ WiFi signal strength
- ✅ MQTT publish success rate
- ✅ Sensor reading frequency
```

---

## 🎓 Key Design Patterns Used

### 1. **Observer Pattern (MQTT)**
- Backend subscribes to sensor topics
- Notified when data changes
- Decoupled communication

### 2. **Pub/Sub Pattern (Event-Driven)**
- ESP32 publishes readings
- Backend subscribes and processes
- Scales to multiple listeners

### 3. **Service Layer Pattern**
- Separation of concerns
- emailService, alertService
- Easy testing and maintenance

### 4. **Repository Pattern**
- Data access abstraction
- alertService.js for subscriber management
- Easy to switch storage (JSON → Database)

### 5. **Component Pattern (React)**
- Reusable UI components
- Dashboard, ControlPanel, SubscribeForm
- Composition over inheritance

### 6. **Middleware Pattern (Express)**
- CORS, body-parser, error handling
- Chainable request/response processing
- Clean separation of concerns

---

This architecture is:
- ✅ **Modular**: Easy to understand and modify
- ✅ **Scalable**: Can add more backends/features
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Reliable**: Error handling and logging
- ✅ **Real-time**: MQTT + polling for live updates
