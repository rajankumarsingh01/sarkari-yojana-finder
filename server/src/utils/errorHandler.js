// Custom error class so controllers can throw errors with a status code
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Central error handler — every error in the app ends up here
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  console.error(err.message);
  res.status(statusCode).json({
    error: err.message || "Something went wrong",
  });
}