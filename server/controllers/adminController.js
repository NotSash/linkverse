/**
 * Admin Controller — server/controllers/adminController.js
 *
 * Handles all admin panel functionality:
 * - Admin login with JWT
 * - Platform stats & dashboard data
 * - User management (list, search, filter, ban/unban)
 * - Payment records with search & filters
 * - Support tickets with pagination
 * - CSV export
 * - Create new admin (superadmin only)
 */

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Contact = require('../models/Contact');
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================
// Helpers
// ============================================

/**
 * Sanitize pagination params
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * CSV escape helper
 */
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// ============================================
// Auth
// ============================================

/**
 * POST /api/admin/login
 * Admin login — separate from user login
 */
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Find admin with password field included
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select(
    '+password'
  );
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials',
    });
  }

  // Use model's comparePassword method
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials',
    });
  }

  // Generate admin JWT
  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  res.status(200).json({
    success: true,
    message: 'Admin login successful',
    data: {
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    },
  });
});

// ============================================
// Dashboard Stats
// ============================================

/**
 * GET /api/admin/stats
 * Comprehensive platform stats for admin dashboard
 */
const getStats = asyncHandler(async (req, res) => {
  // Run all queries in parallel
  const [
    totalUsers,
    activeSubscribers,
    expiredUsers,
    freeUsers,
    revenueResult,
    monthlyRevenueResult,
    viewsResult,
    signupsPerDay,
    revenuePerDay,
    usersByCategory,
    usersByState,
    recentSignups,
    openTickets,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isPro: true, subscriptionStatus: 'active' }),
    User.countDocuments({ subscriptionStatus: 'expired' }),
    User.countDocuments({ subscriptionStatus: 'inactive' }),

    // Total revenue
    Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // This month's revenue
    (() => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      return Payment.aggregate([
        { $match: { status: 'captured', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
    })(),

    // Total page views
    User.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$analytics.totalViews' },
        },
      },
    ]),

    // Signups per day (last 30 days)
    (() => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
      ]);
    })(),

    // Revenue per day (last 30 days)
    (() => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return Payment.aggregate([
        {
          $match: {
            status: 'captured',
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', total: { $divide: ['$total', 100] }, _id: 0 } },
      ]);
    })(),

    // Users by category
    User.aggregate([
      { $match: { category: { $ne: '' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]),

    // Users by state (top 10)
    User.aggregate([
      { $match: { state: { $ne: '' } } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { state: '$_id', count: 1, _id: 0 } },
    ]),

    // Recent signups
    User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        'fullName email username subscriptionStatus isPro profilePicture category createdAt'
      )
      .lean(),

    // Open tickets
    Contact.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
  ]);

  const totalRevenuePaise =
    revenueResult.length > 0 ? revenueResult[0].total : 0;
  const totalRevenueRupees = totalRevenuePaise / 100;

  const monthlyRevenuePaise =
    monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;
  const monthlyRevenueRupees = monthlyRevenuePaise / 100;

  const totalPageViews =
    viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

  const formatRupees = (amount) =>
    `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        activeSubscribers,
        expiredUsers,
        freeUsers,
        totalRevenue: totalRevenueRupees,
        totalRevenueFormatted: formatRupees(totalRevenueRupees),
        monthlyRevenue: monthlyRevenueRupees,
        monthlyRevenueFormatted: formatRupees(monthlyRevenueRupees),
        totalPageViews,
        openTickets,
      },
      charts: {
        signupsPerDay,
        revenuePerDay,
        usersByCategory,
        usersByState,
      },
      recentSignups,
    },
  });
});

// ============================================
// User Management
// ============================================

/**
 * GET /api/admin/users
 * List users with search, filter, and pagination
 */
const getUsers = asyncHandler(async (req, res) => {
  const { search, status, category, state } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const query = {};

  // Search
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { username: searchRegex },
      { phone: searchRegex },
    ];
  }

  // Status filter
  if (status && status !== 'all') {
    if (status === 'active') {
      query.isPro = true;
      query.subscriptionStatus = 'active';
    } else if (status === 'banned') {
      query.isBanned = true;
    } else {
      query.subscriptionStatus = status;
    }
  }

  if (category && category !== 'all') query.category = category;
  if (state && state !== 'all') query.state = state;

  const [users, totalUsers] = await Promise.all([
    User.find(query)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

/**
 * GET /api/admin/users/:id
 * Get detailed user information including payment history
 */
const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [user, payments] = await Promise.all([
    User.findById(id).select('-password -__v').lean(),
    Payment.find({ userId: id }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const totalPaid = payments
    .filter((p) => p.status === 'captured')
    .reduce((sum, p) => sum + p.amount, 0);

  const linkClicksTotal = (user.links || []).reduce(
    (sum, l) => sum + (l.clickCount || 0),
    0
  );

  res.status(200).json({
    success: true,
    data: {
      user,
      payments,
      stats: {
        totalLinksCount: (user.links || []).length,
        activeLinksCount: (user.links || []).filter((l) => l.isActive !== false)
          .length,
        totalClicks: linkClicksTotal,
        totalViews: user.analytics?.totalViews || 0,
        totalPaid: totalPaid / 100,
        totalPaidFormatted: `₹${(totalPaid / 100).toFixed(2)}`,
        paymentsCount: payments.length,
      },
    },
  });
});

/**
 * PUT /api/admin/users/:id/ban
 * Toggle ban/unban a user
 */
const toggleBan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  user.isBanned = !user.isBanned;

  if (user.isBanned) {
    user.isPro = false;
    user.subscriptionStatus = 'cancelled';
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: user.isBanned
      ? `User ${user.fullName} has been banned. Their page is now offline.`
      : `User ${user.fullName} has been unbanned.`,
    data: {
      userId: user._id,
      isBanned: user.isBanned,
      isPro: user.isPro,
      subscriptionStatus: user.subscriptionStatus,
    },
  });
});

// ============================================
// Payment Records
// ============================================

/**
 * GET /api/admin/payments
 * List payments with search, filter, and pagination
 */
const getPayments = asyncHandler(async (req, res) => {
  const { search, status, method, startDate, endDate } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const query = {};

  if (status && status !== 'all') query.status = status;
  if (method && method !== 'all') query.method = method;

  // Date range
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  // Search
  if (search) {
    const searchRegex = new RegExp(search, 'i');

    if (
      search.startsWith('pay_') ||
      search.startsWith('order_') ||
      search.startsWith('LV-')
    ) {
      // Search by payment/order/invoice ID
      query.$or = [
        { razorpayPaymentId: searchRegex },
        { razorpayOrderId: searchRegex },
        { invoiceNumber: searchRegex },
      ];
    } else {
      // Search by user details
      const matchingUsers = await User.find({
        $or: [
          { email: searchRegex },
          { fullName: searchRegex },
          { username: searchRegex },
        ],
      })
        .select('_id')
        .lean();

      query.userId = { $in: matchingUsers.map((u) => u._id) };
    }
  }

  const [payments, totalPayments, revenueResult] = await Promise.all([
    Payment.find(query)
      .populate('userId', 'fullName email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(query),
    Payment.aggregate([
      {
        $match: {
          ...query,
          // Override status to only sum captured
          status: 'captured',
          // Remove any $or from the revenue query to avoid conflicts
          ...(!query.$or ? {} : {}),
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).catch(() => []),
  ]);

  const filteredRevenuePaise =
    revenueResult.length > 0 ? revenueResult[0].total : 0;

  res.status(200).json({
    success: true,
    data: {
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPayments / limit),
        totalPayments,
        itemsPerPage: limit,
      },
      totalRevenue: filteredRevenuePaise / 100,
      totalRevenueFormatted: `₹${(filteredRevenuePaise / 100).toLocaleString(
        'en-IN',
        { minimumFractionDigits: 2 }
      )}`,
    },
  });
});

// ============================================
// Support Tickets
// ============================================

/**
 * GET /api/admin/support
 * List support tickets with pagination
 */
const getSupportTickets = asyncHandler(async (req, res) => {
  const { status: ticketStatus } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  const query = {};
  if (ticketStatus && ticketStatus !== 'all') {
    query.status = ticketStatus;
  }

  const [tickets, total, stats] = await Promise.all([
    Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Contact.countDocuments(query),
    Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const statMap = { open: 0, 'in-progress': 0, resolved: 0 };
  let totalAll = 0;
  for (const s of stats) {
    statMap[s._id] = s.count;
    totalAll += s.count;
  }

  res.status(200).json({
    success: true,
    data: {
      tickets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTickets: total,
        itemsPerPage: limit,
      },
      stats: {
        total: totalAll,
        ...statMap,
      },
    },
  });
});

/**
 * PUT /api/admin/support/:id/resolve
 * Mark a support ticket as resolved
 */
const resolveTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await Contact.findById(id);
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found',
    });
  }

  if (ticket.status === 'resolved') {
    return res.status(400).json({
      success: false,
      message: 'Ticket is already resolved',
    });
  }

  ticket.status = 'resolved';
  ticket.resolvedBy = req.admin._id;
  ticket.resolvedAt = new Date();
  await ticket.save();

  res.status(200).json({
    success: true,
    message: 'Ticket marked as resolved ✅',
    data: { ticket },
  });
});

// ============================================
// CSV Export
// ============================================

/**
 * GET /api/admin/export/users
 * Export all users as CSV
 */
const exportUsersCSV = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select(
      'fullName email phone username category city state subscriptionStatus isPro isBanned bio analytics.totalViews analytics.totalClicks links createdAt updatedAt'
    )
    .sort({ createdAt: -1 })
    .lean();

  const headers = [
    'Full Name',
    'Email',
    'Phone',
    'Username',
    'Category',
    'City',
    'State',
    'Subscription',
    'Pro',
    'Banned',
    'Bio',
    'Views',
    'Clicks',
    'Links',
    'Has Photo',
    'Joined',
    'Updated',
  ];

  const rows = users.map((u) =>
    [
      escapeCSV(u.fullName),
      escapeCSV(u.email),
      escapeCSV(u.phone),
      escapeCSV(u.username),
      escapeCSV(u.category),
      escapeCSV(u.city),
      escapeCSV(u.state),
      escapeCSV(u.subscriptionStatus),
      escapeCSV(u.isPro ? 'Yes' : 'No'),
      escapeCSV(u.isBanned ? 'Yes' : 'No'),
      escapeCSV(u.bio),
      escapeCSV(u.analytics?.totalViews || 0),
      escapeCSV(u.analytics?.totalClicks || 0),
      escapeCSV(u.links ? u.links.length : 0),
      escapeCSV(u.profilePicture ? 'Yes' : 'No'),
      escapeCSV(u.createdAt ? new Date(u.createdAt).toISOString() : ''),
      escapeCSV(u.updatedAt ? new Date(u.updatedAt).toISOString() : ''),
    ].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');

  const filename = `linkverse-users-${new Date().toISOString().split('T')[0]}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csvContent);
});

// ============================================
// Admin Management
// ============================================

/**
 * POST /api/admin/create
 * Create a new admin account (superadmin only)
 */
const createAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Only superadmin can create
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Only superadmins can create new admin accounts',
    });
  }

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const existingAdmin = await Admin.findOne({
    email: email.toLowerCase(),
  });
  if (existingAdmin) {
    return res.status(400).json({
      success: false,
      message: 'An admin with this email already exists',
    });
  }

  // ⚠️ FIXED: Pass plain password — let the pre('save') hook hash it
  // Previously this was manually hashed + then the hook hashed again = double hash
  const admin = await Admin.create({
    email: email.toLowerCase(),
    password: password,
    role: 'admin',
  });

  res.status(201).json({
    success: true,
    message: 'Admin account created successfully',
    data: {
      admin: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    },
  });
});

module.exports = {
  adminLogin,
  getStats,
  getUsers,
  getUserDetails,
  toggleBan,
  getPayments,
  getSupportTickets,
  resolveTicket,
  exportUsersCSV,
  createAdmin,
};