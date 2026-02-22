/**
 * Payment Controller
 * Handles Razorpay payment processing, verification, history, and invoices
 */

const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/sendEmail');
const { generateInvoice } = require('../utils/generateInvoice');
const { paymentEmailTemplate } = require('../templates/paymentEmail');
const {
  SUBSCRIPTION_AMOUNT,
  YEARLY_SUBSCRIPTION_AMOUNT,
} = require('../utils/constants');

// Initialize Razorpay — may be null if not configured
let razorpay = null;
try {
  razorpay = require('../config/razorpay');
} catch (err) {
  console.warn('⚠️ Razorpay not configured:', err.message);
}

// ============================================
// Helpers
// ============================================

/**
 * Get plan details from planType
 */
const getPlanDetails = (planType) => {
  const isYearly = planType === 'yearly';
  return {
    amount: isYearly ? YEARLY_SUBSCRIPTION_AMOUNT : SUBSCRIPTION_AMOUNT,
    days: isYearly ? 365 : 30,
    label: isYearly ? 'Pro Yearly' : 'Pro Monthly',
    description: isYearly
      ? 'LinkVerse Pro — Yearly Subscription'
      : 'LinkVerse Pro — Monthly Subscription',
  };
};

/**
 * Format amount from paise to rupee string
 */
const formatAmount = (paise) => {
  return '₹' + (paise / 100).toFixed(2);
};

/**
 * Activate or extend user subscription
 */
const activateSubscription = async (userId, daysToAdd) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const now = new Date();

  if (
    user.subscriptionStatus === 'active' &&
    user.subscriptionEndDate &&
    user.subscriptionEndDate > now
  ) {
    // Extend existing subscription
    user.subscriptionEndDate = new Date(
      user.subscriptionEndDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );
  } else {
    // New subscription
    user.subscriptionStartDate = now;
    user.subscriptionEndDate = new Date(
      now.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );
  }

  user.isPro = true;
  user.subscriptionStatus = 'active';
  await user.save();

  return user;
};

/**
 * Send payment confirmation email (fire-and-forget)
 */
const sendPaymentEmail = async (user, formattedAmount) => {
  try {
    const expiryDate = user.subscriptionEndDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const invoiceLink = `${
      process.env.FRONTEND_URL || 'http://localhost:5173'
    }/dashboard/billing`;

    const emailContent = paymentEmailTemplate(
      user.fullName,
      formattedAmount,
      expiryDate,
      invoiceLink
    );

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  } catch (emailErr) {
    console.error('Failed to send payment email:', emailErr.message);
  }
};

// ============================================
// Controllers
// ============================================

