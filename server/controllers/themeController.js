/**
 * Theme Controller — server/controllers/themeController.js
 *
 * Handles theme/appearance customization:
 * - Get current theme settings
 * - Update theme (colors, fonts, button styles, backgrounds)
 * - Handle background image uploads via Cloudinary
 * - Apply preset themes
 */

const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const {
  FONT_OPTIONS,
  BUTTON_STYLES,
  PRESET_THEMES,
  DEFAULT_THEME,
} = require('../utils/constants');

/**
 * Validate hex color format
 */
const isValidHexColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color.trim());
};

/**
 * Check if a color value is valid — either a valid hex or empty
 */
const isValidColorOrEmpty = (color) => {
  if (color === '' || color === null || color === undefined) return true;
  return isValidHexColor(color);
};

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
 * Helper: Serialize theme to a clean response object
 */
const serializeTheme = (theme) => ({
  backgroundColor: theme.backgroundColor || DEFAULT_THEME.backgroundColor,
  cardColor: theme.cardColor || DEFAULT_THEME.cardColor,
  textColor: theme.textColor || DEFAULT_THEME.textColor,
  buttonColor: theme.buttonColor || DEFAULT_THEME.buttonColor,
  buttonTextColor: theme.buttonTextColor || DEFAULT_THEME.buttonTextColor,
  fontFamily: theme.fontFamily || DEFAULT_THEME.fontFamily,
  buttonStyle: theme.buttonStyle || DEFAULT_THEME.buttonStyle,
  backgroundType: theme.backgroundType || DEFAULT_THEME.backgroundType,
  gradientFrom: theme.gradientFrom || '',
  gradientTo: theme.gradientTo || '',
  backgroundImage: theme.backgroundImage || '',
});

/**
 * GET /api/theme
 * Get current user's theme settings
 */
exports.getTheme = async (req, res, next) => {
  try {
    const user = req.user;
    const theme = serializeTheme(user.theme || {});

    // Detect if current theme matches any preset
    let activePreset = null;
    for (const preset of PRESET_THEMES) {
      if (
        theme.backgroundColor === preset.backgroundColor &&
        theme.buttonColor === preset.buttonColor &&
        theme.textColor === preset.textColor &&
        theme.backgroundType === preset.backgroundType &&
        theme.fontFamily === preset.fontFamily &&
        theme.buttonStyle === preset.buttonStyle
      ) {
        activePreset = preset.name;
        break;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        theme,
        activePreset,
        availablePresets: PRESET_THEMES.map((p) => p.name),
      },
    });
  } catch (error) {
    console.error('❌ Get theme error:', error.message);
    next(error);
  }
};

/**
 * PUT /api/theme
 * Update theme settings
 *
 * Accepts theme fields in body and optional background image file.
 * Validates all enum values and hex colors.
 * Supports preset application by name.
 */
exports.updateTheme = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const {
      backgroundColor,
      cardColor,
      textColor,
      buttonColor,
      buttonTextColor,
      fontFamily,
      buttonStyle,
      backgroundType,
      gradientFrom,
      gradientTo,
      presetName,
      removeBackground,
    } = req.body;

    // ── Apply preset if requested ──
    if (presetName) {
      const preset = PRESET_THEMES.find((p) => p.name === presetName);
      if (!preset) {
        return res.status(400).json({
          success: false,
          message: `Unknown preset theme: "${presetName}".`,
        });
      }

      user.theme.backgroundColor = preset.backgroundColor;
      user.theme.cardColor = preset.cardColor;
      user.theme.textColor = preset.textColor;
      user.theme.buttonColor = preset.buttonColor;
      user.theme.buttonTextColor = preset.buttonTextColor;
      user.theme.fontFamily = preset.fontFamily;
      user.theme.buttonStyle = preset.buttonStyle;
      user.theme.backgroundType = preset.backgroundType;
      user.theme.gradientFrom = preset.gradientFrom || '';
      user.theme.gradientTo = preset.gradientTo || '';
      // Don't touch backgroundImage — user may want to keep it

      await user.save();

      return res.status(200).json({
        success: true,
        message: `Theme preset "${presetName}" applied!`,
        data: { theme: serializeTheme(user.theme), appliedPreset: presetName },
      });
    }

    // ── Manual theme update ──

    // Color fields validation
    const colorFields = {
      backgroundColor,
      cardColor,
      textColor,
      buttonColor,
      buttonTextColor,
    };

    for (const [field, value] of Object.entries(colorFields)) {
      if (value !== undefined) {
        if (!isValidHexColor(value)) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field} format. Use hex (e.g., #ffffff).`,
          });
        }
        user.theme[field] = value.trim();
      }
    }

    // Font family
    if (fontFamily !== undefined) {
      if (!FONT_OPTIONS.includes(fontFamily)) {
        return res.status(400).json({
          success: false,
          message: `Invalid font. Choose from: ${FONT_OPTIONS.join(', ')}`,
        });
      }
      user.theme.fontFamily = fontFamily;
    }

    // Button style
    if (buttonStyle !== undefined) {
      if (!BUTTON_STYLES.includes(buttonStyle)) {
        return res.status(400).json({
          success: false,
          message: `Invalid button style. Choose from: ${BUTTON_STYLES.join(', ')}`,
        });
      }
      user.theme.buttonStyle = buttonStyle;
    }

    // Background type
    if (backgroundType !== undefined) {
      const validTypes = ['solid', 'gradient', 'image'];
      if (!validTypes.includes(backgroundType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid background type. Choose from: ${validTypes.join(', ')}`,
        });
      }
      user.theme.backgroundType = backgroundType;

      // If switching away from image, optionally remove the old background
      if (
        backgroundType !== 'image' &&
        (removeBackground === 'true' || removeBackground === true)
      ) {
        if (user.theme.backgroundImage) {
          deleteCloudinaryImage(user.theme.backgroundImage);
          user.theme.backgroundImage = '';
        }
      }
    }

    // Gradient colors
    if (gradientFrom !== undefined) {
      if (!isValidColorOrEmpty(gradientFrom)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid gradient start color.',
        });
      }
      user.theme.gradientFrom = gradientFrom ? gradientFrom.trim() : '';
    }

    if (gradientTo !== undefined) {
      if (!isValidColorOrEmpty(gradientTo)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid gradient end color.',
        });
      }
      user.theme.gradientTo = gradientTo ? gradientTo.trim() : '';
    }

    // Background image upload
    if (req.file) {
      // Delete old background image
      if (user.theme.backgroundImage) {
        deleteCloudinaryImage(user.theme.backgroundImage);
      }

      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      const uploadResult = await cloudinary.uploader.upload(base64Image, {
        folder: 'linkverse/backgrounds',
        public_id: `bg_${user._id}_${Date.now()}`,
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 'auto', fetch_format: 'webp' },
        ],
        overwrite: true,
      });

      user.theme.backgroundImage = uploadResult.secure_url;
      user.theme.backgroundType = 'image';
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Theme updated successfully!',
      data: { theme: serializeTheme(user.theme) },
    });
  } catch (error) {
    console.error('❌ Update theme error:', error.message);
    next(error);
  }
};