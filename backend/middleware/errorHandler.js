/**
 * middleware/errorHandler.js — Centralized Express error handler
 * Catches all errors thrown/passed via next(err) and returns a clean JSON response.
 */

const errorHandler = (err, req, res, next) => {
  // Log to console (replace with a proper logger in production, e.g. winston/pino)
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);
  if (process.env.NODE_ENV === "development") console.error(err.stack);

  // Multer file errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: `File too large. Max ${process.env.MAX_FILE_SIZE_MB || 5} MB.` });
  }

  // Validation errors from express-validator are handled inline in controllers.
  // This catches anything else that slips through.
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
