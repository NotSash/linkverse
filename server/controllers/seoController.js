/**
 * SEO Controller — server/controllers/seoController.js
 *
 * Handles meta title, description, and OG image
 * for better search engine and social media visibility.
 * PRO ONLY — enforced by subscription middleware on routes.
 */

const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

/**
 * Helper: Extract Cloudinary public_id from URL
 */
const extractCloudinaryPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const urlParts = url.split('/');
    const linkverseIndex = urlParts.indexOf('linkverse');
    if (linkverseIndex === -1) return null;
    return urlParts.slice(linkverseIndex).join('/').replace(/\.[^.]+$/, '');
  } catch {
    return null;
  }
};

/**
 * Helper: Delete Cloudinary image (fire-and-forget)
 */
const deleteCloudinaryImage = async (url) => {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('⚠️ Could not delete Cloudinary image:', err.message);
  }
};

/**
 * Helper: Build effective SEO data with fallbacks
 */
const buildSeoResponse = (user) => {
  const seo = user.seoSettings || {};
  const frontendUrl = process.env.FRONTEND_URL || 'https://linkverse.com';

  return {
    metaTitle: seo.metaTitle || '',
    metaDescription: seo.metaDescription || '',
    ogImage: seo.ogImage || '',
    defaults: {
      title: `${user.fullName} | LinkVerse`,
      description: user.bio || `Check out ${user.fullName}'s LinkVerse page`,
      image: user.profilePicture || '',
      url: `${frontendUrl}/${user.username}`,
    },
    effective: {
      title: seo.metaTitle || `${user.fullName} | LinkVerse`,
      description:
        seo.metaDescription ||
        user.bio ||
        `Check out ${user.fullName}'s LinkVerse page`,
      image: seo.ogImage || user.profilePicture || '',
      url: `${frontendUrl}/${user.username}`,
    },
    limits: {
      metaTitle: { max: 60, current: (seo.metaTitle || '').length },
      metaDescription: { max: 160, current: (seo.metaDescription || '').length },
    },
  };
};

/**
 * GET /api/seo
 * Get user's current SEO settings
 */
exports.getSEO = async (req, res, next) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: buildSeoResponse(user),
    });
  } catch (error) {
    console.error('❌ Error fetching SEO settings:', error.message);
    next(error);
  }
};

/**
 * PUT /api/seo
 * Update SEO settings (meta title, description, OG image)
 */
exports.updateSEO = async (req, res, next) => {
  try {
    // Use findById for write operations to get a fresh document
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { metaTitle, metaDescription, removeOgImage } = req.body;
    const updates = {};

    // Validate Meta Title
    if (metaTitle !== undefined) {
      const trimmedTitle = metaTitle.trim();
      if (trimmedTitle.length > 60) {
        return res.status(400).json({
          success: false,
          message: 'Meta title must be 60 characters or less.',
          currentLength: trimmedTitle.length,
          maxLength: 60,
        });
      }
      updates.metaTitle = trimmedTitle;
    }

    // Validate Meta Description
    if (metaDescription !== undefined) {
      const trimmedDesc = metaDescription.trim();
      if (trimmedDesc.length > 160) {
        return res.status(400).json({
          success: false,
          message: 'Meta description must be 160 characters or less.',
          currentLength: trimmedDesc.length,
          maxLength: 160,
        });
      }
      updates.metaDescription = trimmedDesc;
    }

    // Handle OG Image upload
    if (req.file) {
      try {
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        const uploadResult = await cloudinary.uploader.upload(base64Image, {
          folder: 'linkverse/og-images',
          public_id: `og_${user.username}_${Date.now()}`,
          transformation: [
            {
              width: 1200,
              height: 630,
              crop: 'fill',
              gravity: 'center',
              quality: 'auto:good',
              format: 'jpg',
            },
          ],
          overwrite: true,
        });

        // Delete old OG image
        if (user.seoSettings?.ogImage) {
          deleteCloudinaryImage(user.seoSettings.ogImage);
        }

        updates.ogImage = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('❌ OG image upload failed:', uploadError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload OG image. Please try again.',
        });
      }
    }

    // Handle OG image removal
    if (removeOgImage === 'true' || removeOgImage === true) {
      if (user.seoSettings?.ogImage) {
        deleteCloudinaryImage(user.seoSettings.ogImage);
      }
      updates.ogImage = '';
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No SEO settings to update.',
      });
    }

    // Initialize seoSettings if needed
    if (!user.seoSettings) {
      user.seoSettings = {};
    }

    // Apply updates
    for (const [key, value] of Object.entries(updates)) {
      user.seoSettings[key] = value;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'SEO settings updated successfully!',
      data: buildSeoResponse(user),
    });
  } catch (error) {
    console.error('❌ Error updating SEO settings:', error.message);
    next(error);
  }
};