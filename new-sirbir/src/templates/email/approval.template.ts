export const getApprovalEmailTemplate = (
  userName: string,
  loginUrl: string,
) => {
  const features = [
    { icon: "📝", title: "Post Job Vacancies", desc: "Create unlimited job listings to attract top talent" },
    { icon: "📊", title: "Manage Applications", desc: "Review and track candidate applications efficiently" },
    { icon: "💬", title: "Connect with Graduates", desc: "Communicate directly with qualified candidates" },
  ];

  const featureRows = features.map(f => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #E5E7EB;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="48" style="vertical-align: top; padding-right: 16px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.2);">${f.icon}</div>
            </td>
            <td style="vertical-align: middle;">
              <div style="font-weight: 600; color: #111827; font-size: 16px; margin-bottom: 4px; line-height: 1.4;">${f.title}</div>
              <div style="color: #6B7280; font-size: 14px; line-height: 1.5;">${f.desc}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="x-apple-disable-message-reformatting">
        <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
        <title>Account Approved - GradSync</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table { border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }

            @media only screen and (max-width: 600px) {
                .email-container { width: 100% !important; margin: 0 auto !important; }
                .mobile-padding { padding: 24px 20px !important; }
                .mobile-padding-small { padding: 20px 16px !important; }
                .mobile-text { font-size: 14px !important; line-height: 1.6 !important; }
                .mobile-heading { font-size: 24px !important; line-height: 1.3 !important; }
                .mobile-button { padding: 14px 32px !important; font-size: 15px !important; }
            }

            @media only screen and (max-width: 480px) {
                .mobile-heading { font-size: 22px !important; }
                .mobile-button { display: block !important; width: 100% !important; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; width: 100%;">
        <!-- Preview Text -->
        <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
            Congratulations! Your employer account has been approved. Start posting jobs now.
        </div>

        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #F3F4F6; padding: 20px 0;">
            <tr>
                <td align="center" style="padding: 20px 10px;">
                    <table class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 600px; width: 100%;">

                        <!-- Header with Rocket Icon -->
                        <tr>
                            <td class="mobile-padding" style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 48px 40px; text-align: center;">
                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                        <td align="center">
                                            <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.25); border-radius: 50%; margin: 0 auto 24px; line-height: 80px; text-align: center;">
                                                <span style="font-size: 48px; vertical-align: middle;">🚀</span>
                                            </div>
                                            <h1 class="mobile-heading" style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2;">
                                                You're Approved!
                                            </h1>
                                            <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 400; line-height: 1.5;">
                                                Your employer account is ready
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td class="mobile-padding" style="padding: 40px;">
                                <!-- Greeting -->
                                <p class="mobile-text" style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                                    Hi <strong style="color: #111827;">${userName}</strong>,
                                </p>

                                <!-- Success Message -->
                                <p class="mobile-text" style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                                    Congratulations! Your employer account has been <strong style="color: #8B5CF6;">manually reviewed and approved</strong> by our administration team. You now have full access to all employer features on GradSync.
                                </p>

                                <!-- Features Section -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%); border-radius: 12px; margin-bottom: 32px; overflow: hidden;">
                                    <tr>
                                        <td class="mobile-padding-small" style="padding: 24px;">
                                            <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 700; color: #5B21B6; line-height: 1.3;">
                                                🎯 What you can do now:
                                            </h2>
                                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                                ${featureRows}
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- CTA Button -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                                    <tr>
                                        <td align="center" style="padding: 8px 0 32px;">
                                            <!--[if mso]>
                                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${loginUrl}" style="height:52px;v-text-anchor:middle;width:220px;" arcsize="23%" stroke="f" fillcolor="#8B5CF6">
                                                <w:anchorlock/>
                                                <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">Access Dashboard →</center>
                                            </v:roundrect>
                                            <![endif]-->
                                            <!--[if !mso]><!-->
                                            <a href="${loginUrl}" class="mobile-button" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: #FFFFFF; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); line-height: 1.5;">
                                                Access Dashboard →
                                            </a>
                                            <!--<![endif]-->
                                        </td>
                                    </tr>
                                </table>

                                <!-- Help Text -->
                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                        <td align="center">
                                            <p class="mobile-text" style="margin: 0; font-size: 14px; line-height: 1.6; color: #6B7280; text-align: center;">
                                                Questions? Reach out at <a href="mailto:support@gradsync.tech" style="color: #8B5CF6; text-decoration: none; font-weight: 500;">support@gradsync.tech</a>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td class="mobile-padding-small" style="background-color: #F9FAFB; padding: 32px 40px; border-top: 1px solid #E5E7EB;">
                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                        <td align="center">
                                            <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #111827; line-height: 1.5;">GradSync</p>
                                            <p style="margin: 0 0 16px; font-size: 14px; color: #6B7280; line-height: 1.5;">Connecting Graduates with Opportunities</p>
                                            <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
                                                © ${new Date().getFullYear()} GradSync. All rights reserved.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
};
