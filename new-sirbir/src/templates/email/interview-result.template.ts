export const getInterviewResultEmailTemplate = (
  userName: string,
  roleName: string,
  score: number,
  summary: string,
  resultUrl: string,
) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: '#DCFCE7', text: '#166534', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' };
    if (score >= 60) return { bg: '#FEF3C7', text: '#92400E', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' };
    return { bg: '#FEE2E2', text: '#991B1B', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' };
  };

  const scoreColor = getScoreColor(score);
  const performanceLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Interview Results - GradSync</title>
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
                            <td style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 48px 40px; text-align: center;">
                                <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                                    <div style="font-size: 48px; line-height: 1;">🎯</div>
                                </div>
                                <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                    Interview Complete!
                                </h1>
                                <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                                    Your AI evaluation is ready
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
                                <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #374151;">
                                    Our AI has finished analyzing your mock interview for the <strong style="color: #3B82F6;">${roleName}</strong> position. Here's your performance summary:
                                </p>

                                <!-- Score Card -->
                                <div style="background: ${scoreColor.gradient}; border-radius: 16px; padding: 32px; margin-bottom: 32px; text-align: center; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);">
                                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: rgba(255, 255, 255, 0.9); text-transform: uppercase; letter-spacing: 1px;">
                                        Overall Score
                                    </p>
                                    <div style="font-size: 64px; font-weight: 900; color: #FFFFFF; line-height: 1; margin: 16px 0;">
                                        ${score}%
                                    </div>
                                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 8px 20px; border-radius: 20px; backdrop-filter: blur(10px);">
                                        <span style="color: #FFFFFF; font-size: 14px; font-weight: 600;">${performanceLabel}</span>
                                    </div>
                                </div>

                                <!-- Summary Section -->
                                <div style="background-color: #F9FAFB; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">
                                        📊 Performance Summary
                                    </h3>
                                    <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #374151;">
                                        ${summary}
                                    </p>
                                </div>

                                <!-- Key Insights -->
                                <div style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1E40AF;">
                                        💡 What's Next?
                                    </h3>
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <div style="display: flex; align-items: start;">
                                                    <span style="color: #3B82F6; font-weight: 600; margin-right: 8px;">•</span>
                                                    <span style="color: #1E3A8A; font-size: 14px; line-height: 1.6;">Review your detailed breakdown and feedback</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <div style="display: flex; align-items: start;">
                                                    <span style="color: #3B82F6; font-weight: 600; margin-right: 8px;">•</span>
                                                    <span style="color: #1E3A8A; font-size: 14px; line-height: 1.6;">Identify areas for improvement</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0;">
                                                <div style="display: flex; align-items: start;">
                                                    <span style="color: #3B82F6; font-weight: 600; margin-right: 8px;">•</span>
                                                    <span style="color: #1E3A8A; font-size: 14px; line-height: 1.6;">Practice more to boost your confidence</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </div>

                                <!-- CTA Button -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td align="center" style="padding: 8px 0;">
                                            <a href="${resultUrl}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                                                View Full Report →
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Help Text -->
                                <p style="margin: 32px 0 0; font-size: 14px; line-height: 1.6; color: #6B7280; text-align: center;">
                                    Questions about your results? <a href="mailto:support@gradsync.tech" style="color: #3B82F6; text-decoration: none; font-weight: 500;">Contact Support</a>
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
