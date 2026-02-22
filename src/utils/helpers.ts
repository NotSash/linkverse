import toast from 'react-hot-toast';
import { CATEGORY_EMOJIS, APP_CONFIG } from '@/utils/constants';

/**
 * Format a date to "12 Jan 2024"
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Format a date with time: "12 Jan 2024, 3:45 PM"
 */
export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Convert paise to formatted rupee string: "₹49.00"
 */
export function formatCurrency(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format rupees directly (not paise): "₹49.00"
 */
export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Truncate text with "..." if it exceeds maxLength
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Copy text to clipboard with toast notification
 */
export async function copyToClipboard(text: string, label: string = 'Link'): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
      return true;
    }

    // Fallback for older browsers / non-HTTPS
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (success) {
      toast.success(`${label} copied to clipboard!`);
      return true;
    }
    toast.error('Failed to copy. Please copy manually.');
    return false;
  } catch {
    toast.error('Failed to copy. Please copy manually.');
    return false;
  }
}

/**
 * Get share URLs for various platforms
 */
export function getShareLinks(url: string, title?: string) {
  const message = title
    ? `Check out ${title}'s page on LinkVerse: ${url}`
    : `Check out my LinkVerse page: ${url}`;
  const encodedMessage = encodeURIComponent(message);
  const encodedUrl = encodeURIComponent(url);

  return {
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title || 'Check out my LinkVerse page!')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
}

/**
 * Calculate Click-Through Rate (formatted percentage)
 */
export function calculateCTR(clicks: number, views: number): string {
  if (!views || views === 0) return '0.00%';
  return `${((clicks / views) * 100).toFixed(2)}%`;
}

/**
 * Get human-readable "time ago" string
 */
export function getTimeAgo(date: string | Date): string {
  if (!date) return '';
  try {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    if (seconds < 30) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } catch {
    return '';
  }
}

/**
 * Generate WhatsApp link from Indian phone number
 */
export function generateWhatsAppLink(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) return `https://wa.me/91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `https://wa.me/${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `https://wa.me/91${digits.substring(1)}`;
  return `https://wa.me/${digits}`;
}

/**
 * Get initials from a name for avatar fallback
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || '🔗';
}

/**
 * Format large numbers: 1234 -> "1.2K", 1234567 -> "1.2M"
 */
export function formatNumber(num: number): string {
  if (num === undefined || num === null) return '0';
  if (num < 1000) return num.toString();
  if (num < 1_000_000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  return `${(num / 1_000_000_000).toFixed(1)}B`;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Build Cloudinary URL with responsive transformations
 */
export function getCloudinaryUrl(
  url: string,
  options: { width?: number; height?: number; quality?: string } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) return url;

  const { width = 400, height, quality = 'auto' } = options;
  const transforms = [`q_${quality}`, 'f_webp', `w_${width}`];
  if (height) transforms.push(`h_${height}`);
  transforms.push('c_fill');

  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex !== -1) {
    const before = url.substring(0, uploadIndex + 8);
    const after = url.substring(uploadIndex + 8);
    return `${before}${transforms.join(',')}/${after}`;
  }

  return url;
}

/**
 * Trigger file download from blob or URL
 */
export function downloadFile(content: Blob | string, filename: string): void {
  const isBlob = content instanceof Blob;
  const url = isBlob ? URL.createObjectURL(content) : content;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (isBlob) URL.revokeObjectURL(url);
}

/**
 * Get the full LinkVerse profile URL for a username
 */
export function getProfileUrl(username: string): string {
  if (!username) return '';
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `${window.location.origin}/${username}`;
  }
  return `https://${APP_CONFIG.baseUrl}/${username}`;
}

/**
 * Get days remaining until a date (negative if passed)
 */
export function getDaysRemaining(endDate: string | Date): number {
  if (!endDate) return 0;
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is within N days from now
 */
export function isWithinDays(date: string | Date, days: number): boolean {
  const remaining = getDaysRemaining(date);
  return remaining >= 0 && remaining <= days;
}

/**
 * Generate a deterministic avatar color from a name
 */
export function getAvatarColor(name: string): string {
  const colors = [
    '#6366f1', '#ec4899', '#f97316', '#10b981', '#06b6d4',
    '#8b5cf6', '#ef4444', '#14b8a6', '#f59e0b', '#3b82f6',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Set page meta tags dynamically
 */
export function setPageMeta(options: {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
}): void {
  const { title, description, ogTitle, ogDescription, ogImage, ogUrl, canonical } = options;

  if (title) document.title = title;

  const setMeta = (property: string, content: string, isOg = false) => {
    const attr = isOg ? 'property' : 'name';
    let tag = document.querySelector(`meta[${attr}="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  if (description) setMeta('description', description);
  if (ogTitle) setMeta('og:title', ogTitle, true);
  if (ogDescription) setMeta('og:description', ogDescription, true);
  if (ogImage) setMeta('og:image', ogImage, true);
  if (ogUrl) setMeta('og:url', ogUrl, true);

  if (canonical) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.href = canonical;
  }
}