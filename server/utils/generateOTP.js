const crypto = require('crypto');

/**
 * Generate a random 6-digit numeric OTP
 * Uses crypto.randomInt() for cryptographic randomness
 *
 * @returns {string} 6-digit OTP string (e.g., "482910")
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Generate a random hex token
 *
 * @param {number} length - Byte length (default: 32 → 64 hex chars)
 * @returns {string} Random hex string
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

module.exports = {
  generateOTP,
  generateSecureToken,
};