/**
 * Analytics Controller — server/controllers/analyticsController.js
 *
 * Handles analytics data retrieval with date range filtering:
 * - Overview stats (totals, CTR, trends, subscription info)
 * - Views over time (daily counts, zero-filled for missing days)
 * - Clicks over time (daily counts, zero-filled)
 * - Top performing links (sorted by clicks)
 * - Top referrer sources (sorted by count)
 */

const User = require('../models/User');

// ============================================
// Date Helpers
// ============================================

/**
 * Calculate date range start based on range string
 * @param {string} range - "7d", "30d", "90d", or "all"
 * @returns {Date|null} Start date or null for "all"
 */
const getDateRange = (range) => {
  const now = new Date();

  switch (range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'all':
      return null;
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
};

/**
 * Get range label for human-readable display
 * @param {string} range
 * @returns {string}
 */
const getRangeLabel = (range) => {
  switch (range) {
    case '7d':
      return '7 days';
    case '30d':
      return '30 days';
    case '90d':
      return '90 days';
    case 'all':
      return 'all time';
    default:
      return '30 days';
  }
};

/**
 * Get the previous period's start/end dates for trend comparison
 * e.g., if range is last 7 days, previous period is 7–14 days ago
 * @param {string} range
 * @returns {{ currentStart: Date, previousStart: Date, previousEnd: Date }}
 */
const getComparisonDates = (range) => {
  const now = new Date();
  let periodMs;

  switch (range) {
    case '7d':
      periodMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case '30d':
      periodMs = 30 * 24 * 60 * 60 * 1000;
      break;
    case '90d':
      periodMs = 90 * 24 * 60 * 60 * 1000;
      break;
    default:
      periodMs = 30 * 24 * 60 * 60 * 1000;
  }

  return {
    currentStart: new Date(now.getTime() - periodMs),
    previousStart: new Date(now.getTime() - 2 * periodMs),
    previousEnd: new Date(now.getTime() - periodMs),
  };
};

/**
 * Normalize date to YYYY-MM-DD string (strip time)
 * @param {Date|string} date
 * @returns {string}
 */
const normalizeDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Generate array of all date strings between start and end (inclusive)
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {string[]}
 */
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    dates.push(normalizeDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

/**
 * Filter analytics date array by range and zero-fill missing days
 * @param {Array<{ date: string|Date, count: number }>} dataArray
 * @param {Date|null} startDate
 * @returns {Array<{ date: string, count: number }>}
 */
const filterAndFillDates = (dataArray, startDate) => {
  const now = new Date();

  const start =
    startDate ||
    (dataArray.length > 0
      ? new Date(
          Math.min(...dataArray.map((d) => new Date(d.date).getTime()))
        )
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

  const allDates = generateDateRange(start, now);

  // Build map — aggregate duplicate dates
  const dataMap = {};
  for (const entry of dataArray) {
    const entryDate = new Date(entry.date);
    if (startDate && entryDate < startDate) continue;
    const dateKey = normalizeDate(entry.date);
    dataMap[dateKey] = (dataMap[dateKey] || 0) + (entry.count || 0);
  }

  return allDates.map((date) => ({
    date,
    count: dataMap[date] || 0,
  }));
};

/**
 * Sum counts in a date array within a given range
 * @param {Array<{ date: string|Date, count: number }>} dataArray
 * @param {Date} start
 * @param {Date} [end=now]
 * @returns {number}
 */
const sumInRange = (dataArray, start, end = new Date()) => {
  return dataArray
    .filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    })
    .reduce((sum, entry) => sum + (entry.count || 0), 0);
};

/**
 * Calculate percentage change between two values
 * @param {number} current
 * @param {number} previous
 * @returns {number}
 */
const calcTrend = (current, previous) => {
  if (previous > 0) {
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  }
  return current > 0 ? 100 : 0;
};

// ============================================
// Controller Methods
// ============================================

/**
 * GET /api/analytics/overview
 * Overview stats with trends and subscription info
 */
exports.getOverview = async (req, res, next) => {
  try {
    const range = req.query.range || '30d';
    const user = req.user;
    const analytics = user.analytics || {};

    const totalViews = analytics.totalViews || 0;
    const totalClicks = analytics.totalClicks || 0;
    const ctr =
      totalViews > 0
        ? parseFloat(((totalClicks / totalViews) * 100).toFixed(2))
        : 0;

    // Trend calculation (current period vs previous period)
    let viewsTrend = 0;
    let clicksTrend = 0;

    if (range !== 'all') {
      const { currentStart, previousStart, previousEnd } =
        getComparisonDates(range);

      const currentViews = sumInRange(
        analytics.viewsByDate || [],
        currentStart
      );
      const previousViews = sumInRange(
        analytics.viewsByDate || [],
        previousStart,
        previousEnd
      );
      const currentClicks = sumInRange(
        analytics.clicksByDate || [],
        currentStart
      );
      const previousClicks = sumInRange(
        analytics.clicksByDate || [],
        previousStart,
        previousEnd
      );

      viewsTrend = calcTrend(currentViews, previousViews);
      clicksTrend = calcTrend(currentClicks, previousClicks);
    }

    // Subscription info
    const subscriptionInfo = {
      status: user.subscriptionStatus || 'inactive',
      isPro: user.isPro || false,
      daysRemaining: 0,
      endDate: user.subscriptionEndDate || null,
    };

    if (user.subscriptionEndDate) {
      const daysRemaining = Math.ceil(
        (new Date(user.subscriptionEndDate) - new Date()) /
          (1000 * 60 * 60 * 24)
      );
      subscriptionInfo.daysRemaining = Math.max(0, daysRemaining);
    }

    // Top 5 links by clicks
    const topLinks = user.links
      .filter((l) => (l.clickCount || 0) > 0)
      .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
      .slice(0, 5)
      .map((l) => ({
        _id: l._id,
        title: l.title,
        platform: l.platform || '',
        clickCount: l.clickCount || 0,
        ctr:
          totalViews > 0
            ? parseFloat((((l.clickCount || 0) / totalViews) * 100).toFixed(2))
            : 0,
      }));

    // Recent activity
    const recentActivity = (analytics.clicksByDate || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map((entry) => ({
        date: entry.date,
        clicks: entry.count || 0,
      }));

    res.status(200).json({
      success: true,
      data: {
        totalViews,
        totalClicks,
        ctr,
        viewsTrend,
        clicksTrend,
        trendLabel: `vs previous ${getRangeLabel(range)}`,
        subscription: subscriptionInfo,
        topLinks,
        recentActivity,
        totalLinks: user.links.length,
        activeLinks: user.links.filter((l) => l.isActive !== false).length,
        range,
      },
    });
  } catch (error) {
    console.error('❌ Analytics overview error:', error.message);
    next(error);
  }
};

/**
 * GET /api/analytics/views
 * Daily view counts for charting (zero-filled)
 */
exports.getViews = async (req, res, next) => {
  try {
    const range = req.query.range || '30d';
    const user = req.user;
    const analytics = user.analytics || {};
    const startDate = getDateRange(range);

    const viewsData = filterAndFillDates(
      analytics.viewsByDate || [],
      startDate
    );
    const periodTotal = viewsData.reduce(
      (sum, entry) => sum + entry.count,
      0
    );

    res.status(200).json({
      success: true,
      data: viewsData,
      total: periodTotal,
      range,
    });
  } catch (error) {
    console.error('❌ Analytics views error:', error.message);
    next(error);
  }
};

/**
 * GET /api/analytics/clicks
 * Daily click counts for charting (zero-filled)
 */
exports.getClicks = async (req, res, next) => {
  try {
    const range = req.query.range || '30d';
    const user = req.user;
    const analytics = user.analytics || {};
    const startDate = getDateRange(range);

    const clicksData = filterAndFillDates(
      analytics.clicksByDate || [],
      startDate
    );
    const periodTotal = clicksData.reduce(
      (sum, entry) => sum + entry.count,
      0
    );

    res.status(200).json({
      success: true,
      data: clicksData,
      total: periodTotal,
      range,
    });
  } catch (error) {
    console.error('❌ Analytics clicks error:', error.message);
    next(error);
  }
};

/**
 * GET /api/analytics/top-links
 * Top performing links sorted by click count (top 10)
 */
exports.getTopLinks = async (req, res, next) => {
  try {
    const user = req.user;
    const analytics = user.analytics || {};
    const totalClicks = analytics.totalClicks || 0;
    const totalViews = analytics.totalViews || 0;

    const rankedLinks = user.links
      .map((link) => ({
        _id: link._id,
        title: link.title || 'Untitled',
        url: link.url,
        platform: link.platform || '',
        icon: link.icon || '',
        isActive: link.isActive !== false,
        clickCount: link.clickCount || 0,
        ctr:
          totalViews > 0
            ? parseFloat(
                (((link.clickCount || 0) / totalViews) * 100).toFixed(2)
              )
            : 0,
        percentageOfTotal:
          totalClicks > 0
            ? parseFloat(
                (((link.clickCount || 0) / totalClicks) * 100).toFixed(2)
              )
            : 0,
      }))
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 10)
      .map((link, index) => ({
        rank: index + 1,
        ...link,
      }));

    res.status(200).json({
      success: true,
      data: rankedLinks,
      totalClicks,
      totalViews,
      totalLinks: user.links.length,
    });
  } catch (error) {
    console.error('❌ Top links error:', error.message);
    next(error);
  }
};

/**
 * GET /api/analytics/referrers
 * Top traffic referrer sources sorted by count
 */
exports.getReferrers = async (req, res, next) => {
  try {
    const user = req.user;
    const analytics = user.analytics || {};

    const referrers = (analytics.topReferrers || []).sort(
      (a, b) => (b.count || 0) - (a.count || 0)
    );

    const totalReferrals = referrers.reduce(
      (sum, ref) => sum + (ref.count || 0),
      0
    );

    const referrersWithPercent = referrers.map((ref) => ({
      source: ref.source || 'Direct',
      count: ref.count || 0,
      percentage:
        totalReferrals > 0
          ? parseFloat(
              (((ref.count || 0) / totalReferrals) * 100).toFixed(2)
            )
          : 0,
    }));

    // Visitor locations (top 10)
    const locations = (analytics.visitorLocations || [])
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 10)
      .map((loc) => ({
        city: loc.city || 'Unknown',
        state: loc.state || '',
        count: loc.count || 0,
      }));

    res.status(200).json({
      success: true,
      data: referrersWithPercent,
      totalReferrals,
      locations,
    });
  } catch (error) {
    console.error('❌ Referrers error:', error.message);
    next(error);
  }
};