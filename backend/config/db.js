const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('<username>')) {
    throw new Error('MONGO_URI is not set. Copy .env.example to .env and add your MongoDB Atlas connection string.');
  }
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
  return conn;
}

module.exports = connectDB;
