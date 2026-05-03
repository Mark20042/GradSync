export const getVerificationSuccessEmailTemplate = (
  userName: string,
  role: string,
  dashboardUrl: string,
) => {
  const isEmployer = role === "employer";
  const docType = isEmployer ? "Business Permit" : "Transcript of Records";
  const features = isEmployer
    ? `
      <tr>
        <td style="padding: 12px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40" style="vertical-align: top; padding-top: 4px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">💼</div>
              </td>
              <td style="padding-left: 16px;">
                <div style="font-weight: 600; color: #111827; font-size: 15px; margin-bottom: 4px;">Post Job Openings</div>
                <div style="color: #6B7280; font-size: 14px; line-height: 1.5;">Create and manage job listings to attract top talent</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40" style="vertical-align: top; padding-top: 4px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">📋</div>
              </td>
              <td style="padding-left: 16px;">
                <div style="font-weight: 600; color: #111827; font-size: 15px; margin-bottom: 4px;">Manage Applications</div>
                <div style="color: #6B7280; font-size: 14px; line-height: 1.5;">Review and track candidate applications efficiently</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40" style="vertical-align: top; padding-top: 4px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">👥</div>
              </td>
              <td style="padding-left: 16px;">
                <div style="font-weight: 600; color: #111827; font-size: 15px; margin-bottom: 4px;">Connect with Candidates</div>
                <div style="color: #6B7280; font-size: 14px; line-height: 1.5;">Communicate directly with qualified applicants</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    : `
      <tr>
        <td style="padding: 12px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40" style="vertical-align: top; padding-top: 4px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">🔍</div>
              </td>
              <td style="padding-left: 16px;">
                <div style="font-weight: 600; color: #111827; font-size: 15px; margin-bottom: 4px;">Browse & Apply for Jobs</div>
                <div style="color: #6B7280; font-size: 14px; line-height: 1.5;">Discover opportunities that match your skills</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40" style="vertical-align: top; padding-top: 4px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">📄</div>
              </td>
              <td style="padding-left: 16px;">
                <div style="font-weight: 600; color: #111827; font-size: 15px; margin-bottom: 4px;">Build Your Resume</div>
                <div style="color: #6B7280; font-size: 14px; line-height: 1.5;">Create a professional profile that stands out</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40" style="vertical-align: top; padding-top: 4px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">🤖</div>
              </td>
              <td style="padding-left: 16px;">
                <div style="font-weight: 600; color: #111827; font-size: 15px; margin-bottom: 4px;">AI Career Mentoring</div>
                <div style="color: #6B7280; font-size: 14px; line-height: 1.5;">Get personalized guidance for your career path</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="40" style="vertical-align: top; padding-top: 4px;">
                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">✅</div>
              </td>
              <td style="padding-left: 16px;">
                <div style="font-weight: 600; color: #111827; font-size: 15px; margin-bottom: 4px;">Skill Assessments</div>
                <div style="color: #6B7280; font-size: 14px; line-height: 1.5;">Validate your expertise with interactive tests</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Account Verified - GradSync</title>
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

                        <!-- Header with Success Icon -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 48px 40px; text-align: center;">
                                <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                                    <div style="font-size: 48px; line-height: 1;">✓</div>
                                </div>
                                <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                    Account Verified!
                                </h1>
                                <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                                    Welcome to GradSync
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

                                <!-- Success Message -->
                                <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #374151;">
                                    Great news! Your <strong style="color: #10B981;">${docType}</strong> has been successfully verified. Your GradSync account is now fully activated and ready to use.
                                </p>

                                <!-- Features Section -->
                                <div style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                    <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 700; color: #065F46;">
                                        🎉 What you can do now:
                                    </h2>
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        ${features}
                                    </table>
                                </div>

                                <!-- CTA Button -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td align="center" style="padding: 8px 0;">
                                            <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
                                                Get Started →
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Help Text -->
                                <p style="margin: 32px 0 0; font-size: 14px; line-height: 1.6; color: #6B7280; text-align: center;">
                                    Need help? Contact us at <a href="mailto:support@gradsync.tech" style="color: #10B981; text-decoration: none; font-weight: 500;">support@gradsync.tech</a>
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
