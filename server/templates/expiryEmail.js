/**
 * Subscription Expiry Email Template
 *
 * Dual-purpose: handles both reminder (3 days before) and expired notifications.
 * Uses table-based layout for email client compatibility.
 *
 * @param {string} name - User's full name
 * @param {string} expiryDate - Formatted expiry date string
 * @param {boolean} [isReminder=true] - true = 3-day warning, false = already expired
 * @returns {{ subject: string, html: string }}
 */

const expiryEmailTemplate = (name, expiryDate, isReminder = true) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://linkverse.com';

  const subject = isReminder
    ? 'Your LinkVerse Pro expires in 3 days ⚠️'
    : 'Your LinkVerse Pro has expired 😔';

  const headerGradient = isReminder
    ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)'
    : 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)';

  const headerIcon = isReminder ? '⚠️' : '😔';
  const headerTitle = isReminder ? 'Expiring Soon' : 'Subscription Expired';

  const alertBg = isReminder ? '#fffbeb' : '#fef2f2';
  const alertBorder = isReminder ? '#fde68a' : '#fecaca';
  const alertText = isReminder ? '#92400e' : '#991b1b';

  // Build consequence rows
  const reminderRows = [
    { icon: '❌', text: 'Your public page will go offline' },
    { icon: '❌', text: 'Visitors will see a "page unavailable" message' },
    { icon: '❌', text: 'Analytics tracking will pause' },
    { icon: '✅', text: "Your data and links will be saved (don't worry!)" },
  ];

  const expiredRows = [
    { icon: '❌', text: 'Your public page is offline' },
    { icon: '❌', text: 'Visitors see "page unavailable" message' },
    { icon: '❌', text: 'Analytics tracking paused' },
    { icon: '✅', text: 'All your links and data are safe' },
    { icon: '✅', text: 'Your username is reserved' },
    { icon: '✅', text: 'Renew anytime to go live again instantly' },
  ];

  const rows = isReminder ? reminderRows : expiredRows;
  const rowsHtml = rows
    .map(
      (r, i) => `
                <tr>
                  <td style="padding: 8px 0; color: #4b5563; font-size: 14px;${
                    i % 2 === 1 ? ' background-color: #f9fafb;' : ''
                  }">
                    ${r.icon} ${r.text}
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
            <td style="background: ${headerGradient}; padding: 36px 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 8px; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                LinkVerse
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">
                ${headerTitle}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 32px;">

              <!-- Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;">${headerIcon}</span>
              </div>

              <h2 style="color: #111827; margin: 0 0 16px; font-size: 22px; font-weight: 600; text-align: center;">
                ${isReminder ? 'Your Pro Expires Soon!' : 'Your Pro Has Expired'}
              </h2>

              <p style="color: #4b5563; margin: 0 0 8px; font-size: 15px; line-height: 1.6;">
                Hey ${name || 'there'},
              </p>

              <p style="color: #4b5563; margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
                ${
                  isReminder
                    ? "Just a heads up — your LinkVerse Pro subscription is expiring soon. Renew now to keep your page live and accessible to your audience!"
                    : "Your LinkVerse Pro subscription has expired. Your page is now unpublished and not accessible to your audience. But don't worry — <strong>all your data is safe!</strong> Renew anytime to get back online instantly."
                }
              </p>

              <!-- Date Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: ${alertBg}; border: 1px solid ${alertBorder}; border-radius: 12px; padding: 20px; text-align: center;">
                    <p style="color: ${alertText}; margin: 0 0 8px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      ${isReminder ? '⏰ Expires On' : 'Expired On'}
                    </p>
                    <p style="color: ${alertText}; margin: 0; font-size: 22px; font-weight: 700;">
                      ${expiryDate || 'N/A'}
                    </p>
                    ${
                      isReminder
                        ? `<p style="color: ${alertText}; margin: 8px 0 0; font-size: 13px;">That's just 3 days away!</p>`
                        : ''
                    }
                  </td>
                </tr>
              </table>

              <!-- Consequences -->
              <h3 style="color: #111827; margin: 0 0 12px; font-size: 15px; font-weight: 600;">
                ${isReminder ? "What happens if you don't renew:" : "What's changed:"}
              </h3>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                ${rowsHtml}
              </table>

              ${
                !isReminder
                  ? `
              <!-- Pro tip for expired -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%); border: 1px solid #ddd6fe; border-radius: 8px; padding: 16px; text-align: center;">
                    <p style="color: #5b21b6; margin: 0; font-size: 14px; line-height: 1.6;">
                      💡 <strong>Pro tip:</strong> Renew today and your page goes live immediately — no setup needed!
                    </p>
                  </td>
                </tr>
              </table>`
                  : ''
              }

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
                <tr>
                  <td align="center">
                    <a href="${frontendUrl}/dashboard/billing" target="_blank" style="
                      display: inline-block;
                      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                      color: #ffffff;
                      text-decoration: none;
                      padding: 16px 48px;
                      border-radius: 50px;
                      font-size: 16px;
                      font-weight: 700;
                      letter-spacing: 0.3px;
                    ">Renew Now — ₹49/month</a>
                  </td>
                </tr>
              </table>

              <p style="color: #9ca3af; margin: 0; font-size: 13px; text-align: center;">
                That's less than the price of a chai per day! ☕
              </p>
            </td>
          </tr>

          <!-- Help -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; margin: 0; font-size: 13px; line-height: 1.6;">
                Having trouble?
                <a href="${frontendUrl}/contact" style="color: #6366f1; text-decoration: none; font-weight: 500;">Contact support</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px 32px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="color: #9ca3af; margin: 0 0 8px; font-size: 13px;">
                You're receiving this because you have a LinkVerse account.
              </p>
              <p style="color: #9ca3af; margin: 0 0 8px; font-size: 13px;">
                <a href="${frontendUrl}/dashboard/billing" style="color: #818cf8; text-decoration: none;">Manage Subscription</a>
                &nbsp;·&nbsp;
                <a href="${frontendUrl}/contact" style="color: #818cf8; text-decoration: none;">Contact Support</a>
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
module.exports = { expiryEmailTemplate };