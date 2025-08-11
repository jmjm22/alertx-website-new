const Alert = require('../models/Alert');

async function createAlert(req, res, next) {
  try {
    const { type, title, description, timestamp, lat, lng, status, userId } = req.body;
    const alert = await Alert.create({ type, title, description, timestamp, lat, lng, status, userId });
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
}

async function listAlerts(req, res, next) {
  try {
    const { q, type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    let query = Alert.find(filter).sort({ createdAt: -1 });
    if (q) query = query.find({ $text: { $search: q } });
    const alerts = await query.exec();
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
}

async function getAlert(req, res, next) {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
}

async function updateAlert(req, res, next) {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!alert) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
}

module.exports = { createAlert, listAlerts, getAlert, updateAlert };
