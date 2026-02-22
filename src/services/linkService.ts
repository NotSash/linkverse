/**
 * Link, Social & Theme Service — src/services/linkService.ts
 *
 * Handles all link management, social links, and theme API calls.
 * Each function returns typed data for better DX.
 */

import api from './api';

// ==================== TYPES ====================

export interface Link {
  _id: string;
  title: string;
  url: string;
  icon: string;
  platform: string;
  isActive: boolean;
  clickCount: number;
  order: number;
}

export interface LinksResponse {
  links: Link[];
  count: number;
  maxLinks: number;
  isPro: boolean;
}

export interface AddLinkPayload {
  title: string;
  url: string;
  platform?: string;
  icon?: string;
}

export interface UpdateLinkPayload {
  title?: string;
  url?: string;
  platform?: string;
  icon?: string;
  isActive?: boolean;
}

// ==================== LINKS ENDPOINTS ====================

/**
 * Get all user's links (sorted by order)
 */
export const getLinks = async (): Promise<LinksResponse> => {
  const response = await api.get('/links');
  return response.data.data;
};

/**
 * Add a new link
 */
export const addLink = async (data: AddLinkPayload) => {
  const response = await api.post('/links', data);
  return response.data;
};

/**
 * Update an existing link
 */
export const updateLink = async (id: string, data: UpdateLinkPayload) => {
  const response = await api.put(`/links/${id}`, data);
  return response.data;
};

/**
 * Delete a link
 */
export const deleteLink = async (id: string) => {
  const response = await api.delete(`/links/${id}`);
  return response.data;
};

/**
 * Reorder links — send array of link IDs in new order
 */
export const reorderLinks = async (orderedIds: string[]) => {
  const response = await api.put('/links/reorder', { orderedIds });
  return response.data;
};

/**
 * Toggle a link's active/inactive status
 */
export const toggleLink = async (id: string) => {
  const response = await api.put(`/links/${id}/toggle`);
  return response.data;
};

// ==================== SOCIAL LINKS ENDPOINTS ====================

/**
 * Get user's social media links
 */
export const getSocialLinks = async () => {
  const response = await api.get('/socials');
  return response.data.data;
};

/**
 * Update all social media links
 */
export const updateSocialLinks = async (data: Record<string, string>) => {
  const response = await api.put('/socials', { socialLinks: data });
  return response.data;
};

// ==================== THEME ENDPOINTS ====================

/**
 * Get user's current theme settings
 */
export const getTheme = async () => {
  const response = await api.get('/theme');
  return response.data.data;
};

/**
 * Update theme settings
 * If updating background image, pass FormData
 */
export const updateTheme = async (data: FormData | Record<string, any>) => {
  const isFormData = data instanceof FormData;
  const response = await api.put('/theme', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};