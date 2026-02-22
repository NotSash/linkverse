const Razorpay = require('razorpay');

/**
 * Configure Razorpay payment gateway instance
 * Returns null if keys are not configured (dev mode)
 */

let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const keyType = process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_') ? 'TEST' : 'LIVE';
    console.log(`💳 Razorpay configured in ${keyType} mode`);
  } catch (error) {
    console.error(`❌ Razorpay initialization failed: ${error.message}`);
    razorpayInstance = null;
  }
} else {
  console.warn('⚠️  Razorpay keys not configured — payment features disabled');
}

module.exports = razorpayInstance;