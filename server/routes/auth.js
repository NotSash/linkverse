const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validate,
  signupValidation,
  loginValidation,
  otpValidation,
  resetPasswordValidation,
} = require('../middleware/validate');

// POST /api/auth/signup
router.post('/signup', authLimiter, signupValidation, validate, authController.signup);

// POST /api/auth/verify-otp
router.post('/verify-otp', authLimiter, otpValidation, validate, authController.verifyOTP);

// POST /api/auth/resend-otp
router.post('/resend-otp', authLimiter, authController.resendOTP);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidation, validate, authController.login);

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

// GET /api/auth/check-username/:username
router.get('/check-username/:username', authController.checkUsername);

// GET /api/auth/me (protected)
router.get('/me', auth, authController.getMe);

module.exports = router;