import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }

  // --- Connection Event Listeners (useful in production) ---
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB error: ${err.message}`);
  });
};

// --- Graceful Shutdown ---
const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed');
};

export { connectDB, disconnectDB };