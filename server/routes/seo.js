/**
 * SEO Routes — server/routes/seo.js
 *
 * PRO ONLY — SEO customization requires active subscription
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { subscription } = require('../middleware/subscription');
const seoController = require('../controllers/seoController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed.'), false);
    }
  },
});

// GET — Pro only: view SEO settings
router.get('/', auth, subscription, seoController.getSEO);

// PUT — Pro only: update SEO settings with optional OG image
router.put('/', auth, subscription, upload.single('ogImage'), seoController.updateSEO);

module.exports = router;