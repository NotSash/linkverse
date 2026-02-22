const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false, // Never return password by default
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true, // Explicit index for fast lookups
  },
  profilePicture: { type: String, default: '' },
  bio: { type: String, maxlength: 160, default: '' },
  category: {
    type: String,
    enum: [
      'Fashion', 'Beauty', 'Tech', 'Gaming', 'Food', 'Travel', 'Fitness',
      'Education', 'Finance', 'Comedy', 'Music', 'Art', 'Photography',
      'Lifestyle', 'Motivation', 'News', 'Sports', 'Vlogs', 'Reviews', 'Other',
    ],
    default: 'Other',
  },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  isPro: { type: Boolean, default: false },
  subscriptionStatus: {
    type: String,
    enum: ['inactive', 'active', 'expired', 'cancelled'],
    default: 'inactive',
  },
  subscriptionStartDate: { type: Date },
  subscriptionEndDate: { type: Date },
  razorpayCustomerId: { type: String },
  razorpaySubscriptionId: { type: String },

  // Theme settings
  theme: {
    backgroundColor: { type: String, default: '#ffffff' },
    cardColor: { type: String, default: '#f3f4f6' },
    textColor: { type: String, default: '#111827' },
    buttonColor: { type: String, default: '#6366f1' },
    buttonTextColor: { type: String, default: '#ffffff' },
    fontFamily: {
      type: String,
      enum: ['Inter', 'Poppins', 'Roboto', 'Nunito', 'Outfit'],
      default: 'Poppins',
    },
    buttonStyle: {
      type: String,
      enum: ['rounded', 'pill', 'square', 'outline', 'shadow'],
      default: 'pill',
    },
    backgroundType: {
      type: String,
      enum: ['solid', 'gradient', 'image'],
      default: 'solid',
    },
    gradientFrom: { type: String, default: '' },
    gradientTo: { type: String, default: '' },
    backgroundImage: { type: String, default: '' },
  },

  // Bio links
  links: [{
    title: { type: String, required: true, maxlength: 80 },
    url: { type: String, required: true },
    icon: { type: String, default: '' },
    platform: { type: String, default: 'Other' },
    isActive: { type: Boolean, default: true },
    clickCount: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  }],

  // Social media links
  socialLinks: {
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    snapchat: { type: String, default: '' },
    pinterest: { type: String, default: '' },
    telegram: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    discord: { type: String, default: '' },
    reddit: { type: String, default: '' },
    threads: { type: String, default: '' },
    koo: { type: String, default: '' },
    sharechat: { type: String, default: '' },
    moj: { type: String, default: '' },
    joshapp: { type: String, default: '' },
    chingari: { type: String, default: '' },
    roposo: { type: String, default: '' },
    mx_takatak: { type: String, default: '' },
    spotify: { type: String, default: '' },
    applemusic: { type: String, default: '' },
    jiosaavn: { type: String, default: '' },
    gaana: { type: String, default: '' },
    wynkmusic: { type: String, default: '' },
    hungama: { type: String, default: '' },
    github: { type: String, default: '' },
    dribbble: { type: String, default: '' },
    behance: { type: String, default: '' },
    medium: { type: String, default: '' },
    substack: { type: String, default: '' },
    quora: { type: String, default: '' },
  },

  // Analytics — counters only (time-series data should use a separate collection)
  analytics: {
    totalViews: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    viewsByDate: [{
      date: { type: Date },
      count: { type: Number, default: 0 },
    }],
    clicksByDate: [{
      date: { type: Date },
      count: { type: Number, default: 0 },
    }],
    clicksByLink: [{
      linkId: { type: mongoose.Schema.Types.ObjectId },
      count: { type: Number, default: 0 },
    }],
    topReferrers: [{
      source: { type: String },
      count: { type: Number, default: 0 },
    }],
    visitorLocations: [{
      city: { type: String },
      state: { type: String },
      count: { type: Number, default: 0 },
    }],
  },

  // SEO settings
  seoSettings: {
    metaTitle: { type: String, maxlength: 60, default: '' },
    metaDescription: { type: String, maxlength: 160, default: '' },
    ogImage: { type: String, default: '' },
  },
}, { timestamps: true });

// ─── Pre-save: hash password if modified ─────────────────────────────
UserSchema.pre('save', async function (next) {
  // Lowercase email and username
  if (this.isModified('email')) this.email = this.email.toLowerCase();
  if (this.isModified('username')) this.username = this.username.toLowerCase();

  // Hash password only if it was modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// ─── Instance method: compare password ───────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);