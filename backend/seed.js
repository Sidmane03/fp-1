import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import connectDB from "./src/config/db.js";
import "dotenv/config";

// Connect to DB and Import Data
const runSeed = async () => {
  try {
    await connectDB();

    // Safeguard: Do not run in production unless explicitly allowed
    if (process.env.NODE_ENV === 'production' && process.env.SEED_ALLOW !== 'true') {
      console.error('❌ Error: Seeding is blocked in production environment. Set SEED_ALLOW=true to override.');
      process.exit(1);
    }

    await importData();
  } catch (error) {
    console.error(`❌ Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    // 1. Wipe the database clean (optional, but good for testing)
    await User.deleteMany(); 

    // 2. Create a dummy user
    const user = new User({
      name: 'Test User 3',
      email: 'test3@example.com',
      password: 'password321', // This will be encrypted automatically by your User.js code!
      role: 'user',
      gender: 'male',
      age: 25,
      height: 175,
      weight: 70,
      activityLevel: 'moderate',
      goal: 'maintain',
    });

    // 3. Save to MongoDB
    await user.save();

    console.log('✅ Data Imported Successfully!');
    // Removed sensitive password logging
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

runSeed();