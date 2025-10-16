const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const alertRoutes = require('./routes/alertRoutes');
const mainRoutes = require('./routes/mainRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// EJS setup
app.set('view engine', 'ejs');
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('views', path.join(__dirname, 'views'));

// Health check
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// API routes
app.use('/api/alerts', alertRoutes);

// Pages
app.use('/', mainRoutes);

// Attach Socket.IO to app for routes
app.set('io', io);

// Socket.IO connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join', (userId) => {
    console.log(`Socket ${socket.id} joined room ${userId}`);
    socket.join(userId);
  });
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alertx';
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Start server with Socket.IO
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
  console.log(`Open from this computer: http://localhost:${PORT}`);
  console.log(`[ENV] MONGO_URI = ${process.env.MONGO_URI}`);
  console.log(`[ENV] PORT = ${process.env.PORT}`);
});