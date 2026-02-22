/**
 * Admin Service — src/services/adminService.ts
 *
 * API functions for admin panel operations.
 * Uses a separate axios instance with admin token.
 */

import axios from 'axios';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ============================================
// Admin Axios Instance
// ============================================

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('linkverse_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle admin-specific errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      localStorage.removeItem('linkverse_admin_token');
      toast.error('Admin session expired. Please log in again.');
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 500);
    } else if (status === 403) {
      toast.error('Access denied. Insufficient admin permissions.');
    } else if (status === 429) {
      toast.error('Too many requests. Please wait a moment.');
    }
    // Don't show generic 500 toast — let the calling component handle it

    return Promise.reject(error);
  }
);

// ============================================
// Auth
// ============================================

/**
 * Admin login — uses public api instance (no admin token yet)
 */
export const adminLogin = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post('/admin/login', data);
  return response.data;
};

// ============================================
// Dashboard
// ============================================

export const getStats = async () => {
  const response = await adminApi.get('/admin/stats');
  return response.data.data;
};

// ============================================
// User Management
// ============================================

interface GetUsersParams {
  search?: string;
  status?: string;
  category?: string;
  state?: string;
  page?: number;
  limit?: number;
}

export const getUsers = async (params: GetUsersParams = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.set(key, String(value));
    }
  });

  const response = await adminApi.get(
    `/admin/users?${queryParams.toString()}`
  );
  return response.data.data;
};

export const getUserDetails = async (userId: string) => {
  const response = await adminApi.get(`/admin/users/${userId}`);
  return response.data.data;
};

export const toggleBan = async (userId: string) => {
  const response = await adminApi.put(`/admin/users/${userId}/ban`);
  return response.data;
};

// ============================================
// Payments
// ============================================

interface GetPaymentsParams {
  search?: string;
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const getPayments = async (params: GetPaymentsParams = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.set(key, String(value));
    }
  });

  const response = await adminApi.get(
    `/admin/payments?${queryParams.toString()}`
  );
  return response.data.data;
};

// ============================================
// Support Tickets
// ============================================

interface GetTicketsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export const getSupportTickets = async (params: GetTicketsParams = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.set(key, String(value));
    }
  });

  const response = await adminApi.get(
    `/admin/support?${queryParams.toString()}`
  );
  return response.data.data;
};

export const resolveTicket = async (ticketId: string) => {
  const response = await adminApi.put(
    `/admin/support/${ticketId}/resolve`
  );
  return response.data;
};

// ============================================
// Export
// ============================================

export const exportUsersCSV = async () => {
  try {
    const response = await adminApi.get('/admin/export/users', {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linkverse-users-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ============================================
// Admin Management
// ============================================

export const createAdmin = async (data: {
  email: string;
  password: string;
}) => {
  const response = await adminApi.post('/admin/create', data);
  return response.data;
};

// ============================================
// Contact Form (Public — uses public api instance)
// ============================================

export const submitContact = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const response = await api.post('/contact', data);
  return response.data;
};

export default {
  adminLogin,
  getStats,
  getUsers,
  getUserDetails,
  toggleBan,
  getPayments,
  getSupportTickets,
  resolveTicket,
  exportUsersCSV,
  createAdmin,
  submitContact,
};