/**
 * User Controller — server/controllers/userController.js
 *
 * Handles user profile management:
 * - Update profile info (name, bio, category, city, state)
 * - Update username (with validation and uniqueness check)
 * - Upload/update profile picture (via Cloudinary)
 * - Change password (FIXED: no double-hashing)
 * - Delete account (cascade delete related data)
 */

const User = require('../models/User');
const Payment = require('../models/Payment');
const OTP = require('../models/OTP');
const Contact = require('../models/Contact');
const cloudinary = require('../config/cloudinary');
const { RESERVED_USERNAMES, CATEGORIES } = require('../utils/constants');

/**
 * Helper: Extract Cloudinary public_id from URL for deletion
 */
const extractCloudinaryPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const urlParts = url.split('/');
    const linkverseIndex = urlParts.indexOf('linkverse');
    if (linkverseIndex === -1) return null;
    const folderPath = urlParts.slice(linkverseIndex).join('/');
    return folderPath.replace(/\.[^.]+$/, '');
  } catch {
    return null;
  }
};

/**
 * Helper: Delete a Cloudinary resource by URL (non-blocking, non-critical)
 */
const deleteCloudinaryImage = async (url) => {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn('⚠️ Could not delete Cloudinary image:', error.message);
  }
};

/**
 * Helper: Strip sensitive fields from user object
 */
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.__v;
  return obj;
};

/**
 * PUT /api/user/profile
 * Update profile info — name, bio, category, city, state
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio, category, city, state } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }

    if (bio !== undefined) {
      if (bio.length > 160) {
        return res.status(400).json({
          success: false,
          message: 'Bio cannot exceed 160 characters.',
        });
      }
      user.bio = bio.trim();
    }

    if (category !== undefined) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category selected.',
        });
      }
      user.category = category;
    }

    if (city !== undefined) {
      user.city = city.trim();
    }

    if (state !== undefined) {
      user.state = state.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    console.error('❌ Update profile error:', error.message);
    next(error);
  }
};

/**
 * PUT /api/user/username
 * Update username with validation and uniqueness check
 */
exports.updateUsername = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const normalizedUsername = username?.toLowerCase().trim();

    if (!normalizedUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is required.',
      });
    }

    // Validate username format: 3-30 chars, starts with letter, alphanumeric + underscore
    const usernameRegex = /^[a-z][a-z0-9_]{2,29}$/;
    if (!usernameRegex.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message:
          'Username must be 3-30 characters, start with a letter, and contain only lowercase letters, numbers, and underscores.',
      });
    }

    // Check against reserved usernames
    if (RESERVED_USERNAMES.includes(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message: 'This username is reserved. Please choose a different one.',
      });
    }

    // Skip DB check if username hasn't changed
    if (normalizedUsername === user.username) {
      return res.status(200).json({
        success: true,
        message: 'Username is unchanged.',
        data: {
          user: sanitizeUser(user),
          profileUrl: `linkverse.com/${normalizedUsername}`,
        },
      });
    }

    // Check uniqueness (exclude current user)
    const existingUser = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken.',
      });
    }

    user.username = normalizedUsername;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Username updated successfully!',
      data: {
        user: sanitizeUser(user),
        profileUrl: `linkverse.com/${normalizedUsername}`,
      },
    });
  } catch (error) {
    console.error('❌ Update username error:', error.message);
    next(error);
  }
};

/**
 * PUT /api/user/profile-picture
 * Upload/update profile picture via Cloudinary
 * Accepts multipart/form-data with field name 'profilePicture'
 */
exports.updateProfilePicture = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please upload an image.',
      });
    }

    // Convert buffer to base64 data URI for Cloudinary upload
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary with transformations
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: 'linkverse/profile-pictures',
      public_id: `user_${user._id}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'webp' },
      ],
      overwrite: true,
    });

    // Delete old profile picture from Cloudinary (fire-and-forget)
    if (user.profilePicture) {
      deleteCloudinaryImage(user.profilePicture);
    }

    // Update user's profile picture URL
    user.profilePicture = uploadResult.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully!',
      data: {
        user: sanitizeUser(user),
        imageUrl: uploadResult.secure_url,
      },
    });
  } catch (error) {
    console.error('❌ Upload profile picture error:', error.message);
    next(error);
  }
};

/**
 * PUT /api/user/password
 * Change password — requires current password verification
 *
 * IMPORTANT: We set the plain-text password and let the pre-save hook hash it.
 * Do NOT manually hash here — that causes double-hashing.
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Find user WITH password field (auth middleware excludes it via select: false)
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify current password using the model's instance method
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Check new password is different (compare plaintext to existing hash)
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password.',
      });
    }

    // Set plain-text password — the pre-save hook will hash it
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    console.error('❌ Change password error:', error.message);
    next(error);
  }
};

/**
 * DELETE /api/user/account
 * Permanently delete user account and all associated data
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Parallel cleanup of related data
    const [paymentsResult, otpsResult, contactsResult] = await Promise.all([
      Payment.deleteMany({ userId: user._id }),
      OTP.deleteMany({ email: user.email }),
      Contact.deleteMany({ email: user.email }),
    ]);

    console.log(
      `🗑️ Cascade delete for ${user.email}: ${paymentsResult.deletedCount} payments, ${otpsResult.deletedCount} OTPs, ${contactsResult.deletedCount} contacts`
    );

    // Delete Cloudinary images (fire-and-forget, non-blocking)
    const cloudinaryDeletions = [];
    if (user.profilePicture) {
      cloudinaryDeletions.push(deleteCloudinaryImage(user.profilePicture));
    }
    if (user.theme?.backgroundImage) {
      cloudinaryDeletions.push(deleteCloudinaryImage(user.theme.backgroundImage));
    }
    // Don't await — let them complete in background
    Promise.all(cloudinaryDeletions).catch(() => {});

    // Delete the user document
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: "Your account has been permanently deleted. We're sorry to see you go!",
    });
  } catch (error) {
    console.error('❌ Delete account error:', error.message);
    next(error);
  }
};