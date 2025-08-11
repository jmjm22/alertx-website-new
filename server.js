require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

const mainRoutes = require('./routes/mainRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// אבטחה ולוגים
app.use(helmet());
app.use(morgan('dev'));

// CORS – קונפיגורציה מדויקת לדומיינים שלך
const allowed = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// הגבלת קצב בסיסית
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 });
app.use(limiter);

// פרסינג
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// סטטיים + EJS (לא חובה אם אין לך דפי תצוגה)
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// בריאות ושורש
app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.get('/', (req, res) => {
  // אם אין לך EJS, אפשר להחזיר טקסט:
  // return res.send('AlertX API is running');
  res.render('home', { title: 'AlertX', subtitle: 'Emergency Management API' });
});

// ראוטים
app.use('/api', apiRoutes);
app.use('/', mainRoutes);

// 404
app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// שגיאות
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ success: false, error: err.message || 'Server error' });
});

// חיבור למסד ו-listen
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI; // Atlas/ענן

;(async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: process.env.MONGO_DB || 'alertx' });
    console.log(' Mongo connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (e) {
    console.error(' DB connection failed:', e.message);
    process.exit(1);
  }
})();
