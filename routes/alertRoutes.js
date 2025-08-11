const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// POST - יצירת התראה חדשה
router.post('/', async (req, res) => {
  try {
    const { type, description, timestamp, title } = req.body;
    const alert = new Alert({ type, description, timestamp, title });
    await alert.save();
    res.status(201).json({ message: ' Alert saved', alert });
  } catch (err) {
    console.error(' Failed to save alert:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET - קבלת כל ההתראות
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

module.exports = router;
