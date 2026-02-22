/**
 * Public Controller — server/controllers/publicController.js
 *
 * Handles public profile viewing and analytics tracking.
 *
 * FREE users: Limited profile (5 links, 3 socials, default theme) + watermark
 * PRO users: Full profile, custom theme, no watermark
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { DEFAULT_THEME } = require('../utils/constants');

const FREE_LINK_LIMIT = 5;
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
 * Helper: Get today's date at midnight (for date-based analytics)
 */
const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Helper: Extract viewer's user ID from optional auth token (no error if missing)
 */
const getOptionalUserId = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || null;
  } catch {
    return null;
  }
};

/**
 * Helper: Extract referrer domain and normalize to known platform names
 */
const extractReferrerDomain = (referrer) => {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const domain = url.hostname.replace('www.', '');

    const platformMap = {
      'instagram.com': 'Instagram',
      'youtube.com': 'YouTube',
      'twitter.com': 'Twitter/X',
      'x.com': 'Twitter/X',
      't.co': 'Twitter/X',
      'facebook.com': 'Facebook',
      'linkedin.com': 'LinkedIn',
      'whatsapp.com': 'WhatsApp',
      'wa.me': 'WhatsApp',
      'telegram.org': 'Telegram',
      't.me': 'Telegram',
      'google.com': 'Google',
      'bing.com': 'Bing',
      'reddit.com': 'Reddit',
      'pinterest.com': 'Pinterest',
      'snapchat.com': 'Snapchat',
    };

    for (const [key, name] of Object.entries(platformMap)) {
      if (domain.includes(key)) return name;
    }

    return domain;
  } catch {
    return null;
  }
};

/**
 * Helper: Attempt IP-based geolocation (with 1s timeout, fire-and-forget)
 */
const getLocationFromIP = async (ip) => {
  try {
    if (
      !ip ||
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.')
    ) {
      return null;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=city,regionName,status`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    const data = await response.json();
    if (data.status === 'success' && data.city) {
      return { city: data.city, state: data.regionName };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Helper: Serialize active links for public response
 */
const serializeLinks = (links, limit = Infinity) => {
  return links
    .filter((link) => link.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, limit)
    .map((link) => ({
      _id: link._id,
      title: link.title,
      url: link.url,
      icon: link.icon,
      platform: link.platform,
      order: link.order,
    }));
};

/**
 * Helper: Extract filled social links
 */
const serializeSocialLinks = (socialLinks, limit = Infinity) => {
  const result = {};
  if (!socialLinks) return result;

  const obj = socialLinks.toObject ? socialLinks.toObject() : socialLinks;
  let count = 0;

  for (const [platform, url] of Object.entries(obj)) {
    if (
      platform !== '_id' &&
      url &&
      typeof url === 'string' &&
      url.trim() !== '' &&
      count < limit
    ) {
      result[platform] = url;
      count++;
    }
  }

  return result;
};

/**
 * GET /api/public/:username
 * Get public profile data for a username
 *
 * FREE: Limited links/socials, default theme, watermark
 * PRO: Full profile, custom theme, no watermark
 */
exports.getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username: username.toLowerCase(),
    }).select('-password -__v');

    // User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: "This page doesn't exist. Want this username? Sign up now!",
      });
    }

    // Banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        exists: true,
        banned: true,
        message: 'This page is currently unavailable.',
      });
    }

    // Auto-expire subscription
    if (
      user.subscriptionEndDate &&
      user.subscriptionEndDate < new Date() &&
      user.subscriptionStatus === 'active'
    ) {
      user.isPro = false;
      user.subscriptionStatus = 'expired';
      await user.save();
    }

    const isPro = isProUser(user);
    const frontendUrl = process.env.FRONTEND_URL || 'https://linkverse.com';

    // ── FREE USER ──
    if (!isPro) {
      const hasLinks = user.links && user.links.length > 0;
      const hasBio = user.bio && user.bio.trim() !== '';
      const hasContent = hasLinks || hasBio;

      // No content → Coming Soon
      if (!hasContent) {
        return res.status(200).json({
          success: true,
          exists: true,
          comingSoon: true,
          isPro: false,
          data: {
            fullName: user.fullName,
            username: user.username,
            profilePicture: user.profilePicture || null,
            category: user.category || null,
          },
          watermark: { enabled: true },
        });
      }

      // Has content → Limited profile
      return res.status(200).json({
        success: true,
        exists: true,
        comingSoon: false,
        isPro: false,
        data: {
          fullName: user.fullName,
          username: user.username,
          bio: user.bio || null,
          category: user.category || null,
          city: user.city || null,
          state: user.state || null,
          profilePicture: user.profilePicture || null,
          theme: { ...DEFAULT_THEME },
          links: serializeLinks(user.links, FREE_LINK_LIMIT),
          socialLinks: serializeSocialLinks(user.socialLinks, FREE_SOCIAL_LIMIT),
          seoSettings: {
            metaTitle: `${user.fullName} | LinkVerse`,
            metaDescription:
              user.bio || `Check out ${user.fullName}'s LinkVerse page`,
            ogImage: null,
          },
        },
        watermark: { enabled: true },
      });
    }

    // ── PRO USER ──
    res.status(200).json({
      success: true,
      exists: true,
      comingSoon: false,
      isPro: true,
      data: {
        fullName: user.fullName,
        username: user.username,
        bio: user.bio || null,
        category: user.category || null,
        city: user.city || null,
        state: user.state || null,
        profilePicture: user.profilePicture || null,
        theme: {
          backgroundColor: user.theme.backgroundColor,
          cardColor: user.theme.cardColor,
          textColor: user.theme.textColor,
          buttonColor: user.theme.buttonColor,
          buttonTextColor: user.theme.buttonTextColor,
          fontFamily: user.theme.fontFamily,
          buttonStyle: user.theme.buttonStyle,
          backgroundType: user.theme.backgroundType,
          gradientFrom: user.theme.gradientFrom || null,
          gradientTo: user.theme.gradientTo || null,
          backgroundImage: user.theme.backgroundImage || null,
        },
        links: serializeLinks(user.links),
        socialLinks: serializeSocialLinks(user.socialLinks),
        seoSettings: {
          metaTitle:
            user.seoSettings?.metaTitle || `${user.fullName} | LinkVerse`,
          metaDescription:
            user.seoSettings?.metaDescription ||
            user.bio ||
            `Check out ${user.fullName}'s LinkVerse page`,
          ogImage:
            user.seoSettings?.ogImage || user.profilePicture || null,
        },
      },
      watermark: null,
    });
  } catch (error) {
    console.error('❌ Public profile error:', error.message);
    next(error);
  }
};

