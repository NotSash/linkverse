/**
 * User Routes — server/routes/user.js
 *
 * Protected routes for user profile management.
 * All routes require authentication (auth middleware).
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');

const { auth } = require('../middleware/auth');
const {
  validate,
  updateProfileValidation,
  usernameValidation,
  changePasswordValidation,
} = require('../middleware/validate');
const userController = require('../controllers/userController');

// Configure multer for profile picture uploads (memory storage → Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP, GIF) are allowed.'), false);
    }
  },
});

// PUT /api/user/profile — Update profile info
router.put(
  '/profile',
  auth,
  validate(updateProfileValidation),
  userController.updateProfile
);

// PUT /api/user/username — Update username
router.put(
  '/username',
  auth,
  validate(usernameValidation),
  userController.updateUsername
);

// PUT /api/user/profile-picture — Upload/update profile picture
router.put(
  '/profile-picture',
  auth,
  upload.single('profilePicture'),
  userController.updateProfilePicture
);

// PUT /api/user/password — Change password
router.put(
  '/password',
  auth,
  validate(changePasswordValidation),
  userController.changePassword
);

// DELETE /api/user/account — Delete account permanently
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;