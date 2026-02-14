/**
 * 404 handler — catches requests to undefined routes.
 * Place this AFTER all your route definitions.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler — all errors funnel here.
 * Place this as the LAST middleware in server.js.
 */
const errorHandler = (err, req, res, next) => {
  // Fix: if status is still 200 (default), override to 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // --- Mongoose: Bad ObjectId (CastError) ---
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource not found (invalid ID)';
  }

  // --- Mongoose: Duplicate Key (e.g., email already exists) ---
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for: ${field}`;
  }

  // --- Mongoose: Validation Error ---
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
  }
  // --- Custom statusCode on error object ---
  if (err.statusCode) {
    statusCode = err.statusCode;
  }
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export { notFound, errorHandler };