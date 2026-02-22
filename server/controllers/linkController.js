/**
 * Link Controller — server/controllers/linkController.js
 *
 * Handles CRUD operations for bio-links:
 * FREE: Max 5 links
 * PRO: Up to 50 links
 */

const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Platform defaults for auto-populating title/icon
 * Keys MUST match the `value` field in frontend PLATFORM_OPTIONS
 */
const PLATFORM_DEFAULTS = {
  custom: { icon: 'link', title: 'My Link' },
  instagram_post: { icon: 'instagram', title: 'My Instagram Post' },
  instagram_reel: { icon: 'instagram', title: 'My Instagram Reel' },
  youtube_video: { icon: 'youtube', title: 'Watch My Video' },
  youtube_channel: { icon: 'youtube', title: 'My YouTube Channel' },
  blog: { icon: 'blog', title: 'Read My Blog' },
  website: { icon: 'website', title: 'My Website' },
  shop: { icon: 'shop', title: 'Visit My Store' },
  whatsapp: { icon: 'whatsapp', title: 'Message Me on WhatsApp' },
  telegram: { icon: 'telegram', title: 'Join My Telegram' },
  discord: { icon: 'discord', title: 'Join My Discord' },
  spotify: { icon: 'spotify', title: 'Listen on Spotify' },
  apple_music: { icon: 'applemusic', title: 'Listen on Apple Music' },
  jiosaavn: { icon: 'jiosaavn', title: 'Listen on JioSaavn' },
  gaana: { icon: 'gaana', title: 'Listen on Gaana' },
  wynk: { icon: 'wynkmusic', title: 'Listen on Wynk Music' },
  moj: { icon: 'moj', title: 'Follow Me on Moj' },
  sharechat: { icon: 'sharechat', title: 'Follow Me on ShareChat' },
  josh: { icon: 'josh', title: 'Follow Me on Josh' },
  chingari: { icon: 'chingari', title: 'Follow Me on Chingari' },
  roposo: { icon: 'roposo', title: 'Follow Me on Roposo' },
  amazon_affiliate: { icon: 'amazon', title: 'Shop on Amazon' },
  flipkart_affiliate: { icon: 'flipkart', title: 'Shop on Flipkart' },
  meesho: { icon: 'meesho', title: 'Shop on Meesho' },
  razorpay: { icon: 'razorpay', title: 'Pay Me' },
  google_form: { icon: 'google', title: 'Fill My Form' },
  topmate: { icon: 'topmate', title: 'Book a Session' },
  calendly: { icon: 'calendly', title: 'Schedule a Meeting' },
  buymeacoffee: { icon: 'buymeacoffee', title: 'Buy Me a Coffee ☕' },
  kofi: { icon: 'kofi', title: 'Support Me on Ko-fi' },
  gumroad: { icon: 'gumroad', title: 'My Gumroad Store' },
  notion: { icon: 'notion', title: 'My Notion Page' },
  linktree: { icon: 'linktree', title: 'My Linktree' },
  other: { icon: 'link', title: 'My Link' },
};

/**
 * Helper: Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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
 * Helper: Serialize a link subdocument to a clean object
 */
const serializeLink = (link) => ({
  _id: link._id,
  title: link.title,
  url: link.url,
  icon: link.icon,
  platform: link.platform,
  isActive: link.isActive,
  clickCount: link.clickCount,
  order: link.order,
});

/**
 * GET /api/links
 * Get all links for the authenticated user, sorted by order ascending
 */
