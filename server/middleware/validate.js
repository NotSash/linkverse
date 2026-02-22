const { body, validationResult } = require('express-validator');
const { RESERVED_USERNAMES, CATEGORIES } = require('../utils/constants');

/**
 * Format and dedupe validation errors
 */
const formatErrors = (errors) => {
  const formatted = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
  }));

  // Keep only first error per field
  return formatted.filter(
    (error, index, self) =>
      index === self.findIndex((e) => e.field === error.field)
  );
};

/**
 * Validate middleware — supports two patterns:
 *
 * Pattern 1: router.post('/login', loginValidation, validate, controller)
 * Pattern 2: router.put('/profile', validate(updateProfileValidation), controller)
 */
const validate = (validationsOrReq, res, next) => {
  // Pattern 2: Called as validate(validations) — returns middleware
  if (Array.isArray(validationsOrReq)) {
    return async (req, res, next) => {
      for (const validation of validationsOrReq) {
        await validation.run(req);
      }
      const errors = validationResult(req);
      if (errors.isEmpty()) return next();
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatErrors(errors),
      });
    };
  }

  // Pattern 1: Called as middleware directly
  const req = validationsOrReq;
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: formatErrors(errors),
  });
};

// ─── Reusable: reserved username check ───────────────────────────────
const checkReservedUsername = (value) => {
  if (RESERVED_USERNAMES.includes(value.toLowerCase())) {
    throw new Error('This username is reserved. Please choose a different one.');
  }
  return true;
};

// ─── Reusable: password rules ────────────────────────────────────────
const passwordRules = (field = 'password') => [
  body(field)
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

// ─── Reusable: username rules ────────────────────────────────────────
const usernameRules = (fieldName = 'username') => [
  body(fieldName)
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z][a-z0-9_]*$/).withMessage('Username must start with a letter and contain only lowercase letters, numbers, and underscores')
    .custom(checkReservedUsername),
];

// ============================================
// VALIDATION CHAINS
// ============================================

const signupValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s.'-]+$/).withMessage('Full name can only contain letters, spaces, dots, apostrophes, and hyphens'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian mobile number'),

  ...usernameRules(),
  ...passwordRules(),

  body('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage('Invalid category selected'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s.'-]+$/).withMessage('Full name can only contain letters, spaces, dots, apostrophes, and hyphens'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 160 }).withMessage('Bio cannot exceed 160 characters'),

  body('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage('Invalid category selected'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('City name cannot exceed 50 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('State name cannot exceed 50 characters'),
];

const addLinkValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Link title is required')
    .isLength({ max: 80 }).withMessage('Link title cannot exceed 80 characters'),

  body('url')
    .trim()
    .notEmpty().withMessage('Link URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL (must start with http:// or https://)'),

  body('platform').optional().trim(),
  body('icon').optional().trim(),
];

const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 3, max: 100 }).withMessage('Subject must be between 3 and 100 characters'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  ...passwordRules('newPassword'),

  body('newPassword')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),

  ...passwordRules(),
];

const otpValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
];

const usernameValidation = [...usernameRules()];

const seoValidation = [
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 }).withMessage('Meta title cannot exceed 60 characters'),

  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 }).withMessage('Meta description cannot exceed 160 characters'),
];

module.exports = {
  validate,
  signupValidation,
  loginValidation,
  updateProfileValidation,
  addLinkValidation,
  contactValidation,
  changePasswordValidation,
  resetPasswordValidation,
  otpValidation,
  usernameValidation,
  seoValidation,
};