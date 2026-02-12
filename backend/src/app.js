import express from 'express';
import cors from 'cors';
import testRoutes from './routes/test.routes.js';
import userRoutes from './routes/user.routes.js'; // Import User Routes
import { errorHandler } from './middlewares/errorMiddleware.js'; // Import Error Handler

const app = express();

// --- Middleware ---
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json()); // Allows server to read JSON body

// --- Routes ---
app.use('/api', testRoutes);
app.use('/api/users', userRoutes); // Mount User Routes

// --- Error Handler (MUST come after routes) ---
app.use(errorHandler); // Activate Error Handler

app.get('/health', (req, res) => {
  res.json({ status: 'backend running' });
});

export default app;