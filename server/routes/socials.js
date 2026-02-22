/**
 * Social Links Routes — server/routes/socials.js
 *
 * GET: Any logged-in user
 * PUT: Any user (free users limited to 3 platforms by controller)
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const socialController = require('../controllers/socialController');

router.get('/', auth, socialController.getSocialLinks);
router.put('/', auth, socialController.updateSocialLinks);

module.exports = router;