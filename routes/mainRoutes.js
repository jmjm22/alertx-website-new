const express = require('express');
const router = express.routes ();
const mainController = require('../controllers/mainController');

router.get('/', mainController.getHomePage);
router.get('/features', mainController.getFeaturesPage);
router.get('/contact', mainController.getContactPage);

module.exports = router;
