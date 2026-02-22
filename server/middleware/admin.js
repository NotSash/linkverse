/**
 * Admin JWT Authentication Middleware
 * Verifies admin JWT token and attaches admin document to req.admin.
 *
 * Usage: router.get('/admin-route', adminAuth, handler)
 */

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Admin access denied. No token provided.',
      });
    }

    const token = authHeader.slice(7);

    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({
        success: false,
        message: 'Admin access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify token has admin role
    if (decoded.role !== 'superadmin') {
      return res.status(401).json({
        success: false,
        message: 'Admin access denied. Insufficient privileges.',
      });
    }

    // Password excluded by default via select: false on schema
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found.',
      });
    }

    if (admin.role !== 'superadmin') {
      return res.status(401).json({
        success: false,
        message: 'Admin access denied. Insufficient privileges.',
      });
    }

    req.admin = admin;
    req.adminToken = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token. Please log in again.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin token has expired. Please log in again.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Admin authentication error. Please try again.',
    });
  }
};

module.exports = { adminAuth };