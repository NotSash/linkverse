const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required for OTP'],
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    minlength: 6,
    maxlength: 6,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function () {
      return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    },
    index: { expires: 0 }, // TTL index — auto-delete on expiry
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Instance method: Check if OTP has expired
otpSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

// Static: Delete all OTPs for a given email
otpSchema.statics.deleteByEmail = async function (email) {
  return this.deleteMany({ email: email.toLowerCase() });
};

// Static: Find valid (non-expired) OTP for an email
otpSchema.statics.findValidOTP = async function (email, otp) {
  return this.findOne({
    email: email.toLowerCase(),
    otp,
    expiresAt: { $gt: new Date() },
  });
};

module.exports = mongoose.model('OTP', otpSchema);