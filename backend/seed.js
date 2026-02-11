import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import connectDB from "./src/config/db.js";
import "dotenv/config";

// Connect to DB
connectDB();

const importData = async () => {
  try {
    // 1. Wipe the database clean (optional, but good for testing)
    await User.deleteMany(); 

    // 2. Create a dummy user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123', // This will be encrypted automatically by your User.js code!
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
    console.log('🔑 Password encrypted as:', user.password); // Verify encryption worked
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();