/**
 * POST /api/public/:username/view
 * Log a page view for analytics
 */
exports.logView = async (req, res, next) => {
  try {
    const { username } = req.params;
    const referrer =
      req.headers.referer ||
      req.headers.referrer ||
      req.body.referrer ||
      null;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Skip self-views
    const viewerUserId = getOptionalUserId(req);
    if (viewerUserId && viewerUserId === user._id.toString()) {
      return res
        .status(200)
        .json({ success: true, tracked: false, reason: 'self-view' });
    }

    // Increment total views
    user.analytics.totalViews = (user.analytics.totalViews || 0) + 1;

    // Update views by date
    const today = getToday();
    const existingViewEntry = user.analytics.viewsByDate.find(
      (entry) =>
        entry.date && new Date(entry.date).getTime() === today.getTime()
    );
    if (existingViewEntry) {
      existingViewEntry.count += 1;
    } else {
      user.analytics.viewsByDate.push({ date: today, count: 1 });
    }

    // Update referrers
    if (referrer) {
      const domain = extractReferrerDomain(referrer);
      if (domain) {
        const existingReferrer = user.analytics.topReferrers.find(
          (r) => r.source === domain
        );
        if (existingReferrer) {
          existingReferrer.count += 1;
        } else {
          user.analytics.topReferrers.push({ source: domain, count: 1 });
        }
      }
    }

    // Save view data first
    await user.save();

    // Geolocation — fire-and-forget (separate save to avoid race condition)
    const clientIP =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.connection?.remoteAddress ||
      req.ip;

    getLocationFromIP(clientIP)
      .then(async (location) => {
        if (!location) return;
        try {
          // Use atomic update to avoid race condition with the save above
          await User.updateOne(
            {
              _id: user._id,
              'analytics.visitorLocations': {
                $elemMatch: {
                  city: location.city,
                  state: location.state,
                },
              },
            },
            { $inc: { 'analytics.visitorLocations.$.count': 1 } }
          ).then(async (result) => {
            if (result.modifiedCount === 0) {
              // Location entry doesn't exist yet, push it
              await User.updateOne(
                { _id: user._id },
                {
                  $push: {
                    'analytics.visitorLocations': {
                      city: location.city,
                      state: location.state,
                      count: 1,
                    },
                  },
                }
              );
            }
          });
        } catch (err) {
          console.error('Failed to save location:', err.message);
        }
      })
      .catch(() => {});

    res.status(200).json({ success: true, tracked: true });
  } catch (error) {
    console.error('❌ Log view error:', error.message);
    next(error);
  }
};

/**
 * POST /api/public/:username/click/:linkId
 * Log a link click for analytics
 */
exports.logClick = async (req, res, next) => {
  try {
    const { username, linkId } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Skip self-clicks
    const clickerUserId = getOptionalUserId(req);
    if (clickerUserId && clickerUserId === user._id.toString()) {
      return res
        .status(200)
        .json({ success: true, tracked: false, reason: 'self-click' });
    }

    const link = user.links.id(linkId);
    if (!link) {
      return res
        .status(404)
        .json({ success: false, message: 'Link not found' });
    }

    if (!link.isActive) {
      return res
        .status(400)
        .json({ success: false, message: 'Link is currently inactive' });
    }

    // Increment counters
    link.clickCount = (link.clickCount || 0) + 1;
    user.analytics.totalClicks = (user.analytics.totalClicks || 0) + 1;

    // Clicks by date
    const today = getToday();
    const existingClickEntry = user.analytics.clicksByDate.find(
      (entry) =>
        entry.date && new Date(entry.date).getTime() === today.getTime()
    );
    if (existingClickEntry) {
      existingClickEntry.count += 1;
    } else {
      user.analytics.clicksByDate.push({ date: today, count: 1 });
    }

    // Clicks by link
    const existingLinkClick = user.analytics.clicksByLink.find(
      (entry) => entry.linkId && entry.linkId.toString() === linkId
    );
    if (existingLinkClick) {
      existingLinkClick.count += 1;
    } else {
      user.analytics.clicksByLink.push({ linkId, count: 1 });
    }

    await user.save();

    res.status(200).json({
      success: true,
      tracked: true,
      url: link.url,
    });
  } catch (error) {
    console.error('❌ Log click error:', error.message);
    next(error);
  }
};