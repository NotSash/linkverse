const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP } = require('../utils/generateOTP');
const { sendEmail } = require('../utils/sendEmail');
const { otpEmailTemplate } = require('../templates/otpEmail');
const { welcomeEmailTemplate } = require('../templates/welcomeEmail');
const { resetEmailTemplate } = require('../templates/resetEmail');
const { RESERVED_USERNAMES } = require('../utils/constants');

/**
 * Generate a JWT token for a user
 */
const generateAuthToken = (id, extraPayload = {}) => {
  return jwt.sign(
    { id, ...extraPayload },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Strip sensitive/unnecessary fields from user object
 */
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.__v;
  return userObj;
};

/**
 * POST /api/auth/signup
 */
exports.signup = async (req, res, next) => {
  try {
    const { fullName, email, phone, username, password, category } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // Check reserved usernames
    if (RESERVED_USERNAMES.includes(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message: 'This username is reserved. Please choose a different one.',
      });
    }

    // Check for duplicates in a single query
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone },
        { username: normalizedUsername },
      ],
    });

    if (existingUser) {
      let field = 'email';
      let message = 'An account with this email already exists.';

      if (existingUser.phone === phone) {
        field = 'phone';
        message = 'An account with this phone number already exists.';
      } else if (existingUser.username === normalizedUsername) {
        field = 'username';
        message = 'This username is already taken.';
      }

      return res.status(400).json({ success: false, message, field });
    }

    // Create user — password is auto-hashed by pre-save hook
    const user = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone,
      username: normalizedUsername,
      password,
      category: category || 'Other',
    });

    await user.save();

    // Generate and send OTP
    const otp = generateOTP();
    await OTP.deleteMany({ email: normalizedEmail });
    await new OTP({ email: normalizedEmail, otp }).save();

    const { subject, html } = otpEmailTemplate(otp);
    await sendEmail({ to: normalizedEmail, subject, html });

    res.status(201).json({
      success: true,
      message: 'Account created! OTP sent to your email for verification.',
      data: { email: normalizedEmail, username: normalizedUsername },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Use the static method we defined on the model
    const otpDoc = await OTP.findValidOTP(normalizedEmail, otp.toString().trim());

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired or is invalid. Please request a new one.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.isVerified) {
      await OTP.deleteMany({ email: normalizedEmail });
      return res.status(400).json({
        success: false,
        message: 'Email is already verified.',
      });
    }

    // Mark as verified
    user.isVerified = true;
    await user.save();

    // Cleanup OTPs
    await OTP.deleteMany({ email: normalizedEmail });

    // Generate token for auto-login
    const token = generateAuthToken(user._id);

    // Send welcome email (fire and forget)
    const { subject, html } = welcomeEmailTemplate(user.fullName, user.username);
    sendEmail({ to: normalizedEmail, subject, html }).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to LinkVerse! 🎉',
      data: { token, user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-otp
 */
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    // Generic response for security (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a new OTP has been sent.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. You can log in.',
      });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email: normalizedEmail });
    await new OTP({ email: normalizedEmail, otp }).save();

    const { subject, html } = otpEmailTemplate(otp);
    await sendEmail({ to: normalizedEmail, subject, html });

    res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Explicitly select password (it's hidden by default via select: false)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // Use the instance method from the model
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Handle unverified email
    if (!user.isVerified) {
      // Check if an OTP was recently sent (prevent abuse)
      const recentOTP = await OTP.findOne({
        email: normalizedEmail,
        createdAt: { $gt: new Date(Date.now() - 60 * 1000) }, // Within last 60 seconds
      });

      if (!recentOTP) {
        const otp = generateOTP();
        await OTP.deleteMany({ email: normalizedEmail });
        await new OTP({ email: normalizedEmail, otp }).save();

        const { subject, html } = otpEmailTemplate(otp);
        sendEmail({ to: normalizedEmail, subject, html }).catch(() => {});
      }

      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new OTP has been sent to your email.',
        requiresVerification: true,
        email: normalizedEmail,
      });
    }

    const token = generateAuthToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: { token, user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const resetToken = jwt.sign(
        { id: user._id, purpose: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      const { subject, html } = resetEmailTemplate(user.fullName, resetURL);
      sendEmail({ to: normalizedEmail, subject, html }).catch(() => {});
    }

    // Always same response — prevents email enumeration
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      const message = jwtError.name === 'TokenExpiredError'
        ? 'This reset link has expired. Please request a new one.'
        : 'Invalid reset link. Please request a new one.';
      return res.status(400).json({ success: false, message });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token.',
      });
    }

    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Set new password — pre-save hook will hash it
    user.password = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/check-username/:username
 */
exports.checkUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const normalizedUsername = username?.toLowerCase().trim();

    if (!normalizedUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is required.',
      });
    }

    const usernameRegex = /^[a-z][a-z0-9_]{2,29}$/;
    if (!usernameRegex.test(normalizedUsername)) {
      return res.status(200).json({
        success: true,
        data: {
          available: false,
          message: 'Username must be 3-30 characters, start with a letter, and contain only lowercase letters, numbers, and underscores.',
        },
      });
    }

    if (RESERVED_USERNAMES.includes(normalizedUsername)) {
      return res.status(200).json({
        success: true,
        data: { available: false, message: 'This username is reserved.' },
      });
    }

    const existingUser = await User.findOne({ username: normalizedUsername }).select('_id').lean();

    res.status(200).json({
      success: true,
      data: {
        available: !existingUser,
        message: existingUser ? 'This username is already taken.' : 'Username is available!',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};