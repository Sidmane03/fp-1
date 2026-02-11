import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // You need to install this: npm install cors
import connectDB from './config/db.js'; // NOTE: The .js extension is REQUIRED here

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Initialize Express
const app = express();

// 4. Middleware
app.use(cors());
app.use(express.json());

// 5. Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});