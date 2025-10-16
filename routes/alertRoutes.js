// routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');



router.post('/', async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      userId = '',
      userName,
      status,
      createdAtClient,
      timestamp,
      location,
      extraServices,
      city,
      phone,
    } = req.body || {};

    if (!type || !title)
      return res.status(400).json({ error: 'type and title are required' });


    if (location) {
      const isValidGeoJSON =
        location.type === 'Point' &&
        Array.isArray(location.coordinates) &&
        location.coordinates.length === 2 &&
        typeof location.coordinates[0] === 'number' &&
        typeof location.coordinates[1] === 'number';

      if (!isValidGeoJSON) {
        return res.status(400).json({ error: 'Invalid GeoJSON location format' });
      }
    }

    const alert = await Alert.create({
      type,
      title,
      description,
      status: status || 'new',
      createdAtClient: timestamp ? new Date(timestamp) : createdAtClient,
      userId,
      location,
      extraServices,
      city,
      userName,
      phone,
    });

    res.status(201).json(alert);
  } catch (e) {
    console.error('Create alert error:', e);
    res.status(400).json({ error: 'Failed to create alert' });
  }
});



router.get('/', async (req, res) => {
  try {
    const { userId } = req.query; 
    const filter = {};

    if (userId) filter.userId = userId; 

    const alerts = await Alert.find(filter).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (e) {
    console.error('Fetch alerts error:', e);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!alert) return res.status(404).json({ error: 'Alert not found' });

   
    const io = req.app.get('io');
    io.to(alert.userId).emit('alertUpdated', alert);

    res.json({ success: true, data: alert });
  } catch (e) {
    console.error('Update alert status error:', e);
    res.status(500).json({ error: 'Failed to update alert status' });
  }
});




module.exports = router;
