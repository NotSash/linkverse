/**
 * Payment Confirmation Email Template
 *
 * Sent after successful Razorpay payment verification.
 * Includes payment details, Pro features list, and invoice link.
 *
 * @param {string} name - Customer name
 * @param {string|number} amount - Amount (string like "₹49.00" or number in paise)
 * @param {string} expiryDate - Formatted expiry date string
 * @param {string} invoiceLink - URL to billing/invoice page
 * @returns {{ subject: string, html: string }}
 */

const paymentEmailTemplate = (name, amount, expiryDate, invoiceLink) => {
  // Normalize amount to display string
  let displayAmount;
  if (typeof amount === 'number') {
    displayAmount = amount > 100 ? (amount / 100).toFixed(2) : amount.toFixed(2);
  } else if (typeof amount === 'string') {
    displayAmount = amount.replace('₹', '').trim();
  } else {
    displayAmount = '49.00';
  }

  const subject = 'Payment Confirmed — LinkVerse Pro ✅';

  const frontendUrl = process.env.FRONTEND_URL || 'https://linkverse.com';

  const features = [
    'Unlimited links',
    '30+ platform support (including Indian platforms)',
    'Custom themes & appearance',
    'Detailed analytics dashboard',
    'SEO settings for better visibility',
    'Priority support',
    'Custom OG image',
    'LinkVerse branding removed',
    'GST invoice included',
  ];

  const featuresHtml = features
    .map(
      (f, i) => `
                <tr>
                  <td style="padding: 8px 0; color: #374151; font-size: 14px; line-height: 1.5;${
                    i % 2 === 1 ? ' background-color: #f9fafb;' : ''
                  }">
                    ✅ ${f}
                  </td>
                </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); padding: 36px 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 8px; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                LinkVerse
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">
                Payment Confirmed ✅
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 32px;">

              <!-- Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;">🎉</span>
              </div>

              <h2 style="color: #111827; margin: 0 0 8px; font-size: 24px; font-weight: 700; text-align: center;">
                Payment Successful!
              </h2>

              <p style="color: #4b5563; margin: 0 0 24px; font-size: 15px; line-height: 1.6; text-align: center;">
                Hey ${name || 'there'}, your payment of
                <strong style="color: #059669; font-size: 18px;">₹${displayAmount}</strong>
                has been received! 🎉
              </p>

              <!-- Subscription Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="
                    background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
                    border: 1px solid #bbf7d0;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                  ">
                    <p style="color: #166534; margin: 0 0 4px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Pro Plan Active
                    </p>
                    <p style="color: #15803d; margin: 0 0 12px; font-size: 14px;">
                      📅 Your Pro plan is now active until:
                    </p>
                    <p style="color: #166534; margin: 0; font-size: 22px; font-weight: 700;">
                      ${expiryDate || 'N/A'}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Features -->
              <h3 style="color: #111827; margin: 0 0 16px; font-size: 16px; font-weight: 600;">
                🚀 What you get with Pro:
              </h3>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                ${featuresHtml}
              </table>

              <!-- Invoice Button -->
              ${
                invoiceLink
                  ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${invoiceLink}" target="_blank" style="
                      display: inline-block;
                      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                      color: #ffffff;
                      text-decoration: none;
                      padding: 14px 36px;
                      border-radius: 50px;
                      font-size: 15px;
                      font-weight: 600;
                    ">📄 View Invoice</a>
                  </td>
                </tr>
              </table>`
                  : ''
              }

              <!-- Thank you -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 16px; text-align: center;">
                    <p style="color: #6b21a8; margin: 0; font-size: 14px; line-height: 1.6;">
                      🙏 Thank you for supporting LinkVerse! You're now part of a growing community of Indian creators.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 12px; font-size: 14px;">
                Ready to share your page?
              </p>
              <a href="${frontendUrl}/dashboard" target="_blank" style="
                display: inline-block;
                background-color: #111827;
                color: #ffffff;
                text-decoration: none;
                padding: 12px 32px;
                border-radius: 50px;
                font-size: 14px;
                font-weight: 600;
              ">Go to Dashboard →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px 32px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="color: #9ca3af; margin: 0 0 8px; font-size: 13px;">
                This is a payment confirmation from LinkVerse.
              </p>
              <p style="color: #9ca3af; margin: 0 0 8px; font-size: 13px;">
                Questions? Contact us at
                <a href="mailto:support@linkverse.com" style="color: #818cf8;">support@linkverse.com</a>
              </p>
              <p style="color: #6b7280; margin: 12px 0 0; font-size: 12px;">
                Made with ❤️ in India 🇮🇳
              </p>
              <p style="color: #6b7280; margin: 4px 0 0; font-size: 11px;">
                © ${new Date().getFullYear()} LinkVerse. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  return { subject, html };
};

// ⚠️ FIXED: Export as object for consistent destructured imports
module.exports = { paymentEmailTemplate };