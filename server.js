// server.js
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');

const alertRoutes = require('./routes/alertRoutes');
const mainRoutes = require('./routes/mainRoutes');

const app = express();
const server = http.createServer(app);

/* ===== Security & app basics ===== */
app.set('trust proxy', 1);             // שימושי כשמאחורי פרוקסי (Render)
app.use(helmet());                      // כותרות אבטחה
app.use(morgan('dev'));

/* ===== CORS (מה-ENV) ===== */
const allowed = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

/* ===== Body & static ===== */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/* ===== Views (EJS + layouts) ===== */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

/* ===== Rate limit עדין ל-API ===== */
app.use('/api', rateLimit({ windowMs: 60_000, max: 300 }));

/* ===== Health ===== */
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

/* ===== Routes ===== */
app.use('/api/alerts', alertRoutes);
app.use('/', mainRoutes);

/* ===== Socket.IO ===== */
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS (socket)'));
    },
    credentials: true
  }
});

// חשיפת io לראוטים (אם צריך)
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join', (userId) => {
    console.log(`Socket ${socket.id} joined room ${userId}`);
    socket.join(userId);
  });
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

/* ===== MongoDB ===== */
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alertx';
mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB || 'alertx' })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

/* ===== Start server ===== */
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
});
