/**
 * Social Links Controller — server/controllers/socialController.js
 *
 * Handles social media handle management.
 * FREE: Max 3 social platforms
 * PRO: All 30+ platforms
 */

const User = require('../models/User');

// All valid social platform keys (must match User schema socialLinks fields)
const VALID_SOCIAL_PLATFORMS = [
  'instagram', 'youtube', 'twitter', 'facebook', 'linkedin',
  'snapchat', 'pinterest', 'telegram', 'whatsapp', 'discord',
  'reddit', 'threads', 'koo', 'sharechat', 'moj', 'joshapp',
  'chingari', 'roposo', 'mx_takatak', 'spotify', 'applemusic',
  'jiosaavn', 'gaana', 'wynkmusic', 'hungama', 'github',
  'dribbble', 'behance', 'medium', 'substack', 'quora',
];

const FREE_SOCIAL_LIMIT = 3;

/**
 * Helper: Check if user has active Pro subscription
 */
const isProUser = (user) => {
  return (
    user.isPro === true &&
    user.subscriptionStatus === 'active' &&
    user.subscriptionEndDate &&
    new Date(user.subscriptionEndDate) > new Date()
  );
};

/**
 * Helper: Convert WhatsApp phone number to wa.me link
 */
const formatWhatsAppLink = (phone) => {
  if (!phone) return '';

  // Already a wa.me link
  if (phone.includes('wa.me/')) {
    const match = phone.match(/wa\.me\/(\d+)/);
    if (match) return `https://wa.me/${match[1]}`;
  }

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `https://wa.me/${cleaned}`;
  }
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return `https://wa.me/91${cleaned}`;
  }
  if (cleaned.length > 8) {
    return `https://wa.me/${cleaned}`;
  }

  return phone;
};

/**
 * Helper: Build platform URL from username/handle if needed
 */
const buildPlatformURL = (platform, value) => {
  if (!value) return '';

  // Already a full URL
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  const urlBuilders = {
    instagram: (v) => `https://instagram.com/${v.replace('@', '')}`,
    youtube: (v) =>
      v.includes('/') ? `https://youtube.com/${v}` : `https://youtube.com/@${v}`,
    twitter: (v) => `https://twitter.com/${v.replace('@', '')}`,
    facebook: (v) => `https://facebook.com/${v}`,
    linkedin: (v) =>
      v.includes('/') ? `https://linkedin.com/${v}` : `https://linkedin.com/in/${v}`,
    snapchat: (v) => `https://snapchat.com/add/${v}`,
    pinterest: (v) => `https://pinterest.com/${v}`,
    telegram: (v) => `https://t.me/${v.replace('@', '')}`,
    discord: (v) => v, // Usually invite links
    reddit: (v) => `https://reddit.com/user/${v.replace('u/', '')}`,
    threads: (v) => `https://threads.net/@${v.replace('@', '')}`,
    github: (v) => `https://github.com/${v}`,
    dribbble: (v) => `https://dribbble.com/${v}`,
    behance: (v) => `https://behance.net/${v}`,
    medium: (v) => `https://medium.com/@${v.replace('@', '')}`,
    substack: (v) => `https://${v.replace('@', '')}.substack.com`,
    quora: (v) => `https://quora.com/profile/${v}`,
    koo: (v) => `https://kooapp.com/profile/${v}`,
  };

  const builder = urlBuilders[platform];
  return builder ? builder(value) : value;
};

/**
 * Helper: Count filled social platforms
 */
const countFilled = (socialLinks) => {
  const obj = socialLinks?.toObject ? socialLinks.toObject() : socialLinks || {};
  return Object.entries(obj).filter(
    ([key, val]) =>
      VALID_SOCIAL_PLATFORMS.includes(key) &&
      val &&
      typeof val === 'string' &&
      val.trim() !== ''
  ).length;
};

/**
 * GET /api/socials
 * Get current user's social links
 */
