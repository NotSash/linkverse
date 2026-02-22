/**
 * Email Sending Utility
 * 
 * Single source of truth for sending emails in LinkVerse.
 * Uses the transporter from config/nodemailer.js
 * Falls back to console logging when SMTP is not configured.
 */

const { transporter, isSmtpConfigured } = require('../config/nodemailer');

const DEFAULT_FROM = `"LinkVerse" <${process.env.SMTP_USER || 'noreply@linkverse.com'}>`;

/**
 * Send an email
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Subject line
 * @param {string} options.html - HTML body
 * @param {string} [options.from] - Sender (defaults to LinkVerse)
 * @param {string} [options.text] - Plain text alternative
 * @returns {Promise<boolean>} true if sent successfully
 */
const sendEmail = async ({ to, subject, html, from, text }) => {
  try {
    if (!to || !subject || !html) {
      console.error('❌ sendEmail: Missing required fields (to, subject, html)');
      return false;
    }

    if (!isSmtpConfigured || !transporter) {
      // Dev mode fallback — log to console
      const plainText = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 500);

      console.log('\n📧 ═══════════════════════════════════════════');
      console.log('📧 EMAIL (Dev Mode — SMTP not configured)');
      console.log('📧 ═══════════════════════════════════════════');
      console.log(`📧 To:      ${to}`);
      console.log(`📧 Subject: ${subject}`);
      console.log(`📧 From:    ${from || DEFAULT_FROM}`);
      console.log('📧 ───────────────────────────────────────────');
      console.log(`📧 Body:    ${plainText}${plainText.length >= 500 ? '...' : ''}`);
      console.log('📧 ═══════════════════════════════════════════\n');

      return true; // Return true so app flow continues
    }

    const info = await transporter.sendMail({
      from: from || DEFAULT_FROM,
      to,
      subject,
      html,
      ...(text && { text }),
    });

    console.log(`📧 Email sent to ${to} | MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return false;
  }
};

/**
 * Send a batch of emails sequentially
 * 
 * @param {Array<Object>} emails - Array of { to, subject, html }
 * @returns {Promise<{ sent: number, failed: number }>}
 */
const sendBatchEmails = async (emails) => {
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendEmail(email);
    if (result) sent++;
    else failed++;

    // Small delay to avoid SMTP rate limiting
    if (isSmtpConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  console.log(`📧 Batch results: ${sent} sent, ${failed} failed`);
  return { sent, failed };
};

module.exports = { sendEmail, sendBatchEmails };