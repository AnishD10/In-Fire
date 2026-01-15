import dotenv from 'dotenv';
import mqtt from 'mqtt';
import { sendAlertEmail } from '../services/emailService.js';
import { getSubscribers } from '../services/alertService.js';

dotenv.config();

// ==========================================
// Global State
// ==========================================
let gasReading = { value: 0, status: 'NORMAL', timestamp: new Date() };
let mqttClient = null;
let systemStatus = 'ON';

// ==========================================
// MQTT Configuration
// ==========================================
const MQTT_CONFIG = {
  host: process.env.MQTT_HOST || 'd9224a87ae11416ebdfea8fc7ef45621.s1.eu.hivemq.cloud',
  port: process.env.MQTT_PORT || 8883,
  username: process.env.MQTT_USER || 'LPG_Detection',
  password: process.env.MQTT_PASSWORD || 'Fire@101',
  clientId: process.env.MQTT_CLIENT_ID || 'backend-node-server-' + Date.now(),
  protocol: 'mqtts',
  rejectUnauthorized: false,
  reconnectPeriod: 1000
};

const MQTT_TOPICS = {
  gas_value: 'LPG/gas/value',
  gas_status: 'LPG/gas/status',
  control: 'LPG/system/control'
};

// ==========================================
// Initialize MQTT Connection
// ==========================================
export function initMQTT() {
  const connectUrl = `${MQTT_CONFIG.protocol}://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}`;
  
  console.log(`Connecting to MQTT: ${MQTT_CONFIG.host}:${MQTT_CONFIG.port}`);
  
  mqttClient = mqtt.connect(connectUrl, {
    username: MQTT_CONFIG.username,
    password: MQTT_CONFIG.password,
    clientId: MQTT_CONFIG.clientId,
    rejectUnauthorized: false
  });

  // ==========================================
  // Connection Event
  // ==========================================
  mqttClient.on('connect', () => {
    console.log('✓ Connected to HiveMQ Cloud!');
    
    // Subscribe to gas topics
    mqttClient.subscribe([
      MQTT_TOPICS.gas_value,
      MQTT_TOPICS.gas_status
    ], (err) => {
      if (err) {
        console.error('Subscription error:', err);
      } else {
        console.log('✓ Subscribed to MQTT topics');
      }
    });
  });

  // ==========================================
  // Message Event
  // ==========================================
  mqttClient.on('message', async (topic, message) => {
    const messageStr = message.toString();
    console.log(`[MQTT] ${topic}: ${messageStr}`);

    try {
      if (topic === MQTT_TOPICS.gas_value) {
        const value = parseInt(messageStr);
        gasReading.value = value;
        gasReading.timestamp = new Date();

        // Check if gas leakage is detected (Threshold: 1200)
        const THRESHOLD = process.env.GAS_THRESHOLD || 1200;
        if (value > THRESHOLD) {
          gasReading.status = 'GAS_DETECTED';
          console.log(`🚨 ALERT TRIGGERED! Gas value ${value} exceeds threshold ${THRESHOLD}`);
          
          // Send email alerts to all subscribers
          const subscribers = await getSubscribers();
          console.log(`📧 Subscribers found: ${subscribers.length}`);
          console.log(`Subscriber list:`, subscribers);
          
          if (subscribers.length > 0) {
            for (const subscriber of subscribers) {
              try {
                await sendAlertEmail(
                  subscriber.email,
                  `⚠️ GAS LEAKAGE DETECTED! Current Value: ${value} (Threshold: 1200) - IMMEDIATE ACTION REQUIRED!`
                );
                console.log(`✓ Alert email sent to ${subscriber.email}`);
              } catch (emailError) {
                console.error(`✗ Failed to send alert to ${subscriber.email}:`, emailError.message);
              }
            }
          } else {
            console.warn('⚠️ No subscribers found for alert');
          }
        } else {
          // Reset to NORMAL if below threshold
          if (gasReading.status === 'GAS_DETECTED') {
            console.log(`✅ Gas level returned to normal (${value} < 1200)`);
            gasReading.status = 'NORMAL';
          }
        }
      } else if (topic === MQTT_TOPICS.gas_status) {
        gasReading.status = messageStr;
      }
    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  });

  // ==========================================
  // Error & Disconnect Events
  // ==========================================
  mqttClient.on('error', (err) => {
    console.error('✗ MQTT Connection Error:', err);
  });

  mqttClient.on('disconnect', () => {
    console.warn('⚠️ MQTT Disconnected');
  });

  mqttClient.on('reconnect', () => {
    console.log('Attempting to reconnect to MQTT...');
  });
}

// ==========================================
// Getter Functions
// ==========================================
export function getGasReading() {
  return gasReading;
}

export function getSystemStatus() {
  return systemStatus;
}

// ==========================================
// Setter Functions
// ==========================================
export function setSystemStatus(status) {
  systemStatus = status;
}

// ==========================================
// Publisher Functions
// ==========================================
export function publishControl(command) {
  if (!mqttClient || !mqttClient.connected) {
    console.error('MQTT client not connected');
    return false;
  }

  mqttClient.publish(MQTT_TOPICS.control, command, (err) => {
    if (err) {
      console.error('Publish error:', err);
    } else {
      console.log(`✓ Published control command: ${command}`);
    }
  });

  return true;
}

export default { initMQTT, getGasReading, publishControl };
