import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import axios from 'axios';

// ============================================
// Types
// ============================================

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  profilePicture: string;
  bio: string;
  category: string;
  city: string;
  state: string;
  isVerified: boolean;
  isPro: boolean;
  isBanned: boolean;
  subscriptionStatus: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  theme: Record<string, unknown>;
  links: Array<Record<string, unknown>>;
  socialLinks: Record<string, string>;
  analytics: Record<string, unknown>;
  seoSettings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPro: boolean;
  isSubscriptionExpiring: boolean;
  daysRemaining: number | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

// ============================================
// Constants
// ============================================

const TOKEN_KEY = 'linkverse_token';
const USER_KEY = 'linkverse_user';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Private axios instance for auth checks (no 401 redirect interceptor)
const authCheckApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Extract user object from various API response shapes
 */
const extractUser = (responseData: unknown): User | null => {
  if (!responseData || typeof responseData !== 'object') return null;

  const data = responseData as Record<string, unknown>;

  // Shape: { data: { user: {...} } }
  const nestedUser = (data?.data as Record<string, unknown>)?.user as User | undefined;
  if (nestedUser?._id) return nestedUser;

  // Shape: { user: {...} }
  const directUser = data?.user as User | undefined;
  if (directUser?._id) return directUser;

  // Shape: { data: {...} } where data itself is the user
  const dataAsUser = data?.data as User | undefined;
  if (dataAsUser?._id) return dataAsUser;

  // Shape: responseData itself is the user
  if ('_id' in data && typeof (data as Record<string, unknown>)._id === 'string') {
    return data as unknown as User;
  }

  return null;
};

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed values
  const isAuthenticated = !!(user && token);

  const isPro = !!(
    user?.isPro &&
    user?.subscriptionStatus === 'active' &&
    user?.subscriptionEndDate &&
    new Date(user.subscriptionEndDate) > new Date()
  );

  const daysRemaining = (() => {
    if (!user?.subscriptionEndDate) return null;
    const diff = Math.ceil(
      (new Date(user.subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(diff, 0);
  })();

  const isSubscriptionExpiring = !!(daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0);

  // Auth operations
  const login = useCallback((newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('linkverse_admin_token');

    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/dashboard')) {
      window.location.href = '/login';
    } else if (currentPath.startsWith('/admin')) {
      window.location.href = '/admin/login';
    }
  }, []);

  const updateUser = useCallback((updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) return;

    try {
      const response = await authCheckApi.get('/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      });

      const userData = extractUser(response.data);
      if (userData) {
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
    } catch {
      // Silent failure — don't clear auth on refresh failure
    }
  }, []);

  // Auto-check subscription expiry
  useEffect(() => {
    if (
      user?.subscriptionEndDate &&
      user.subscriptionStatus === 'active' &&
      new Date(user.subscriptionEndDate) <= new Date()
    ) {
      updateUser({ isPro: false, subscriptionStatus: 'expired' });
    }
  }, [user?.subscriptionEndDate, user?.subscriptionStatus, updateUser]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (!savedToken) {
          setIsLoading(false);
          return;
        }

        setToken(savedToken);

        // Show cached user immediately for faster UI
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            // Invalid cache — ignore
          }
        }

        // Validate token with server
        try {
          const response = await authCheckApi.get('/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` },
          });

          const userData = extractUser(response.data);
          if (userData) {
            setUser(userData);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
          } else {
            throw new Error('Invalid response');
          }
        } catch {
          setToken(null);
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isPro,
        isSubscriptionExpiring,
        daysRemaining,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// Hook
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;