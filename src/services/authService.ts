import api from '@/services/api';

// ==================== AUTH ====================

export const signup = async (data: {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  category: string;
}) => {
  const response = await api.post('/auth/signup', data);
  return response.data;
};

export const verifyOTP = async (data: { email: string; otp: string }) => {
  const response = await api.post('/auth/verify-otp', data);
  return response.data.data; // { token, user }
};

export const resendOTP = async (email: string) => {
  const response = await api.post('/auth/resend-otp', { email });
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await api.post('/auth/login', data);
  return response.data; // Full response — caller checks for requiresVerification
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data: { token: string; password: string }) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

export const checkUsername = async (username: string) => {
  const response = await api.get(`/auth/check-username/${username}`);
  return response.data.data; // { available, message }
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.data; // { user }
};

// ==================== USER PROFILE ====================

export const updateProfile = async (data: {
  fullName?: string;
  bio?: string;
  category?: string;
  city?: string;
  state?: string;
}) => {
  const response = await api.put('/user/profile', data);
  return response.data;
};

export const updateUsername = async (data: { username: string }) => {
  const response = await api.put('/user/username', data);
  return response.data;
};

export const updateProfilePicture = async (formData: FormData) => {
  const response = await api.put('/user/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await api.put('/user/password', data);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete('/user/account');
  return response.data;
};