const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// דף הבית
router.get('/', (req, res) => {
  res.render('home', { title: 'AlertX - דף הבית' });
});

// פונקציית עזר להימנע מבעיות ברג'קס
function escapeRegExp(s = '') {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/alerts', async (req, res, next) => {
  try {
    const { q, type, status, page = 1, limit = 20 } = req.query;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const parsedPage  = Math.max(parseInt(page, 10) || 1, 1);

    const filter = {};
    if (type)   filter.type   = String(type);
    if (status) filter.status = String(status);

    if (q) {
      const safe = escapeRegExp(q);
      filter.$or = [
        { title:       { $regex: safe, $options: 'i' } },
        { description: { $regex: safe, $options: 'i' } },
      ];
    }

    // ✅ FIXED: define alerts and total using Promise.all
    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit),
      Alert.countDocuments(filter),
    ]);

    res.render('alerts', {
      title: 'AlertX - התראות',
      alerts,
      q: q || '',
      type: type || '',
      status: status || '',
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
        total
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
