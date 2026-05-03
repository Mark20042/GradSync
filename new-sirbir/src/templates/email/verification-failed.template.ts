export const getVerificationFailedEmailTemplate = (
  userName: string,
  role: string,
  signupUrl: string,
) => {
  const isEmployer = role === "employer";
  const docType = isEmployer ? "Business Permit" : "Transcript of Records";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Verification Failed - GradSync</title>
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

                        <!-- Header with Warning Icon -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 48px 40px; text-align: center;">
                                <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                                    <div style="font-size: 48px; line-height: 1;">⚠</div>
                                </div>
                                <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                    Verification Failed
                                </h1>
                                <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                                    Action Required
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

                                <!-- Failure Message -->
                                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                                    We were unable to automatically verify your <strong style="color: #EF4444;">${docType}</strong>. To maintain the integrity and security of our platform, we have removed your account details from our system.
                                </p>

                                <!-- Info Box -->
                                <div style="background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); border-left: 4px solid #EF4444; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                                    <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #991B1B;">
                                        Why did this happen?
                                    </h3>
                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #7F1D1D;">
                                        Our automated verification system could not validate the document you provided. This may be due to image quality, document format, or information mismatch.
                                    </p>
                                </div>

                                <!-- Next Steps -->
                                <div style="background-color: #F9FAFB; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">
                                        📋 What to do next:
                                    </h3>
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <div style="display: flex; align-items: start;">
                                                    <span style="color: #10B981; font-weight: 600; margin-right: 8px;">1.</span>
                                                    <span style="color: #374151; font-size: 14px; line-height: 1.6;">Ensure your document is clear and readable</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <div style="display: flex; align-items: start;">
                                                    <span style="color: #10B981; font-weight: 600; margin-right: 8px;">2.</span>
                                                    <span style="color: #374151; font-size: 14px; line-height: 1.6;">Verify all information matches your registration details</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <div style="display: flex; align-items: start;">
                                                    <span style="color: #10B981; font-weight: 600; margin-right: 8px;">3.</span>
                                                    <span style="color: #374151; font-size: 14px; line-height: 1.6;">Upload a high-quality scan or photo of your document</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </div>

                                <!-- CTA Button -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td align="center" style="padding: 8px 0;">
                                            <a href="${signupUrl}" style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: #FFFFFF; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                                                Try Again →
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Help Text -->
                                <p style="margin: 32px 0 0; font-size: 14px; line-height: 1.6; color: #6B7280; text-align: center;">
                                    Still having issues? Contact us at <a href="mailto:support@gradsync.tech" style="color: #EF4444; text-decoration: none; font-weight: 500;">support@gradsync.tech</a>
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
