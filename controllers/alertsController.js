const Alert = require('../models/Alert'); 

// יצירת התראה חדשה
async function createAlert(req, res, next) {
  try {
    const { type, title, description,userName, timestamp,extraServices, phone, status, location, userId,city } = req.body;

    console.log('Received alert data:', req.body);

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }


    if (
      !location ||
      location.type !== 'Point' ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      typeof location.coordinates[0] !== 'number' ||
      typeof location.coordinates[1] !== 'number'
    ) {
      return res.status(400).json({ success: false, error: 'Invalid location format. Must be GeoJSON with coordinates [lng, lat]' });
    }

    const alert = await Alert.create({
      type,
      title,
      description,
      timestamp,
      status: status || 'new',
      userId,
      location,
      extraServices,
       city ,
        phone,
        userName,
    });

    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}


// שליפת רשימת התראות
async function listAlerts(req, res, next) {
  try {
    
    const { q, type, status,userId  } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    let query = Alert.find(filter).sort({ createdAt: -1 });
    if (q) query = query.find({ $text: { $search: q } });

    const alerts = await query.exec();
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
}

// שליפת התראה בודדת לפי ID
async function getAlert(req, res, next) {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
}

// עדכון התראה קיימת לפי ID
async function updateAlert(req, res, next) {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!alert) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
}

module.exports = { createAlert, listAlerts, getAlert, updateAlert };
