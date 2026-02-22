/**
 * Welcome Email Template
 *
 * Sent after a user successfully verifies their email via OTP.
 * Uses table-based layout for email client compatibility.
 *
 * @param {string} name - User's full name
 * @param {string} username - User's chosen username
 * @returns {{ subject: string, html: string }}
 */

const welcomeEmailTemplate = (name, username) => {
  const subject = 'Welcome to LinkVerse! 🎉';

  const frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:5173';
  const profileUrl = `${frontendUrl}/${username}`;
  const dashboardUrl = `${frontendUrl}/dashboard`;

  // Steps data for cleaner template
  const steps = [
    {
      emoji: '1️⃣',
      title: 'Upload your profile picture',
      desc: 'Make a great first impression with a professional photo',
    },
    {
      emoji: '2️⃣',
      title: 'Write a catchy bio',
      desc: "Tell the world what you're about in 160 characters or less",
    },
    {
      emoji: '3️⃣',
      title: 'Add your links',
      desc: 'Add links to Instagram, YouTube, Moj, and 30+ more platforms',
    },
  ];

  const stepsHtml = steps
    .map(
      (step) => `
              <tr>
                <td style="padding: 0 0 12px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="
                        background: #f9fafb;
                        border-radius: 10px;
                        padding: 14px 16px;
                      ">
                        <table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="vertical-align: top; padding-right: 12px; font-size: 20px;">
                              ${step.emoji}
                            </td>
                            <td style="vertical-align: top;">
                              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">
                                ${step.title}
                              </p>
                              <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280; line-height: 1.4;">
                                ${step.desc}
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
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
              <!-- Celebration -->
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 56px;">🎉</span>
              </div>

              <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #111827; text-align: center;">
                Hey ${name}, welcome aboard!
              </h2>

              <p style="margin: 0 0 28px; font-size: 15px; color: #6b7280; text-align: center; line-height: 1.6;">
                Your LinkVerse page is ready! You're one step closer to
                sharing all your platforms with the world. 🚀
              </p>

              <!-- Profile URL Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="
                    background: linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%);
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                  ">
                    <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Your LinkVerse URL
                    </p>
                    <a href="${profileUrl}" style="font-size: 18px; font-weight: 700; color: #6366f1; text-decoration: none; word-break: break-all;">
                      linkverse.com/${username}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Steps -->
              <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">
                Get started in 3 easy steps:
              </h3>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                ${stepsHtml}
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="
                      display: inline-block;
                      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
                      color: #ffffff;
                      text-decoration: none;
                      padding: 14px 40px;
                      border-radius: 50px;
                      font-size: 16px;
                      font-weight: 600;
                      letter-spacing: 0.3px;
                    ">Go to Dashboard →</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center; line-height: 1.6;">
                Apna link, apni style! 🌟<br>
                We're excited to have you on LinkVerse.
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

module.exports = { welcomeEmailTemplate };