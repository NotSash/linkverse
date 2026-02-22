/**
 * Global Error Handler Middleware
 * Must be registered LAST (after all routes) in server.js
 */

const errorHandler = (err, req, res, _next) => {
  // Log error for debugging
  console.error('❌ Error:', {
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = null;

  // Malformed JSON in request body
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400)) {
    statusCode = 400;
    message = 'Invalid JSON in request body.';
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.keys(err.errors).map((field) => ({
      field,
      message: err.errors[field].message,
    }));
  }

  // Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `Duplicate value for ${field}. This ${field} is already in use.`;
    errors = [{ field, message: `"${value}" is already taken. Please use a different ${field}.` }];
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errors = [{ field: err.path, message: `Invalid value for ${err.path}` }];
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // Multer Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Maximum size is 5MB.';
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files. Only one file is allowed.';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field. Please check the upload field name.';
  }

  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.message || 'File upload error.';
  }

  // Razorpay Errors
  if (err.error?.description) {
    statusCode = err.statusCode || 400;
    message = err.error.description || 'Payment processing error.';
  }

  // Custom AppError
  if (err.statusCode && err.statusCode !== 500) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // In production, don't expose internal error messages for 500s
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      errorName: err.name,
      errorCode: err.code,
    }),
  });
};

/**
 * Custom Error Class with status code
 * Usage: throw new AppError('User not found', 404)
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async Error Wrapper
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, AppError, asyncHandler };