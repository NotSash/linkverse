/**
 * Payment Model
 *
 * Tracks all Razorpay payment transactions for LinkVerse Pro subscription.
 * Amount is stored in paise (4900 = ₹49.00) as per Razorpay convention.
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // Reference to the user who made the payment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // Razorpay transaction identifiers
    razorpayOrderId: {
      type: String,
      required: [true, 'Razorpay Order ID is required'],
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },

    // Payment amount in paise (4900 = ₹49.00)
    amount: {
      type: Number,
      required: true,
      default: 4900,
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },

    // Payment status tracking
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },

    // Payment method used — expanded to support all Razorpay methods
    method: {
      type: String,
      default: '',
      // Don't restrict enum — Razorpay can return various method strings
    },

    // Subscription plan type
    planType: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },

    // Auto-generated invoice number (format: LV-YYYY-NNNNN)
    invoiceNumber: {
      type: String,
      default: '',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound Indexes ────────────────────────────────────────────────
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ createdAt: -1 });

// ─── Static Methods ─────────────────────────────────────────────────

/**
 * Generate the next sequential invoice number
 * Format: LV-YYYY-NNNNN (e.g., LV-2024-00001)
 * Uses the last invoice number to determine the next, avoiding race conditions
 * with atomic findOne + sort
 */
paymentSchema.statics.generateInvoiceNumber = async function () {
  const year = new Date().getFullYear();
  const prefix = `LV-${year}-`;

  const lastPayment = await this.findOne({
    invoiceNumber: { $regex: `^${prefix}` },
  })
    .sort({ invoiceNumber: -1 })
    .select('invoiceNumber')
    .lean();

  let nextNumber = 1;

  if (lastPayment?.invoiceNumber) {
    const parts = lastPayment.invoiceNumber.split('-');
    const lastNumber = parseInt(parts[2], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(5, '0')}`;
};

/**
 * Get total revenue (sum of all captured payments) in paise
 */
paymentSchema.statics.getTotalRevenue = async function () {
  const result = await this.aggregate([
    { $match: { status: 'captured' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
};

/**
 * Get revenue breakdown by month for the current year
 */
paymentSchema.statics.getMonthlyRevenue = async function () {
  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1);

  return this.aggregate([
    {
      $match: {
        status: 'captured',
        createdAt: { $gte: startOfYear },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;