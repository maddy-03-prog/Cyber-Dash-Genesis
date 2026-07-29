const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyber_dash');
    console.log(`[MONGODB ATLAS] Connected to Cluster: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MONGODB ERROR] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