/**
 * @desc    Create a Razorpay order for subscription payment
 * @route   POST /api/payment/create-order
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
  const { planType = 'monthly' } = req.body;
  const plan = getPlanDetails(planType);

  // Mock mode — Razorpay not configured
  if (!razorpay) {
    const mockOrderId = 'order_mock_' + Date.now();

    const payment = await Payment.create({
      userId: req.user._id,
      razorpayOrderId: mockOrderId,
      amount: plan.amount,
      currency: 'INR',
      status: 'created',
      planType,
    });

    return res.status(201).json({
      success: true,
      data: {
        orderId: mockOrderId,
        amount: plan.amount,
        currency: 'INR',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
        paymentId: payment._id,
        planType,
        mockMode: true,
      },
    });
  }

  // Real Razorpay order
  const orderOptions = {
    amount: plan.amount,
    currency: 'INR',
    receipt: `rcpt_${req.user._id}_${Date.now()}`,
    notes: {
      userId: req.user._id.toString(),
      email: req.user.email,
      username: req.user.username,
      plan: plan.label,
    },
  };

  const razorpayOrder = await razorpay.orders.create(orderOptions);

  const payment = await Payment.create({
    userId: req.user._id,
    razorpayOrderId: razorpayOrder.id,
    amount: plan.amount,
    currency: 'INR',
    status: 'created',
    planType,
  });

  res.status(201).json({
    success: true,
    data: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
      planType,
    },
  });
});

/**
 * @desc    Verify payment after Razorpay callback
 * @route   POST /api/payment/verify
 * @access  Private
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    mockPayment,
    planType,
  } = req.body;

  // ═══════════════════════════════════════════
  // MOCK PAYMENT
  // ═══════════════════════════════════════════
  if (mockPayment === true) {
    const selectedPlan = planType || 'monthly';
    const plan = getPlanDetails(selectedPlan);

    // Generate sequential invoice number
    const invoiceNumber = await Payment.generateInvoiceNumber();

    const payment = await Payment.create({
      userId: req.user._id,
      razorpayOrderId: 'order_mock_' + Date.now(),
      razorpayPaymentId: 'pay_mock_' + Date.now(),
      amount: plan.amount,
      currency: 'INR',
      status: 'captured',
      method: 'mock',
      planType: selectedPlan,
      invoiceNumber,
    });

    const user = await activateSubscription(req.user._id, plan.days);

    // Send email (fire-and-forget)
    sendPaymentEmail(user, formatAmount(plan.amount));

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Your Pro plan is now active.',
      data: {
        paymentId: payment._id,
        invoiceNumber,
        amount: formatAmount(plan.amount),
        status: 'captured',
        subscriptionStatus: 'active',
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        isPro: true,
      },
    });
  }

  // ═══════════════════════════════════════════
  // REAL RAZORPAY PAYMENT
  // ═══════════════════════════════════════════
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Missing payment verification details');
  }

  // Find the payment record
  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
  });
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  // Verify ownership
  if (payment.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Payment does not belong to this user');
  }

  // Prevent double-processing
  if (payment.status === 'captured') {
    return res.status(200).json({
      success: true,
      message: 'Payment already verified.',
      data: {
        paymentId: payment._id,
        invoiceNumber: payment.invoiceNumber,
        amount: formatAmount(payment.amount),
        status: 'captured',
        alreadyProcessed: true,
      },
    });
  }

  // Verify Razorpay signature
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (
    razorpayKeySecret &&
    razorpayKeySecret !== 'your_razorpay_key_secret_here'
  ) {
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'failed';
      payment.razorpayPaymentId = razorpay_payment_id;
      await payment.save();

      res.status(400);
      throw new Error('Payment verification failed. Invalid signature.');
    }
  }

  // Generate sequential invoice number
  const invoiceNumber = await Payment.generateInvoiceNumber();

  // Update payment record
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = 'captured';
  payment.invoiceNumber = invoiceNumber;

  // Try to get payment method from Razorpay
  if (razorpay) {
    try {
      const paymentDetails = await razorpay.payments.fetch(
        razorpay_payment_id
      );
      payment.method = paymentDetails.method || 'online';
    } catch (err) {
      console.warn(
        'Could not fetch payment details from Razorpay:',
        err.message
      );
      payment.method = 'online';
    }
  }

  await payment.save();

  // Activate subscription
  const daysToAdd = payment.planType === 'yearly' ? 365 : 30;
  const user = await activateSubscription(req.user._id, daysToAdd);

  // Send email (fire-and-forget)
  sendPaymentEmail(user, formatAmount(payment.amount));

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully! Your Pro plan is now active.',
    data: {
      paymentId: payment._id,
      invoiceNumber: payment.invoiceNumber,
      amount: formatAmount(payment.amount),
      status: 'captured',
      subscriptionStatus: 'active',
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      isPro: true,
    },
  });
});

/**
 * @desc    Get user's payment history
 * @route   GET /api/payment/history
 * @access  Private
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [payments, total, summaryResult] = await Promise.all([
    Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments({ userId: req.user._id }),
    Payment.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  // Build summary from aggregation
  const capturedSummary = summaryResult.find((s) => s._id === 'captured') || {
    count: 0,
    totalAmount: 0,
  };
  const failedCount =
    summaryResult
      .filter((s) => s._id !== 'captured')
      .reduce((sum, s) => sum + s.count, 0) || 0;

  res.status(200).json({
    success: true,
    data: {
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
      summary: {
        totalSpent: capturedSummary.totalAmount,
        totalSpentFormatted: formatAmount(capturedSummary.totalAmount),
        totalPayments: total,
        capturedPayments: capturedSummary.count,
        failedPayments: failedCount,
      },
    },
  });
});

/**
 * @desc    Generate/download invoice for a payment
 * @route   GET /api/payment/invoice/:paymentId
 * @access  Private
 */
const getInvoice = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId).lean();

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (payment.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied. This payment does not belong to you.');
  }

  if (payment.status !== 'captured') {
    res.status(400);
    throw new Error('Invoice is only available for completed payments');
  }

  const invoiceHTML = generateInvoice(
    {
      invoiceNumber: payment.invoiceNumber || 'N/A',
      date: payment.createdAt,
      amount: payment.amount,
      method: payment.method,
      planType: payment.planType || 'monthly',
      transactionId: payment.razorpayPaymentId,
      orderId: payment.razorpayOrderId,
      status: payment.status,
    },
    {
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      username: req.user.username,
      city: req.user.city,
      state: req.user.state,
    }
  );

  res.status(200).json({
    success: true,
    data: {
      invoiceHTML,
      invoiceNumber: payment.invoiceNumber,
      paymentDate: payment.createdAt,
    },
  });
});

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getInvoice,
};