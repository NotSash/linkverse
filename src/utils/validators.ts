// ==========================================
// CLIENT-SIDE VALIDATION FUNCTIONS
// ==========================================

import { RESERVED_USERNAMES } from './constants';

/**
 * Validate email format
 * Returns null if valid, error message if invalid
 */
export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Validate Indian phone number (10 digits)
 * Returns null if valid, error message if invalid
 */
export const validatePhone = (phone: string): string | null => {
  if (!phone || !phone.trim()) {
    return 'Phone number is required';
  }
  // Remove any spaces, dashes, or +91 prefix
  const cleaned = phone.replace(/[\s\-+]/g, '').replace(/^91/, '');
  if (!/^\d{10}$/.test(cleaned)) {
    return 'Please enter a valid 10-digit Indian mobile number';
  }
  // First digit should be 6-9 for Indian numbers
  if (!/^[6-9]/.test(cleaned)) {
    return 'Indian mobile numbers start with 6, 7, 8, or 9';
  }
  return null;
};

/**
 * Validate password strength
 * Min 8 chars, at least 1 uppercase, at least 1 number
 * Returns null if valid, specific error message if not
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must include at least one number';
  }
  return null;
};

/**
 * Get password strength details for UI indicator
 */
export const getPasswordStrength = (password: string): {
  score: number;
  checks: { label: string; passed: boolean }[];
} => {
  const checks = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'One uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'One number', passed: /[0-9]/.test(password) },
    { label: 'One special character', passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const score = checks.filter((c) => c.passed).length;
  return { score, checks };
};

/**
 * Validate username format
 * 3-30 chars, lowercase alphanumeric + underscore, can't start with number/underscore
 * Returns null if valid, specific error message if not
 */
export const validateUsername = (username: string): string | null => {
  if (!username || !username.trim()) {
    return 'Username is required';
  }
  const u = username.trim().toLowerCase();
  if (u.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (u.length > 30) {
    return 'Username must be 30 characters or less';
  }
  if (!/^[a-z0-9_]+$/.test(u)) {
    return 'Username can only contain lowercase letters, numbers, and underscores';
  }
  if (/^[0-9_]/.test(u)) {
    return 'Username cannot start with a number or underscore';
  }
  if (RESERVED_USERNAMES.includes(u)) {
    return 'This username is reserved and cannot be used';
  }
  return null;
};

/**
 * Validate URL format
 * Returns null if valid, error message if not
 */
export const validateURL = (url: string): string | null => {
  if (!url || !url.trim()) {
    return 'URL is required';
  }
  try {
    const parsed = new URL(url.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'URL must start with http:// or https://';
    }
    return null;
  } catch {
    return 'Please enter a valid URL (e.g., https://example.com)';
  }
};

/**
 * Validate bio length
 * Max 160 characters
 */
export const validateBio = (bio: string): string | null => {
  if (bio && bio.length > 160) {
    return `Bio must be 160 characters or less (currently ${bio.length})`;
  }
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate confirm password matches
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

/**
 * Validate meta title (max 60 chars)
 */
export const validateMetaTitle = (title: string): string | null => {
  if (title && title.length > 60) {
    return `Meta title must be 60 characters or less (currently ${title.length})`;
  }
  return null;
};

/**
 * Validate meta description (max 160 chars)
 */
export const validateMetaDescription = (description: string): string | null => {
  if (description && description.length > 160) {
    return `Meta description must be 160 characters or less (currently ${description.length})`;
  }
  return null;
};

/**
 * Validate link title (max 80 chars)
 */
export const validateLinkTitle = (title: string): string | null => {
  if (!title || !title.trim()) {
    return 'Link title is required';
  }
  if (title.length > 80) {
    return `Link title must be 80 characters or less (currently ${title.length})`;
  }
  return null;
};

// ==========================================
// FORM-LEVEL VALIDATORS
// ==========================================

export interface FormErrors {
  [key: string]: string | null;
}

/**
 * Validate entire signup form
 * Returns object with field-level errors (null values mean field is valid)
 */
export const validateSignupForm = (data: {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
  category: string;
  agreeToTerms: boolean;
}): FormErrors => {
  const errors: FormErrors = {};
  errors.fullName = validateRequired(data.fullName, 'Full name');
  errors.email = validateEmail(data.email);
  errors.phone = validatePhone(data.phone);
  errors.username = validateUsername(data.username);
  errors.password = validatePassword(data.password);
  errors.confirmPassword = validateConfirmPassword(data.password, data.confirmPassword);
  errors.category = validateRequired(data.category, 'Category');
  if (!data.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the Terms & Conditions and Privacy Policy';
  }
  return errors;
};

/**
 * Validate login form
 */
export const validateLoginForm = (data: {
  email: string;
  password: string;
}): FormErrors => {
  const errors: FormErrors = {};
  errors.email = validateEmail(data.email);
  errors.password = validateRequired(data.password, 'Password');
  return errors;
};

/**
 * Validate contact form
 */
export const validateContactForm = (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): FormErrors => {
  const errors: FormErrors = {};
  errors.name = validateRequired(data.name, 'Name');
  errors.email = validateEmail(data.email);
  errors.subject = validateRequired(data.subject, 'Subject');
  errors.message = validateRequired(data.message, 'Message');
  return errors;
};

/**
 * Validate add/edit link form
 */
export const validateLinkForm = (data: {
  title: string;
  url: string;
}): FormErrors => {
  const errors: FormErrors = {};
  errors.title = validateLinkTitle(data.title);
  errors.url = validateURL(data.url);
  return errors;
};

/**
 * Check if form has any errors
 */
export const hasErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some((error) => error !== null && error !== undefined);
};
