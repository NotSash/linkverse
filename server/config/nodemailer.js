/**
 * Nodemailer Configuration
 * 
 * Sets up the SMTP transporter only.
 * All email sending logic lives in utils/sendEmail.js
 */

const nodemailer = require('nodemailer');

const isSmtpConfigured = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

let transporter = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  transporter.verify()
    .then(() => {
      console.log('📧 SMTP email transport verified');
    })
    .catch((error) => {
      console.warn('⚠️  SMTP verification failed:', error.message);
    });
} else {
  console.log('📧 SMTP not configured — emails will be logged to console');
}

module.exports = { transporter, isSmtpConfigured };