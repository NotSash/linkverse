/**
 * OTP Verification Email Template
 *
 * Sent when a user signs up and needs to verify their email address.
 * Displays a branded email with the 6-digit OTP in styled digit boxes.
 *
 * @param {string} otp - The 6-digit OTP code
 * @returns {{ subject: string, html: string }}
 */

const otpEmailTemplate = (otp) => {
  const subject = 'Verify Your LinkVerse Account';

  // Build digit boxes using table cells (email-client safe)
  const digits = otp.toString().split('');
  const digitBoxes = digits
    .map(
      (digit) => `
    <td style="
      width: 48px;
      height: 56px;
      background: #f3f4f6;
      border: 2px solid #6366f1;
      border-radius: 10px;
      text-align: center;
      vertical-align: middle;
      font-size: 28px;
      font-weight: 700;
      color: #6366f1;
      font-family: 'Courier New', monospace;
    ">${digit}</td>`
    )
    .join('\n<td style="width: 8px;"></td>\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #f3f4f6;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="
          max-width: 520px;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        ">
          <!-- Header -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
              padding: 36px 32px;
              text-align: center;
            ">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                LinkVerse
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.85);">
                Ek Link, Sabke Liye!
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;">🔐</span>
              </div>

              <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 600; color: #111827; text-align: center;">
                Verify Your Email
              </h2>

              <p style="margin: 0 0 32px; font-size: 15px; color: #6b7280; text-align: center; line-height: 1.6;">
                Enter the following verification code to complete your sign up.
                This code is valid for <strong style="color: #111827;">10 minutes</strong>.
              </p>

              <!-- OTP Digits -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 32px;">
                <tr>
                  ${digitBoxes}
                </tr>
              </table>

              <!-- Warning -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="
                    background: #fef3c7;
                    border: 1px solid #fcd34d;
                    border-radius: 10px;
                    padding: 14px 18px;
                    text-align: center;
                  ">
                    <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                      ⏰ This code expires in <strong>10 minutes</strong>.
                      Don't share this code with anyone.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
                If you didn't create a LinkVerse account, you can safely ignore this email.
                No account will be created without verification.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background: #f9fafb;
              border-top: 1px solid #f3f4f6;
              padding: 24px 32px;
              text-align: center;
            ">
              <p style="margin: 0 0 4px; font-size: 12px; color: #9ca3af;">
                Made with ❤️ in India 🇮🇳
              </p>
              <p style="margin: 0; font-size: 12px; color: #d1d5db;">
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

module.exports = { otpEmailTemplate };