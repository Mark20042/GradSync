export const getAssessmentApprovalEmailTemplate = (
  userName: string,
  assessmentTitle: string,
  score: number,
  resultUrl: string,
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Assessment Approved - GradSync</title>
      </head>
      <body style="margin:0;padding:0;background-color:#F8FAFC;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F8FAFC;padding:48px 0;width:100%;">
          <tr>
            <td align="center">
              <!-- Outer Card -->
              <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(79,70,229,0.06);border:1px solid #F1F5F9;width:600px;max-width:600px;">
                
                <!-- Premium Gradient Header -->
                <tr>
                  <td style="background:linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);padding:40px 48px;text-align:center;">
                    <!-- Trophy Icon Circle -->
                    <div style="display:inline-block;width:64px;height:64px;background-color:rgba(255,255,255,0.15);border-radius:20px;text-align:center;margin-bottom:16px;">
                      <!-- Visual HTML Trophy -->
                      <span style="font-size:32px;line-height:64px;color:#FFFFFF;">🏆</span>
                    </div>
                    <h1 style="margin:0;font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;line-height:1.2;">
                      Assessment Approved!
                    </h1>
                    <p style="margin:8px 0 0;font-size:15px;color:#E0E7FF;font-weight:500;">
                      Congratulations, your new skill badge is ready
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding:48px 48px 32px;color:#334155;">
                    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1E293B;">
                      Hi ${userName},
                    </p>
                    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                      Excellent work! Our administrators have completed the review of your recent skill submission. We are thrilled to let you know that your assessment has been officially **Approved**!
                    </p>

                    <!-- Premium Info Card -->
                    <div style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:18px;padding:24px;margin-bottom:32px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="padding-bottom:12px;border-bottom:1px dashed #E2E8F0;">
                            <span style="display:block;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
                              Verified Skill
                            </span>
                            <span style="font-size:18px;font-weight:800;color:#1E293B;">
                              ${assessmentTitle}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top:12px;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td width="50%">
                                  <span style="display:block;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
                                    Passing Score
                                  </span>
                                  <span style="font-size:16px;font-weight:800;color:#10B981;">
                                    ${Math.round(score)}%
                                  </span>
                                </td>
                                <td width="50%">
                                  <span style="display:block;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
                                    Certificate PDF
                                  </span>
                                  <span style="font-size:13px;font-weight:700;color:#4F46E5;display:inline-block;padding:2px 8px;background-color:#EEF2FF;border-radius:6px;">
                                    📎 Attached
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Call To Action Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
                      <tr>
                        <td align="center">
                          <a href="${resultUrl}" style="display:inline-block;background:linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);color:#FFFFFF;text-decoration:none;padding:16px 36px;border-radius:14px;font-weight:700;font-size:14px;box-shadow:0 4px 12px rgba(79,70,229,0.2);text-transform:uppercase;letter-spacing:0.5px;">
                            View Badges on Profile
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;font-size:14px;color:#64748B;line-height:1.6;text-align:center;">
                      Your verification badge is now live on your profile and visible to potential employers. We have also attached a premium PDF copy of your Certificate of Achievement directly to this email.
                    </p>
                  </td>
                </tr>

                <!-- Premium Footer -->
                <tr>
                  <td style="padding:24px 48px 40px;background-color:#F8FAFC;border-top:1px solid #E2E8F0;text-align:center;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#475569;">
                      GradSync Team
                    </p>
                    <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.4;">
                      Connecting Talented Graduates with Global Career Opportunities
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
