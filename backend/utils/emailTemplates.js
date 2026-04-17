/**
 * Email Templates for SipaCareer
 * Professional HTML email templates for various notifications
 */

/**
 * Get verification success email HTML template
 * @param {string} userName - Name of the user
 * @param {string} role - Role of the user ('graduate' or 'employer')
 * @returns {string} HTML email content
 */
exports.getVerificationSuccessEmailTemplate = (userName, role) => {
  const isEmployer = role === "employer";
  const docType = isEmployer ? "Business Permit" : "Transcript of Records";
  const features = isEmployer
    ? `
            <li>Post job openings</li>
            <li>Manage applications</li>
            <li>Review candidate profiles</li>
            <li>Communicate with applicants</li>
        `
    : `
            <li>Browse and apply for jobs</li>
            <li>Build your professional resume</li>
            <li>Get AI-powered career mentoring</li>
            <li>Take skill assessments</li>
        `;

  const dashboardPath = isEmployer ? "/employer-dashboard" : "/find-jobs";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verified - SipaCareer</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    ✅ Verification Successful!
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Hi <strong>${userName}</strong>,
                                </p>
                                
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Great news! Your <strong>${docType}</strong> has been automatically verified, and your <strong>SipaCareer</strong> account is now fully activated.
                                </p>
                                
                                <div style="background-color: #ecfdf5; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #065f46; margin-bottom: 8px;">
                                        🎉 What you can do now:
                                    </p>
                                </div>
                                
                                <ul style="margin: 0 0 30px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #333333;">
                                    ${features}
                                </ul>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}${dashboardPath}" 
                                       style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                        Go to Your Dashboard
                                    </a>
                                </div>
                                
                                <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Welcome to SipaCareer! We're excited to help you on your career journey.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                                    <strong>SipaCareer</strong> - Connecting Graduates with Opportunities
                                </p>
                                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                    This is an automated message. Please do not reply directly to this email.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
// ...existing code...
    </html>
    `;
};

/**
 * Get verification failed email HTML template
 * @param {string} userName - Name of the user
 * @param {string} role - Role of the user ('graduate' or 'employer')
 * @returns {string} HTML email content
 */
exports.getVerificationFailedEmailTemplate = (userName, role) => {
  const isEmployer = role === "employer";
  const docType = isEmployer ? "Business Permit" : "Transcript of Records";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verification Failed - SipaCareer</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    ⚠️ Verification Failed
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Hi <strong>${userName}</strong>,
                                </p>
                                
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    We couldn't automatically verify your <strong>${docType}</strong>. To ensure the integrity of our platform, we have safely removed your account details from our system.
                                </p>
                                
                                <div style="background-color: #fef2f2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #991b1b; margin-bottom: 8px;">
                                        📝 What you should do next:
                                    </p>
                                </div>
                                
                                <ul style="margin: 0 0 30px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #333333;">
                                    <li>Re-register your account by visiting the sign-up page</li>
                                    <li>Upload a clearer, more readable copy of your ${docType}</li>
                                    <li>Ensure all text on the document is well-lit and not cut off</li>
                                </ul>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/signup" 
                                       style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                        Register Again
                                    </a>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                                    <strong>SipaCareer</strong> - Connecting Graduates with Opportunities
                                </p>
                                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                    This is an automated message. Please do not reply directly to this email.
                                </p>
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
