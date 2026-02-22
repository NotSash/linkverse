/**
 * Analytics Routes — server/routes/analytics.js
 *
 * PRO ONLY — All analytics routes require active subscription
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { subscription } = require('../middleware/subscription');
const analyticsController = require('../controllers/analyticsController');

// All analytics routes require auth + pro subscription
router.get('/overview', auth, subscription, analyticsController.getOverview);
router.get('/views', auth, subscription, analyticsController.getViews);
router.get('/clicks', auth, subscription, analyticsController.getClicks);
router.get('/top-links', auth, subscription, analyticsController.getTopLinks);
router.get('/referrers', auth, subscription, analyticsController.getReferrers);

module.exports = router;