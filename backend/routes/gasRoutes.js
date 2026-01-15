import express from 'express';
import { getGasReading } from '../mqtt/mqttClient.js';

const router = express.Router();

// ==========================================
// GET /api/gas/latest
// ==========================================
router.get('/latest', (req, res) => {
  try {
    const reading = getGasReading();
    res.json({
      success: true,
      data: reading,
      message: 'Latest gas reading retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
