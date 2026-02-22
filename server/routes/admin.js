/**
 * Admin Routes — server/routes/admin.js
 *
 * All routes except login require admin authentication.
 */

const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/admin');
const { authLimiter } = require('../middleware/rateLimiter');
const adminController = require('../controllers/adminController');

// Public
router.post('/login', authLimiter, adminController.adminLogin);

// Protected — require admin JWT
router.get('/stats', adminAuth, adminController.getStats);
router.get('/users', adminAuth, adminController.getUsers);
router.get('/users/:id', adminAuth, adminController.getUserDetails);
router.put('/users/:id/ban', adminAuth, adminController.toggleBan);
router.get('/payments', adminAuth, adminController.getPayments);
router.get('/support', adminAuth, adminController.getSupportTickets);
router.put('/support/:id/resolve', adminAuth, adminController.resolveTicket);
router.get('/export/users', adminAuth, adminController.exportUsersCSV);
router.post('/create', adminAuth, adminController.createAdmin);

module.exports = router;