exports.getLinks = async (req, res, next) => {
  try {
    // Fetch fresh user to avoid stale embedded docs
    const user = await User.findById(req.user._id).select('links isPro subscriptionStatus subscriptionEndDate email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isPro = isProUser(user);

    const links = user.links
      .sort((a, b) => a.order - b.order)
      .map(serializeLink);

    res.status(200).json({
      success: true,
      data: {
        links,
        count: links.length,
        maxLinks: isPro ? 50 : 5,
        isPro,
      },
    });
  } catch (error) {
    console.error('❌ Get links error:', error.message);
    next(error);
  }
};

/**
 * POST /api/links
 * Add a new link
 * FREE: Max 5 links | PRO: Max 50 links
 */
exports.addLink = async (req, res, next) => {
  try {
    const { title, url, platform, icon } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isPro = isProUser(user);
    const maxLinks = isPro ? 50 : 5;

    if (user.links.length >= maxLinks) {
      return res.status(403).json({
        success: false,
        message: isPro
          ? 'Maximum 50 links allowed. Please delete some links before adding new ones.'
          : `Free plan allows only ${maxLinks} links. Upgrade to Pro for up to 50 links! 🚀`,
        requiresPro: !isPro,
        currentCount: user.links.length,
        maxLinks,
      });
    }

    const platformKey = platform || 'custom';
    const defaults = PLATFORM_DEFAULTS[platformKey] || PLATFORM_DEFAULTS.custom;

    const maxOrder =
      user.links.length > 0
        ? Math.max(...user.links.map((l) => l.order || 0))
        : -1;

    const newLink = {
      title: title?.trim() || defaults.title,
      url: url.trim(),
      icon: icon || defaults.icon,
      platform: platformKey,
      isActive: true,
      clickCount: 0,
      order: maxOrder + 1,
    };

    user.links.push(newLink);
    await user.save();

    const addedLink = user.links[user.links.length - 1];

    res.status(201).json({
      success: true,
      message: 'Link added successfully!',
      data: {
        link: serializeLink(addedLink),
        count: user.links.length,
        maxLinks,
      },
    });
  } catch (error) {
    console.error('❌ Add link error:', error.message);
    next(error);
  }
};

/**
 * PUT /api/links/:id
 * Update an existing link's properties
 */
exports.updateLink = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid link ID.' });
    }

    const { title, url, platform, icon, isActive } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const link = user.links.id(id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    if (title !== undefined) link.title = title.trim();
    if (url !== undefined) link.url = url.trim();
    if (platform !== undefined) link.platform = platform;
    if (icon !== undefined) link.icon = icon;
    if (isActive !== undefined) link.isActive = Boolean(isActive);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Link updated successfully!',
      data: { link: serializeLink(link) },
    });
  } catch (error) {
    console.error('❌ Update link error:', error.message);
    next(error);
  }
};

/**
 * DELETE /api/links/:id
 * Delete a link and recompute order values
 */
exports.deleteLink = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid link ID.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const link = user.links.id(id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    user.links.pull({ _id: id });

    // Recompute order after deletion
    user.links
      .sort((a, b) => a.order - b.order)
      .forEach((l, index) => {
        l.order = index;
      });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Link deleted successfully!',
      data: {
        deletedId: id,
        remainingCount: user.links.length,
      },
    });
  } catch (error) {
    console.error('❌ Delete link error:', error.message);
    next(error);
  }
};

/**
 * PUT /api/links/reorder
 * Reorder links based on drag-and-drop
 * Accepts: { orderedIds: [linkId1, linkId2, ...] }
 */
exports.reorderLinks = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'orderedIds must be a non-empty array of link IDs.',
      });
    }

    // Validate all IDs are valid ObjectIds
    if (!orderedIds.every(isValidObjectId)) {
      return res.status(400).json({
        success: false,
        message: 'One or more link IDs are invalid.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userLinkIds = user.links.map((l) => l._id.toString());

    // Ensure all provided IDs belong to this user
    const allValid = orderedIds.every((id) => userLinkIds.includes(id));
    if (!allValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid link IDs. All IDs must belong to your links.',
      });
    }

    // Ensure we have the right count (no duplicates, no missing)
    const uniqueIds = [...new Set(orderedIds)];
    if (uniqueIds.length !== user.links.length) {
      return res.status(400).json({
        success: false,
        message: 'orderedIds must contain exactly all your link IDs (no duplicates, no missing).',
      });
    }

    orderedIds.forEach((linkId, index) => {
      const link = user.links.id(linkId);
      if (link) link.order = index;
    });

    await user.save();

    const updatedLinks = user.links.sort((a, b) => a.order - b.order).map(serializeLink);

    res.status(200).json({
      success: true,
      message: 'Links reordered successfully!',
      data: { links: updatedLinks },
    });
  } catch (error) {
    console.error('❌ Reorder links error:', error.message);
    next(error);
  }
};

/**
 * PUT /api/links/:id/toggle
 * Toggle a link's active/inactive status
 */
exports.toggleLink = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid link ID.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const link = user.links.id(id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found.' });
    }

    link.isActive = !link.isActive;
    await user.save();

    const status = link.isActive ? 'activated' : 'deactivated';

    res.status(200).json({
      success: true,
      message: `Link ${status} successfully!`,
      data: {
        link: {
          _id: link._id,
          title: link.title,
          isActive: link.isActive,
        },
      },
    });
  } catch (error) {
    console.error('❌ Toggle link error:', error.message);
    next(error);
  }
};