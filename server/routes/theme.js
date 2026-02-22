/**
 * Theme/Appearance Routes — server/routes/theme.js
 *
 * GET theme: Any logged-in user (needed for preview)
 * PUT theme: PRO ONLY — customization requires subscription
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { subscription } = require('../middleware/subscription');
const themeController = require('../controllers/themeController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP, GIF) are allowed.'), false);
    }
  },
});

// GET — any authenticated user can view their theme
router.get('/', auth, themeController.getTheme);

// PUT — Pro only: customization requires subscription
router.put(
  '/',
  auth,
  subscription,
  upload.single('backgroundImage'),
  themeController.updateTheme
);

module.exports = router;