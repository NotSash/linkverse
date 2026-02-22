/**
 * Password Reset Email Template
 *
 * Sent when a user requests a password reset.
 * Contains a secure reset link that expires in 1 hour.
 *
 * @param {string} name - User's name
 * @param {string} resetLink - Secure reset URL
 * @returns {{ subject: string, html: string }}
 */

const resetEmailTemplate = (name, resetLink) => {
  const subject = 'Reset Your LinkVerse Password';

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
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 36px 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 8px; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                LinkVerse
              </h1>
              <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 14px;">
                Password Reset Request
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;">🔑</span>
              </div>

              <h2 style="color: #111827; margin: 0 0 16px; font-size: 22px; font-weight: 600; text-align: center;">
                Reset Your Password
              </h2>

              <p style="color: #4b5563; margin: 0 0 8px; font-size: 15px; line-height: 1.6;">
                Hey ${name || 'there'},
              </p>

              <p style="color: #4b5563; margin: 0 0 28px; font-size: 15px; line-height: 1.6;">
                We received a request to reset the password for your LinkVerse account.
                Click the button below to set a new password:
              </p>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="
                      display: inline-block;
                      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                      color: #ffffff;
                      text-decoration: none;
                      padding: 14px 40px;
                      border-radius: 50px;
                      font-size: 16px;
                      font-weight: 600;
                      letter-spacing: 0.3px;
                    ">Reset Password</a>
                  </td>
                </tr>
              </table>

              <!-- Alt link -->
              <p style="color: #6b7280; margin: 0 0 12px; font-size: 13px; text-align: center; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; word-break: break-all;">
                    <a href="${resetLink}" style="color: #6366f1; font-size: 13px; text-decoration: none;">
                      ${resetLink}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px;">
                    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                      ⏰ <strong>This link expires in 1 hour.</strong> After that, you'll need to request a new one.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    <p style="color: #6b7280; margin: 0 0 8px; font-size: 13px; line-height: 1.6;">
                      🔒 <strong>Didn't request this?</strong>
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 13px; line-height: 1.6;">
                      If you didn't request a password reset, you can safely ignore this email.
                      Your password won't be changed unless you click the link above.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tips -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 8px; font-size: 13px; font-weight: 600;">
                🛡️ Password Tips:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr><td style="color: #6b7280; font-size: 13px; padding: 3px 0;">• Use at least 8 characters</td></tr>
                <tr><td style="color: #6b7280; font-size: 13px; padding: 3px 0;">• Include uppercase letters and numbers</td></tr>
                <tr><td style="color: #6b7280; font-size: 13px; padding: 3px 0;">• Don't reuse passwords from other sites</td></tr>
                <tr><td style="color: #6b7280; font-size: 13px; padding: 3px 0;">• Never share your password with anyone</td></tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px 32px; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="color: #9ca3af; margin: 0 0 8px; font-size: 13px;">
                This is an automated email from LinkVerse. Please do not reply.
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
module.exports = { resetEmailTemplate };