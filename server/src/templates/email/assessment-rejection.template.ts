export const getAssessmentRejectionEmailTemplate = (
  userName: string,
  assessmentTitle: string,
  reason: string,
  supportEmail: string,
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Assessment Update - GradSync</title>
      </head>
      <body style="margin:0;padding:0;background-color:#F8FAFC;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F8FAFC;padding:48px 0;width:100%;">
          <tr>
            <td align="center">
              <!-- Outer Card -->
              <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(245,158,11,0.05);border:1px solid #F1F5F9;width:600px;max-width:600px;">
                
                <!-- Premium Warning Gradient Header -->
                <tr>
                  <td style="background:linear-gradient(135deg, #F59E0B 0%, #D97706 100%);padding:40px 48px;text-align:center;">
                    <!-- Notification Icon Circle -->
                    <div style="display:inline-block;width:64px;height:64px;background-color:rgba(255,255,255,0.15);border-radius:20px;text-align:center;margin-bottom:16px;">
                      <!-- Visual HTML Warning Shield -->
                      <span style="font-size:32px;line-height:64px;color:#FFFFFF;">⚠️</span>
                    </div>
                    <h1 style="margin:0;font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;line-height:1.2;">
                      Assessment Update
                    </h1>
                    <p style="margin:8px 0 0;font-size:15px;color:#FEF3C7;font-weight:500;">
                      Action required regarding your submission
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
                      Thank you for completing your skill assessment. Our administrators have finished reviewing your recent submission for **${assessmentTitle}**. 

                      Unfortunately, we were unable to approve your submission at this time.
                    </p>

                    <!-- Premium Reason Box -->
                    <div style="background-color:#FFFBEB;border:1px solid #FDE68A;border-radius:18px;padding:24px;margin-bottom:32px;">
                      <span style="display:block;font-size:11px;font-weight:700;color:#B45309;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                        Reason for non-approval
                      </span>
                      <span style="font-size:15px;font-weight:600;color:#78350F;line-height:1.5;display:block;">
                        ${reason}
                      </span>
                    </div>

                    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                      Don't worry! Non-approvals are very common and can happen due to minor security flags (like clicking out of the browser tab or window blur) or a score threshold mismatch. You are fully welcome and encouraged to retake the test once you are ready!
                    </p>

                    <div style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:16px;text-align:center;font-size:14px;color:#64748B;">
                      Have questions or believe this was a mistake? Reach out directly to our support team at <a href="mailto:${supportEmail}" style="color:#2563EB;text-decoration:none;font-weight:600;">${supportEmail}</a>.
                    </div>
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
