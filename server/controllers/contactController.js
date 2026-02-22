/**
 * Contact Controller — server/controllers/contactController.js
 *
 * Handles public contact form submissions with validation and spam prevention.
 */

const Contact = require('../models/Contact');

// ============================================
// Constants
// ============================================

const MAX_SUBMISSIONS_PER_DAY = 3;
const MAX_NAME_LENGTH = 100;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 2000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================
// Controller
// ============================================

/**
 * Submit Contact Form
 * POST /api/contact
 * Public — no auth required
 */
const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // ---- Validate required fields ----
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, email, subject, message',
      });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.toLowerCase().trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    // ---- Validate lengths ----
    if (trimmedName.length > MAX_NAME_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Name cannot exceed ${MAX_NAME_LENGTH} characters`,
      });
    }

    if (trimmedSubject.length > MAX_SUBJECT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Subject cannot exceed ${MAX_SUBJECT_LENGTH} characters`,
      });
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
      });
    }

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters',
      });
    }

    if (trimmedMessage.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters',
      });
    }

    // ---- Validate email format ----
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // ---- Spam prevention: rate limit per email ----
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSubmissions = await Contact.countDocuments({
      email: trimmedEmail,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    if (recentSubmissions >= MAX_SUBMISSIONS_PER_DAY) {
      return res.status(429).json({
        success: false,
        message:
          'You have submitted too many messages recently. Please try again after 24 hours.',
      });
    }

    // ---- Create the contact ticket ----
    const contact = await Contact.create({
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
      status: 'open',
    });

    res.status(201).json({
      success: true,
      message:
        "Your message has been sent! We'll get back to you within 24 hours. 📬",
      data: {
        ticketId: contact._id,
        submittedAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Contact form submission error:', error.message);
    next(error);
  }
};

module.exports = {
  submitContact,
};