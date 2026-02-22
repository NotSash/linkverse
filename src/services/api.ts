import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Endpoints where 401 should NOT trigger redirect or toast
const SILENT_401_ENDPOINTS = [
  '/auth/me',
  '/auth/check-username',
];

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================================================
// Request Interceptor — attach JWT token
// =============================================================
api.interceptors.request.use(
  (config) => {
    const isAdminRoute = config.url?.startsWith('/admin');
    const tokenKey = isAdminRoute ? 'linkverse_admin_token' : 'linkverse_token';
    const token = localStorage.getItem(tokenKey);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =============================================================
// Response Interceptor — handle errors globally
// =============================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response — network error or timeout
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error('Network error. Please check your connection.');
      }
      return Promise.reject(error);
    }

    const { status } = error.response;
    const requestUrl = error.config?.url || '';

    switch (status) {
      case 401: {
        // Silent endpoints — don't redirect, don't toast
        const isSilent = SILENT_401_ENDPOINTS.some(
          (ep) => requestUrl === ep || requestUrl.endsWith(ep)
        );

        if (isSilent) return Promise.reject(error);

        const isAdminRoute = requestUrl.startsWith('/admin');
        const tokenKey = isAdminRoute ? 'linkverse_admin_token' : 'linkverse_token';
        const loginPath = isAdminRoute ? '/admin/login' : '/login';

        localStorage.removeItem(tokenKey);

        if (!window.location.pathname.includes('/login')) {
          toast.error('Session expired. Please log in again.');
          setTimeout(() => {
            window.location.href = loginPath;
          }, 500);
        }
        break;
      }

      case 429:
        toast.error('Too many requests. Please wait a moment.');
        break;

      case 500:
        toast.error('Server error. Please try again later.');
        break;

      default:
        break;
    }

    return Promise.reject(error);
  }
);

// =============================================================
// Helper: Extract error message from API response
// =============================================================
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Validation errors array
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      return error.response.data.errors
        .map((err: { message: string }) => err.message)
        .join('. ');
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    const statusMessages: Record<number, string> = {
      401: 'Please log in to continue.',
      403: 'You do not have permission to do this.',
      404: 'The requested resource was not found.',
      429: 'Too many requests. Please try again later.',
      500: 'Internal server error. Please try again.',
    };

    if (error.response?.status && statusMessages[error.response.status]) {
      return statusMessages[error.response.status];
    }

    return error.message || 'Something went wrong.';
  }

  if (error instanceof Error) return error.message;

  return 'An unexpected error occurred.';
};

// =============================================================
// Helper: Check if error is a network error
// =============================================================
export const isNetworkError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && !error.response;
};

// =============================================================
// Helper: Create FormData for file uploads
// =============================================================
export const createFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

export default api;