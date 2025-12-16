/**
 * Email Templates for SipaCareer
 * Professional HTML email templates for various notifications
 */

/**
 * Get approval email HTML template
 * @param {string} employerName - Name of the employer
 * @returns {string} HTML email content
 */
exports.getApprovalEmailTemplate = (employerName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved - SipaCareer</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    🎉 Congratulations!
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Hi <strong>${employerName}</strong>,
                                </p>
                                
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Great news! Your employer account on <strong>SipaCareer</strong> has been approved by our admin team.
                                </p>
                                
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    You can now access all employer features including:
                                </p>
                                
                                <ul style="margin: 0 0 30px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: #333333;">
                                    <li>Post job openings</li>
                                    <li>Manage applications</li>
                                    <li>Review candidate profiles</li>
                                    <li>Communicate with applicants</li>
                                </ul>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                                       style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                        Login to Your Account
                                    </a>
                                </div>
                                
                                <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Welcome aboard! We're excited to help you find the perfect candidates.
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
                                    If you have any questions, please contact our support team.
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

/**
 * Get rejection email HTML template
 * @param {string} employerName - Name of the employer
 * @param {string} reason - Reason for rejection
 * @returns {string} HTML email content
 */
exports.getRejectionEmailTemplate = (employerName, reason) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Update - SipaCareer</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    Account Status Update
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Hi <strong>${employerName}</strong>,
                                </p>
                                
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Thank you for your interest in <strong>SipaCareer</strong>. After careful review, we regret to inform you that we are unable to approve your employer account at this time.
                                </p>
                                
                                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #991b1b; margin-bottom: 8px;">
                                        Reason:
                                    </p>
                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #7f1d1d;">
                                        ${reason}
                                    </p>
                                </div>
                                
                                <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                                    If you believe this decision was made in error or would like to discuss this further, please don't hesitate to contact our support team. We're here to help.
                                </p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="mailto:support@sipacareer.com" 
                                       style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                        Contact Support
                                    </a>
                                </div>
                                
                                <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #333333;">
                                    We appreciate your understanding and wish you the best in your recruitment endeavors.
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
    </html>
    `;
};
