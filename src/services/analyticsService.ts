/**
 * Analytics & Public Profile Service
 * API functions for analytics data and public profile interactions
 */

import api from './api';

// ============================================
// Types
// ============================================

export interface AnalyticsOverview {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  viewsTrend: number;
  clicksTrend: number;
  trendLabel: string;
  subscription: {
    status: string;
    isPro: boolean;
    daysRemaining: number;
    endDate: string | null;
  };
  topLinks: Array<{
    _id: string;
    title: string;
    platform: string;
    clickCount: number;
    ctr: number;
  }>;
  recentActivity: Array<{
    date: string;
    clicks: number;
  }>;
  totalLinks: number;
  activeLinks: number;
  range: string;
}

export interface DateCount {
  date: string;
  count: number;
}

export interface TopLink {
  rank: number;
  _id: string;
  title: string;
  url: string;
  platform: string;
  icon: string;
  isActive: boolean;
  clickCount: number;
  ctr: number;
  percentageOfTotal: number;
}

export interface Referrer {
  source: string;
  count: number;
  percentage: number;
}

export interface LocationData {
  city: string;
  state: string;
  count: number;
}

// ============================================
// Analytics API Functions
// ============================================

/**
 * Get analytics overview (totals, trends, subscription info)
 */
export const getOverview = async (
  range: string = '30d'
): Promise<AnalyticsOverview> => {
  const response = await api.get(`/analytics/overview?range=${range}`);
  return response.data.data;
};

/**
 * Get page views over time (array of { date, count })
 */
export const getViews = async (
  range: string = '30d'
): Promise<{ data: DateCount[]; total: number; range: string }> => {
  const response = await api.get(`/analytics/views?range=${range}`);
  return {
    data: response.data.data,
    total: response.data.total,
    range: response.data.range,
  };
};

/**
 * Get link clicks over time (array of { date, count })
 */
export const getClicks = async (
  range: string = '30d'
): Promise<{ data: DateCount[]; total: number; range: string }> => {
  const response = await api.get(`/analytics/clicks?range=${range}`);
  return {
    data: response.data.data,
    total: response.data.total,
    range: response.data.range,
  };
};

/**
 * Get top performing links
 */
export const getTopLinks = async (
  range: string = '30d'
): Promise<{
  data: TopLink[];
  totalClicks: number;
  totalViews: number;
  totalLinks: number;
}> => {
  const response = await api.get(`/analytics/top-links?range=${range}`);
  return {
    data: response.data.data,
    totalClicks: response.data.totalClicks,
    totalViews: response.data.totalViews,
    totalLinks: response.data.totalLinks,
  };
};

/**
 * Get traffic referrers
 */
export const getReferrers = async (
  range: string = '30d'
): Promise<{
  data: Referrer[];
  totalReferrals: number;
  locations: LocationData[];
}> => {
  const response = await api.get(`/analytics/referrers?range=${range}`);
  return {
    data: response.data.data,
    totalReferrals: response.data.totalReferrals,
    locations: response.data.locations,
  };
};

// ============================================
// Public Profile API Functions
// ============================================

/**
 * Get public profile data for a username
 * Returns full API response (includes exists, comingSoon, watermark, data, isPro)
 */
export const getPublicProfile = async (username: string) => {
  const response = await api.get(`/public/${username}`);
  return response.data;
};

/**
 * Log a page view for analytics tracking
 */
export const logView = async (
  username: string,
  referrer?: string
): Promise<null | Record<string, unknown>> => {
  try {
    const response = await api.post(`/public/${username}/view`, { referrer });
    return response.data;
  } catch (error) {
    // Silently fail — don't interrupt user experience for tracking
    console.log('View tracking failed (non-critical):', error);
    return null;
  }
};

/**
 * Log a link click for analytics tracking
 * Uses sendBeacon for reliability when navigating away
 */
export const logClick = async (
  username: string,
  linkId: string
): Promise<boolean> => {
  try {
    const apiBase = api.defaults.baseURL || '/api';
    const url = `${apiBase}/public/${username}/click/${linkId}`;

    // Try sendBeacon first (more reliable when navigating away)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const beaconSent = navigator.sendBeacon(
        url,
        new Blob([JSON.stringify({})], { type: 'application/json' })
      );
      if (beaconSent) return true;
    }

    // Fallback to regular API call
    await api.post(`/public/${username}/click/${linkId}`);
    return true;
  } catch (error) {
    // Silently fail — don't block the user from navigating
    console.log('Click tracking failed (non-critical):', error);
    return false;
  }
};

export default {
  getOverview,
  getViews,
  getClicks,
  getTopLinks,
  getReferrers,
  getPublicProfile,
  logView,
  logClick,
};