const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Auth Rate Limiter — strict for login/signup/forgot-password
 * Production: 10 requests per 15 minutes
 * Development: 50 requests per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 50 : 10,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});

/**
 * General API Rate Limiter — applied to all /api routes
 * Production: 200 requests per minute
 * Development: 1000 requests per minute
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: isDev ? 1000 : 200,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again in a moment.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Note: req.user is NOT available here — rate limiter runs before auth middleware
    // So we always use IP-based limiting
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});

/**
 * OTP Rate Limiter — strict to prevent OTP spam
 * Production: 3 requests per 10 minutes
 * Development: 10 requests per 10 minutes
 */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isDev ? 10 : 3,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait 10 minutes before trying again.',
    retryAfter: '10 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email;
    if (email) return `otp_${email.toLowerCase()}`;
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});

/**
 * Public profile rate limiter — lenient for public pages
 * 300 requests per minute per IP
 */
const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests. Please try again shortly.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
  otpLimiter,
  publicLimiter,
};