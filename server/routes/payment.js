/**
 * Payment Routes — server/routes/payment.js
 *
 * All routes require authentication.
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/create-order', auth, paymentController.createOrder);
router.post('/verify', auth, paymentController.verifyPayment);
router.get('/history', auth, paymentController.getPaymentHistory);
router.get('/invoice/:paymentId', auth, paymentController.getInvoice);

module.exports = router;