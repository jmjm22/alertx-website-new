const express = require('express');
const router = express.Router();
const { createAlert, listAlerts, getAlert, updateAlert } = require('../controllers/alertsController');

router.get('/alerts', listAlerts);
router.post('/alerts', createAlert);
router.get('/alerts/:id', getAlert);
router.patch('/alerts/:id', updateAlert);
router.put('/alerts/:id', updateAlert);

module.exports = router;
