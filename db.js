const mongoose = require('mongoose');

let isConnected = false;

async function connectDB(uri) {
  if (isConnected) return;
  await mongoose.connect(uri, { dbName: 'alertx' });
  isConnected = true;
  console.log('MongoDB connected');
}

module.exports = { connectDB };
