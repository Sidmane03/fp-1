import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB, disconnectDB } from './config/db.js';
import userRoutes from './routes/user.routes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

// --- Load env vars FIRST ---
dotenv.config();

// --- Initialize App ---
const app = express();

// --- Core Middleware ---
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

app.use(express.json());

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// --- Routes ---
app.use('/api/users', userRoutes);

// --- Error Handling (MUST be after routes) ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });

    // --- Graceful Shutdown ---
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();