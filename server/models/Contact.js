/**
 * Contact/Support Model — server/models/Contact.js
 *
 * Stores contact form submissions from users/visitors.
 * Features:
 *   - Name, email, subject, and message fields
 *   - Status tracking: "open" → "in-progress" → "resolved"
 *   - Admin can view and resolve tickets from the admin panel
 *   - Timestamps for tracking response times
 */

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'in-progress', 'resolved'],
        message: 'Status must be "open", "in-progress", or "resolved"',
      },
      default: 'open',
    },
    // Track which admin resolved the ticket
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    // Optional admin notes
    adminNotes: {
      type: String,
      default: '',
      maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1, createdAt: -1 });

// ─── Instance Methods ────────────────────────────────────────────────

/**
 * Mark ticket as resolved
 */
contactSchema.methods.resolve = function (adminId) {
  this.status = 'resolved';
  this.resolvedBy = adminId || null;
  this.resolvedAt = new Date();
  return this.save();
};

// ─── Static Methods ──────────────────────────────────────────────────

/**
 * Get open ticket count (for admin dashboard badge)
 */
contactSchema.statics.getOpenCount = async function () {
  return this.countDocuments({ status: { $in: ['open', 'in-progress'] } });
};

/**
 * Get ticket stats for admin dashboard
 */
contactSchema.statics.getStats = async function () {
  const result = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const stats = { open: 0, 'in-progress': 0, resolved: 0, total: 0 };
  for (const item of result) {
    stats[item._id] = item.count;
    stats.total += item.count;
  }
  return stats;
};

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;