import nodemailer from 'nodemailer';
import { env } from '../config/environment.js';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};

const getVerificationSuccessEmailTemplate = (userName: string, role: string) => {
  const isEmployer = role === 'employer';
  const docType = isEmployer ? 'Business Permit' : 'Transcript of Records';
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

  const dashboardPath = isEmployer ? '/employer-dashboard' : '/find-jobs';

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
                        <tr>
                            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    ✅ Verification Successful!
                                </h1>
                            </td>
                        </tr>
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
                                    <a href="${env.FRONTEND_URL || 'http://localhost:5173'}${dashboardPath}" 
                                       style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                        Go to Your Dashboard
                                    </a>
                                </div>
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

const getVerificationFailedEmailTemplate = (userName: string, role: string) => {
  const isEmployer = role === 'employer';
  const docType = isEmployer ? 'Business Permit' : 'Transcript of Records';

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
                        <tr>
                            <td style="background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    ⚠️ Verification Failed
                                </h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Hi <strong>${userName}</strong>,
                                </p>
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    We couldn't automatically verify your <strong>${docType}</strong>. To ensure the integrity of our platform, we have safely removed your account details from our system.
                                </p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${env.FRONTEND_URL || 'http://localhost:5173'}/signup" 
                                       style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                        Register Again
                                    </a>
                                </div>
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

const getApprovalEmailTemplate = (userName: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Employer Account Approved - GradSync</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <tr>
                            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    🚀 Account Approved!
                                </h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Hi <strong>${userName}</strong>,
                                </p>
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Congratulations! Your employer account has been manually reviewed and approved by our administration team.
                                </p>
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    You can now post job vacancies, manage applications, and interact with graduates on the platform.
                                </p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                                       style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                        Login to Dashboard
                                    </a>
                                </div>
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

const getRejectionEmailTemplate = (userName: string, reason: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Application Update - GradSync</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <tr>
                            <td style="background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%); padding: 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                    ⚠️ Application Status
                                </h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Hi <strong>${userName}</strong>,
                                </p>
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    Your application for an employer account has been reviewed. Unfortunately, we are unable to approve your application at this time.
                                </p>
                                <div style="background-color: #fef2f2; border-left: 4px solid #EF4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #991b1b; margin-bottom: 8px;">
                                        Reason for decision:
                                    </p>
                                    <p style="margin: 0; font-size: 14px; color: #b91c1c;">
                                        ${reason}
                                    </p>
                                </div>
                                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                                    If you believe this is a mistake, you can try registering again with more complete information.
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

const getInterviewResultEmailTemplate = (userName: string, roleName: string, score: number, summary: string) => {
  const resultLink = `${env.FRONTEND_URL || 'http://localhost:5173'}/profile`;
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Interview Evaluated - GradSync</title>
    </head>
    <body style="font-family: sans-serif; background-color: #f9fafb; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h1 style="color: #2563eb; margin-top: 0;">AI Interview Completed!</h1>
            <p>Hi ${userName},</p>
            <p>Our AI has finished analyzing your mock interview for the <strong>${roleName}</strong> position.</p>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
                <div style="font-size: 14px; color: #3b82f6; font-weight: bold; text-transform: uppercase;">Overall Score</div>
                <div style="font-size: 48px; font-weight: 900; color: #1e3a8a;">${score}%</div>
            </div>

            <p style="color: #4b5563; line-height: 1.6;">${summary}</p>

            <div style="margin-top: 30px; text-align: center;">
                <a href="${resultLink}" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Detailed Breakdown</a>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const sendVerificationSuccessEmail = async (userEmail: string, userName: string, role: string): Promise<boolean> => {
  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email service not configured. Skipping email notification.');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
      to: userEmail,
      subject: '✅ Your GradSync Account Has Been Verified!',
      html: getVerificationSuccessEmailTemplate(userName, role),
    };

    const trans = getTransporter();
    await trans.sendMail(mailOptions);
    console.log(`✅ Verification success email sent to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error.message);
    return false;
  }
};

export const sendVerificationFailedEmail = async (userEmail: string, userName: string, role: string): Promise<boolean> => {
  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email service not configured. Skipping email notification.');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
      to: userEmail,
      subject: '⚠️ Action Required: GradSync Verification Failed',
      html: getVerificationFailedEmailTemplate(userName, role),
    };

    const trans = getTransporter();
    await trans.sendMail(mailOptions);
    console.log(`❌ Verification failed email sent to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending failed verification email:', error.message);
    return false;
  }
};

export const sendApprovalEmail = async (userEmail: string, userName: string): Promise<boolean> => {
  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) return false;
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🚀 Your GradSync Employer Account Has Been Approved!',
      html: getApprovalEmailTemplate(userName),
    };
    const trans = getTransporter();
    await trans.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending approval email:', error.message);
    return false;
  }
};

export const sendRejectionEmail = async (userEmail: string, userName: string, reason: string): Promise<boolean> => {
  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) return false;
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
      to: userEmail,
      subject: '⚠️ Update Regarding Your GradSync Application',
      html: getRejectionEmailTemplate(userName, reason),
    };
    const trans = getTransporter();
    await trans.sendMail(mailOptions);
    console.log(`❌ Rejection email sent to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending rejection email:', error.message);
    return false;
  }
};

export const sendInterviewResultEmail = async (
  userEmail: string,
  userName: string,
  roleName: string,
  score: number,
  summary: string
): Promise<boolean> => {
  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) return false;
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🏆 Your Interview Results for ${roleName} are Ready!`,
      html: getInterviewResultEmailTemplate(userName, roleName, score, summary),
    };
    const trans = getTransporter();
    await trans.sendMail(mailOptions);
    console.log(`✅ Interview result email sent to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error sending interview result email:', error.message);
    return false;
  }
};

