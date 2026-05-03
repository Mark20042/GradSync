export const getRejectionEmailTemplate = (
  userName: string,
  reason: string,
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Application Update - GradSync</title>
        <!--[if mso]>
        <style type="text/css">
            body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
        </style>
        <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F3F4F6; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <!-- Main Container -->
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 600px;">

                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 48px 40px; text-align: center;">
                                <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                                    <div style="font-size: 48px; line-height: 1;">📋</div>
                                </div>
                                <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                    Application Update
                                </h1>
                                <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                                    Regarding your employer account
                                </p>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td style="padding: 48px 40px;">
                                <!-- Greeting -->
                                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                                    Hi <strong style="color: #111827;">${userName}</strong>,
                                </p>

                                <!-- Message -->
                                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                                    Thank you for your interest in joining GradSync as an employer. After careful review, we are unable to approve your application at this time.
                                </p>

                                <!-- Reason Box -->
                                <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-left: 4px solid #F59E0B; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                                    <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #92400E;">
                                        📌 Reason for decision:
                                    </h3>
                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #78350F;">
                                        ${reason}
                                    </p>
                                </div>

                                <!-- Next Steps -->
                                <div style="background-color: #F9FAFB; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">
                                        💡 What you can do:
                                    </h3>
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <div style="display: flex; align-items: start;">
                                                    <span style="color: #F59E0B; font-weight: 600; margin-right: 8px;">•</span>
                                                    <span style="color: #374151; font-size: 14px; line-height: 1.6;">Review the reason provided and address any concerns</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <div style="display: flex; align-items: start;">
                                                    <span style="color: #F59E0B; font-weight: 600; margin-right: 8px;">•</span>
                                                    <span style="color: #374151; font-size: 14px; line-height: 1.6;">Ensure all required information is accurate and complete</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <div style="display: flex; align-items: start;">
                                                    <span style="color: #F59E0B; font-weight: 600; margin-right: 8px;">•</span>
                                                    <span style="color: #374151; font-size: 14px; line-height: 1.6;">Submit a new application with updated documentation</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </div>

                                <!-- Info Message -->
                                <div style="background-color: #EFF6FF; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1E40AF;">
                                        <strong>💬 Need clarification?</strong> If you believe this decision was made in error or need more information, please contact our support team.
                                    </p>
                                </div>

                                <!-- Help Text -->
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6B7280; text-align: center;">
                                    Contact us at <a href="mailto:support@gradsync.tech" style="color: #F59E0B; text-decoration: none; font-weight: 500;">support@gradsync.tech</a>
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #F9FAFB; padding: 32px 40px; border-top: 1px solid #E5E7EB;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center">
                                            <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #111827;">GradSync</p>
                                            <p style="margin: 0 0 16px; font-size: 14px; color: #6B7280;">Connecting Graduates with Opportunities</p>
                                            <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
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
