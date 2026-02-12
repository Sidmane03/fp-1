import app from "./app.js"; // <--- Import the app you configured in app.js
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// 1. Load config
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Start the Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});