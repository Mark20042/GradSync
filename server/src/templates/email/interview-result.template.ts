export const getInterviewResultEmailTemplate = (
  userName: string,
  roleName: string,
  score: number,
  summary: string,
  resultUrl: string,
) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: '#DCFCE7', text: '#166534', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', badge: '#10B981' };
    if (score >= 60) return { bg: '#FEF3C7', text: '#92400E', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', badge: '#F59E0B' };
    return { bg: '#FEE2E2', text: '#991B1B', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', badge: '#EF4444' };
  };

  const scoreColor = getScoreColor(score);
  const performanceLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement';
  const performanceIcon = score >= 80 ? '🌟' : score >= 60 ? '👍' : '📈';

  const nextSteps = [
    { text: "Review your detailed breakdown and feedback" },
    { text: "Identify areas for improvement" },
    { text: "Practice more to boost your confidence" },
  ];

  const stepRows = nextSteps.map(step => `
    <tr>
      <td style="padding: 8px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="24" style="vertical-align: top; padding-right: 12px;">
              <span style="color: #3B82F6; font-weight: 700; font-size: 18px;">•</span>
            </td>
            <td>
              <span class="mobile-step" style="color: #1E3A8A; font-size: 14px; line-height: 1.6;">${step.text}</span>
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
        <title>Interview Results - GradSync</title>
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
                .mobile-score { font-size: 48px !important; }
                .mobile-step { font-size: 13px !important; }
            }

            @media only screen and (max-width: 480px) {
                .mobile-heading { font-size: 22px !important; }
                .mobile-button { display: block !important; width: 100% !important; }
                .mobile-score { font-size: 40px !important; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; width: 100%;">
        <!-- Preview Text -->
        <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
            Your interview results for ${roleName} are ready! Score: ${score}% - ${performanceLabel}
        </div>

        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #F3F4F6; padding: 20px 0;">
            <tr>
                <td align="center" style="padding: 20px 10px;">
                    <table class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 600px; width: 100%;">

                        <!-- Header -->
                        <tr>
                            <td class="mobile-padding" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 48px 40px; text-align: center;">
                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                        <td align="center">
                                            <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.25); border-radius: 50%; margin: 0 auto 24px; line-height: 80px; text-align: center;">
                                                <span style="font-size: 48px; vertical-align: middle;">🎯</span>
                                            </div>
                                            <h1 class="mobile-heading" style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2;">
                                                Interview Complete!
                                            </h1>
                                            <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 400; line-height: 1.5;">
                                                Your AI evaluation is ready
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

                                <!-- Message -->
                                <p class="mobile-text" style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #374151;">
                                    Our AI has finished analyzing your mock interview for the <strong style="color: #3B82F6;">${roleName}</strong> position. Here's your performance summary:
                                </p>

                                <!-- Score Card -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background: ${scoreColor.gradient}; border-radius: 16px; margin-bottom: 32px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);">
                                    <tr>
                                        <td class="mobile-padding-small" style="padding: 32px; text-align: center;">
                                            <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: rgba(255, 255, 255, 0.95); text-transform: uppercase; letter-spacing: 1px; line-height: 1.5;">
                                                Overall Score
                                            </p>
                                            <div class="mobile-score" style="font-size: 64px; font-weight: 900; color: #FFFFFF; line-height: 1; margin: 16px 0;">
                                                ${score}%
                                            </div>
                                            <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.25); padding: 8px 20px; border-radius: 20px; margin-top: 8px;">
                                                <span style="color: #FFFFFF; font-size: 14px; font-weight: 600; line-height: 1.5;">${performanceIcon} ${performanceLabel}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Summary Section -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color: #F9FAFB; border-radius: 12px; margin-bottom: 24px;">
                                    <tr>
                                        <td class="mobile-padding-small" style="padding: 24px;">
                                            <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827; line-height: 1.4;">
                                                📊 Performance Summary
                                            </h3>
                                            <p class="mobile-text" style="margin: 0; font-size: 14px; line-height: 1.8; color: #374151;">
                                                ${summary}
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Key Insights -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border-radius: 12px; margin-bottom: 32px;">
                                    <tr>
                                        <td class="mobile-padding-small" style="padding: 24px;">
                                            <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1E40AF; line-height: 1.4;">
                                                💡 What's Next?
                                            </h3>
                                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                                ${stepRows}
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- CTA Button -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                                    <tr>
                                        <td align="center" style="padding: 8px 0 32px;">
                                            <!--[if mso]>
                                            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resultUrl}" style="height:52px;v-text-anchor:middle;width:220px;" arcsize="23%" stroke="f" fillcolor="#3B82F6">
                                                <w:anchorlock/>
                                                <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">View Full Report →</center>
                                            </v:roundrect>
                                            <![endif]-->
                                            <!--[if !mso]><!-->
                                            <a href="${resultUrl}" class="mobile-button" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); line-height: 1.5;">
                                                View Full Report →
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
                                                Questions about your results? <a href="mailto:support@gradsync.tech" style="color: #3B82F6; text-decoration: none; font-weight: 500;">Contact Support</a>
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
