/**
 * Shared Constants
 * 
 * Centralized constants used across the LinkVerse backend.
 * Includes reserved usernames, Indian states, categories,
 * platform lists, and theme defaults.
 */

// ─── Reserved Usernames ──────────────────────────────────────────────
// These usernames cannot be registered by users as they conflict
// with application routes or are reserved for system use
const RESERVED_USERNAMES = [
  'admin', 'dashboard', 'login', 'signup', 'settings', 'api', 'public',
  'about', 'contact', 'pricing', 'terms', 'privacy', 'refund', 'support',
  'help', 'billing', 'analytics', 'preview', 'explore', 'search', 'home',
  'index', 'app', 'www', 'mail', 'ftp', 'blog'
];

// ─── Indian States & Union Territories ───────────────────────────────
// Complete list of all 28 states and 8 Union Territories of India
const INDIAN_STATES = [
  // States (28)
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories (8)
  'Andaman & Nicobar Islands',
  'Chandigarh',
  'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

// ─── Creator Categories ──────────────────────────────────────────────
// Niche categories for content creators
const CATEGORIES = [
  'Fashion', 'Beauty', 'Tech', 'Gaming', 'Food',
  'Travel', 'Fitness', 'Education', 'Finance', 'Comedy',
  'Music', 'Art', 'Photography', 'Lifestyle', 'Motivation',
  'News', 'Sports', 'Vlogs', 'Reviews', 'Other'
];

// ─── Category Emojis ─────────────────────────────────────────────────
// Emoji mapping for each category (used in UI badges)
const CATEGORY_EMOJIS = {
  'Fashion': '👗',
  'Beauty': '💄',
  'Tech': '💻',
  'Gaming': '🎮',
  'Food': '🍕',
  'Travel': '✈️',
  'Fitness': '💪',
  'Education': '📚',
  'Finance': '💰',
  'Comedy': '😂',
  'Music': '🎵',
  'Art': '🎨',
  'Photography': '📸',
  'Lifestyle': '🌟',
  'Motivation': '🔥',
  'News': '📰',
  'Sports': '⚽',
  'Vlogs': '🎬',
  'Reviews': '⭐',
  'Other': '🔗'
};

// ─── Link Platform List ──────────────────────────────────────────────
// Supported platforms for bio links
const PLATFORM_LIST = [
  'Custom URL',
  'Instagram Post',
  'Instagram Reel',
  'YouTube Video',
  'YouTube Channel',
  'Blog Post',
  'Website',
  'Shop/Store',
  'WhatsApp',
  'Telegram',
  'Discord',
  'Spotify',
  'Apple Music',
  'JioSaavn',
  'Gaana',
  'Wynk Music',
  'Moj',
  'ShareChat',
  'Josh',
  'Chingari',
  'Roposo',
  'Amazon Affiliate',
  'Flipkart Affiliate',
  'Meesho',
  'Razorpay Payment Link',
  'Google Form',
  'Topmate',
  'Calendly',
  'Buy Me a Coffee',
  'Ko-fi',
  'Gumroad',
  'Notion',
  'Linktree',
  'Other'
];

// ─── Social Media Platforms ──────────────────────────────────────────
// Grouped by category for organized display in the dashboard
const SOCIAL_PLATFORMS = {
  indian: [
    { key: 'moj', label: 'Moj', placeholder: 'https://mojapp.in/@username' },
    { key: 'sharechat', label: 'ShareChat', placeholder: 'https://sharechat.com/profile/username' },
    { key: 'joshapp', label: 'Josh', placeholder: 'https://share.myjosh.in/profile/username' },
    { key: 'chingari', label: 'Chingari', placeholder: 'https://chingari.io/username' },
    { key: 'roposo', label: 'Roposo', placeholder: 'https://roposo.com/profile/username' },
    { key: 'koo', label: 'Koo', placeholder: 'https://kooapp.com/profile/username' }
  ],
  global: [
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@username' },
    { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/username' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
    { key: 'snapchat', label: 'Snapchat', placeholder: 'https://snapchat.com/add/username' },
    { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/username' },
    { key: 'threads', label: 'Threads', placeholder: 'https://threads.net/@username' },
    { key: 'reddit', label: 'Reddit', placeholder: 'https://reddit.com/user/username' }
  ],
  messaging: [
    { key: 'whatsapp', label: 'WhatsApp', placeholder: '10-digit mobile number', prefix: '+91' },
    { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/username' },
    { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/invite-code' }
  ],
  music: [
    { key: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/artist/...' },
    { key: 'applemusic', label: 'Apple Music', placeholder: 'https://music.apple.com/artist/...' },
    { key: 'jiosaavn', label: 'JioSaavn', placeholder: 'https://jiosaavn.com/artist/...' },
    { key: 'gaana', label: 'Gaana', placeholder: 'https://gaana.com/artist/...' },
    { key: 'wynkmusic', label: 'Wynk Music', placeholder: 'https://wynk.in/...' },
    { key: 'hungama', label: 'Hungama', placeholder: 'https://hungama.com/...' }
  ],
  professional: [
    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
    { key: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/username' },
    { key: 'behance', label: 'Behance', placeholder: 'https://behance.net/username' },
    { key: 'medium', label: 'Medium', placeholder: 'https://medium.com/@username' },
    { key: 'substack', label: 'Substack', placeholder: 'https://username.substack.com' },
    { key: 'quora', label: 'Quora', placeholder: 'https://quora.com/profile/username' }
  ]
};

// ─── Subscription Amount ─────────────────────────────────────────────
// Amount in paise as per Razorpay convention
const SUBSCRIPTION_AMOUNT = 4900;  // ₹49.00 = 4900 paise (monthly)
const YEARLY_SUBSCRIPTION_AMOUNT = 49900;  // ₹499.00 = 49900 paise (yearly — save ₹89)

// ─── Font Options ────────────────────────────────────────────────────
const FONT_OPTIONS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Nunito',
  'Outfit'
];

// ─── Button Style Options ────────────────────────────────────────────
const BUTTON_STYLES = [
  'rounded',  // Rounded Rectangle
  'pill',     // Pill/Capsule (fully rounded)
  'square',   // Sharp corners
  'outline',  // Outline only (no fill)
  'shadow'    // Shadow/Elevated
];

// ─── Default Theme ───────────────────────────────────────────────────
// Default theme values for new users
const DEFAULT_THEME = {
  backgroundColor: '#ffffff',
  cardColor: '#f3f4f6',
  textColor: '#111827',
  buttonColor: '#6366f1',
  buttonTextColor: '#ffffff',
  fontFamily: 'Poppins',
  buttonStyle: 'pill',
  backgroundType: 'solid',
  gradientFrom: '#6366f1',
  gradientTo: '#ec4899',
  backgroundImage: ''
};

// ─── Preset Themes ───────────────────────────────────────────────────
// 10 pre-designed themes users can quickly apply
// ---- 10 Preset themes ----
const PRESET_THEMES = [
  {
    name: 'Clean White',
    backgroundColor: '#ffffff',
    cardColor: '#f3f4f6',
    textColor: '#111827',
    buttonColor: '#6366f1',
    buttonTextColor: '#ffffff',
    fontFamily: 'Poppins',
    buttonStyle: 'pill',
    backgroundType: 'solid',
    gradientFrom: '#6366f1',
    gradientTo: '#ec4899',
  },
  {
    name: 'Dark Mode',
    backgroundColor: '#1a1a2e',
    cardColor: '#16213e',
    textColor: '#e0e0e0',
    buttonColor: '#00d2ff',
    buttonTextColor: '#1a1a2e',
    fontFamily: 'Inter',
    buttonStyle: 'rounded',
    backgroundType: 'solid',
    gradientFrom: '#1a1a2e',
    gradientTo: '#16213e',
  },
  {
    name: 'Sunset Vibes',
    backgroundColor: '#ff6b35',
    cardColor: '#ffffff',
    textColor: '#333333',
    buttonColor: '#ff6b35',
    buttonTextColor: '#ffffff',
    fontFamily: 'Nunito',
    buttonStyle: 'pill',
    backgroundType: 'gradient',
    gradientFrom: '#ff6b35',
    gradientTo: '#f72585',
  },
  {
    name: 'Forest Green',
    backgroundColor: '#1b4332',
    cardColor: '#2d6a4f',
    textColor: '#d8f3dc',
    buttonColor: '#95d5b2',
    buttonTextColor: '#1b4332',
    fontFamily: 'Roboto',
    buttonStyle: 'rounded',
    backgroundType: 'solid',
    gradientFrom: '#1b4332',
    gradientTo: '#2d6a4f',
  },
  {
    name: 'Royal Purple',
    backgroundColor: '#240046',
    cardColor: '#3c096c',
    textColor: '#e0aaff',
    buttonColor: '#ffd700',
    buttonTextColor: '#240046',
    fontFamily: 'Poppins',
    buttonStyle: 'shadow',
    backgroundType: 'solid',
    gradientFrom: '#240046',
    gradientTo: '#3c096c',
  },
  {
    name: 'Desi Rang',
    backgroundColor: '#ff9933',
    cardColor: '#ffffff',
    textColor: '#333333',
    buttonColor: '#138808',
    buttonTextColor: '#ffffff',
    fontFamily: 'Poppins',
    buttonStyle: 'pill',
    backgroundType: 'gradient',
    gradientFrom: '#ff9933',
    gradientTo: '#138808',
  },
  {
    name: 'Neon Night',
    backgroundColor: '#0a0a0a',
    cardColor: '#1a1a1a',
    textColor: '#ffffff',
    buttonColor: '#ff006e',
    buttonTextColor: '#ffffff',
    fontFamily: 'Outfit',
    buttonStyle: 'outline',
    backgroundType: 'solid',
    gradientFrom: '#0a0a0a',
    gradientTo: '#1a1a1a',
  },
  {
    name: 'Pastel Dream',
    backgroundColor: '#fce4ec',
    cardColor: '#ffffff',
    textColor: '#4a4a4a',
    buttonColor: '#f48fb1',
    buttonTextColor: '#ffffff',
    fontFamily: 'Nunito',
    buttonStyle: 'pill',
    backgroundType: 'solid',
    gradientFrom: '#fce4ec',
    gradientTo: '#f3e5f5',
  },
  {
    name: 'Ocean Blue',
    backgroundColor: '#0077b6',
    cardColor: '#ffffff',
    textColor: '#333333',
    buttonColor: '#00b4d8',
    buttonTextColor: '#ffffff',
    fontFamily: 'Inter',
    buttonStyle: 'rounded',
    backgroundType: 'gradient',
    gradientFrom: '#0077b6',
    gradientTo: '#00b4d8',
  },
  {
    name: 'Minimal Gray',
    backgroundColor: '#f5f5f5',
    cardColor: '#ffffff',
    textColor: '#333333',
    buttonColor: '#333333',
    buttonTextColor: '#ffffff',
    fontFamily: 'Inter',
    buttonStyle: 'square',
    backgroundType: 'solid',
    gradientFrom: '#f5f5f5',
    gradientTo: '#e0e0e0',
  },
];

module.exports = {
  RESERVED_USERNAMES,
  INDIAN_STATES,
  CATEGORIES,
  CATEGORY_EMOJIS,
  PLATFORM_LIST,
  SOCIAL_PLATFORMS,
  SUBSCRIPTION_AMOUNT,
  YEARLY_SUBSCRIPTION_AMOUNT,
  FONT_OPTIONS,
  BUTTON_STYLES,
  DEFAULT_THEME,
  PRESET_THEMES
};
