/**
 * Contact Routes — server/routes/contact.js
 *
 * Public routes for contact form submissions.
 * Rate limited to prevent spam.
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { contactValidation, validate } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

// POST /api/contact — Submit contact/support form (public)
router.post(
  '/',
  apiLimiter,
  validate(contactValidation),
  contactController.submitContact
);

module.exports = router;