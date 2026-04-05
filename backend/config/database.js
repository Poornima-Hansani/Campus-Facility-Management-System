// backend/config/database.js
const mongoose = require('mongoose');

const SRV_CONNECTION =
  'mongodb+srv://admin:XdoSMpFdzILRtDwY@cluster0.mxlvwfo.mongodb.net/FacilityManagement?retryWrites=true&w=majority';

const connectionOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(SRV_CONNECTION, connectionOptions);
    console.log('✅ MongoDB Connected');
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    process.exit(1);
  }
};

const getConnectionStatus = () => ({
  readyState: mongoose.connection.readyState,
  status: ['disconnected', 'connected', 'connecting', 'disconnecting'][
    mongoose.connection.readyState
  ],
});

module.exports = { connectDB, getConnectionStatus };