exports.getSocialLinks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      'socialLinks isPro subscriptionStatus subscriptionEndDate'
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isPro = isProUser(user);
    const filledCount = countFilled(user.socialLinks);

    res.status(200).json({
      success: true,
      data: {
        socialLinks: user.socialLinks,
        filledCount,
        totalPlatforms: VALID_SOCIAL_PLATFORMS.length,
        maxPlatforms: isPro ? VALID_SOCIAL_PLATFORMS.length : FREE_SOCIAL_LIMIT,
        isPro,
      },
    });
  } catch (error) {
    console.error('❌ Get social links error:', error.message);
    next(error);
  }
};

/**
 * PUT /api/socials
 * Update social links
 *
 * FREE: Max 3 platforms
 * PRO: All platforms
 */
exports.updateSocialLinks = async (req, res, next) => {
  try {
    const { socialLinks } = req.body;

    if (!socialLinks || typeof socialLinks !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'socialLinks object is required.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isPro = isProUser(user);

    // Process and validate each link
    const processedLinks = {};
    const warnings = [];

    for (const [platform, value] of Object.entries(socialLinks)) {
      if (!VALID_SOCIAL_PLATFORMS.includes(platform)) {
        warnings.push(`Unknown platform skipped: ${platform}`);
        continue;
      }

      // Allow clearing a link by sending empty string
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        processedLinks[platform] = '';
        continue;
      }

      if (typeof value !== 'string') {
        warnings.push(`${platform}: Value must be a string`);
        continue;
      }

      const trimmedValue = value.trim();

      // Special handling for WhatsApp
      if (platform === 'whatsapp') {
        processedLinks[platform] = formatWhatsAppLink(trimmedValue);
        continue;
      }

      // Build full URL from username/handle
      const fullURL = buildPlatformURL(platform, trimmedValue);

      // Validate URL if it looks like one
      if (fullURL.startsWith('http://') || fullURL.startsWith('https://')) {
        try {
          new URL(fullURL);
          processedLinks[platform] = fullURL;
        } catch {
          warnings.push(`${platform}: Invalid URL format`);
        }
      } else {
        processedLinks[platform] = fullURL;
      }
    }

    // Apply processed links to get the "would-be" state
    const currentSocials = user.socialLinks?.toObject
      ? user.socialLinks.toObject()
      : { ...(user.socialLinks || {}) };

    const simulatedSocials = { ...currentSocials };
    for (const [platform, value] of Object.entries(processedLinks)) {
      simulatedSocials[platform] = value;
    }

    // Count filled platforms after update
    const totalFilledAfterUpdate = Object.entries(simulatedSocials).filter(
      ([key, val]) =>
        VALID_SOCIAL_PLATFORMS.includes(key) &&
        val &&
        typeof val === 'string' &&
        val.trim() !== ''
    ).length;

    // Enforce free plan limit
    if (!isPro && totalFilledAfterUpdate > FREE_SOCIAL_LIMIT) {
      return res.status(403).json({
        success: false,
        message: `Free plan allows only ${FREE_SOCIAL_LIMIT} social platforms. Upgrade to Pro for all 30+! 🚀`,
        requiresPro: true,
        maxPlatforms: FREE_SOCIAL_LIMIT,
        currentCount: totalFilledAfterUpdate,
      });
    }

    // Apply updates
    for (const [platform, value] of Object.entries(processedLinks)) {
      user.socialLinks[platform] = value;
    }

    await user.save();

    const filledCount = countFilled(user.socialLinks);

    res.status(200).json({
      success: true,
      message: 'Social links updated successfully!',
      data: {
        socialLinks: user.socialLinks,
        filledCount,
        totalPlatforms: VALID_SOCIAL_PLATFORMS.length,
        maxPlatforms: isPro ? VALID_SOCIAL_PLATFORMS.length : FREE_SOCIAL_LIMIT,
        isPro,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    });
  } catch (error) {
    console.error('❌ Update social links error:', error.message);
    next(error);
  }
};