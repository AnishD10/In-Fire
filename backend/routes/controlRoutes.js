import express from 'express';
import { publishControl, setSystemStatus } from '../mqtt/mqttClient.js';

const router = express.Router();

// ==========================================
// POST /api/control
// ==========================================
router.post('/', (req, res) => {
  try {
    const { command } = req.body;

    // Validate command - supports all 15+ commands
    const validCommands = [
      // System commands
      'ON', 'OFF', 'TEST',
      // Relay commands
      'RELAY_ON', 'RELAY_OFF',
      // Servo commands
      'SERVO_0', 'SERVO_90', 'SERVO_180',
      // LED commands
      'LED_GREEN', 'LED_RED', 'LED_OFF',
      // Buzzer commands
      'BUZZER_ON', 'BUZZER_OFF',
      // Scenario commands
      'ALERT_MODE', 'NORMAL_MODE', 'SERVO_WITH_FAN'
    ];
    
    if (!validCommands.includes(command)) {
      return res.status(400).json({
        success: false,
        error: `Invalid command. Valid commands: ${validCommands.join(', ')}`
      });
    }

    // Publish to MQTT
    publishControl(command);
    setSystemStatus(command);

    res.json({
      success: true,
      message: `Control command '${command}' sent successfully`,
      command: command,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
