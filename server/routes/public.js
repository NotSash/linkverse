/**
 * Public Routes — server/routes/public.js
 *
 * Public-facing routes — no authentication required.
 * - Get public profile
 * - Log page views
 * - Log link clicks
 */

const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// GET /:username — Public profile data
router.get('/:username', publicController.getPublicProfile);

// POST /:username/view — Log page view
router.post('/:username/view', publicController.logView);

// POST /:username/click/:linkId — Log link click
router.post('/:username/click/:linkId', publicController.logClick);

module.exports = router;