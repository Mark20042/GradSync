import nodemailer from "nodemailer";
import { MailtrapClient } from "mailtrap";
import { env } from "@/config/environment.js";
import {
  getVerificationSuccessEmailTemplate,
  getVerificationFailedEmailTemplate,
  getApprovalEmailTemplate,
  getRejectionEmailTemplate,
  getInterviewResultEmailTemplate,
  getAssessmentApprovalEmailTemplate,
  getAssessmentRejectionEmailTemplate,
  getForgotPasswordEmailTemplate,
} from "@/templates/email/index.js";
import { generateAssessmentCertificatePdf } from "@/utils/assessment-certificate.js";

let transporter: nodemailer.Transporter | null = null;
let mailtrapClient: MailtrapClient | null = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: env.EMAIL_SERVICE || "gmail",
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });
    console.log("📧 Email service: Gmail");
  }
  return transporter;
};

const getMailtrapClient = () => {
  if (!mailtrapClient) {
    const isDevelopment = env.NODE_ENV === "development";
    mailtrapClient = new MailtrapClient({
      token: env.MAILTRAP_TOKEN,
      sandbox: isDevelopment,
      testInboxId: isDevelopment ? env.MAILTRAP_INBOX_ID : undefined,
    });
    console.log(
      `📧 Email service: Mailtrap ${isDevelopment ? "(Sandbox)" : "(Production)"}`,
    );
  }
  return mailtrapClient;
};

const shouldUseMailtrap = () => {
  const isDevelopment = env.NODE_ENV === "development";
  return (
    env.EMAIL_SERVICE === "mailtrap" || (isDevelopment && env.MAILTRAP_TOKEN)
  );
};

const parseEmailFrom = () => {
  const emailFrom = env.EMAIL_FROM || env.EMAIL_USER;
  const match = emailFrom.match(/^(.+?)\s*<(.+?)>$/);
  if (match && match[1] && match[2]) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: "GradSync", email: emailFrom };
};

export const sendVerificationSuccessEmail = async (
  userEmail: string,
  userName: string,
  role: string,
): Promise<boolean> => {
  try {
    const isEmployer = role === "employer";
    const dashboardPath = isEmployer ? "/employer-dashboard" : "/find-jobs";
    const dashboardUrl = `${env.FRONTEND_URL || "https://gradsync.tech"}${dashboardPath}`;

    if (shouldUseMailtrap()) {
      const client = getMailtrapClient();
      const fromEmail = parseEmailFrom();
      await client.send({
        from: fromEmail,
        to: [{ email: userEmail }],
        subject: "✅ Your GradSync Account Has Been Verified!",
        html: getVerificationSuccessEmailTemplate(userName, role, dashboardUrl),
        category: "Account Verification",
      });
      console.log(`✅ Verification success email sent to ${userEmail}`);
      return true;
    } else {
      if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
        console.warn(
          "⚠️  Email service not configured. Skipping email notification.",
        );
        return false;
      }

      const mailOptions = {
        from: env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
        to: userEmail,
        subject: "✅ Your GradSync Account Has Been Verified!",
        html: getVerificationSuccessEmailTemplate(userName, role, dashboardUrl),
      };

      const trans = getTransporter();
      await trans.sendMail(mailOptions);
      console.log(`✅ Verification success email sent to ${userEmail}`);
      return true;
    }
  } catch (error: any) {
    console.error("❌ Error sending verification email:", error.message);
    return false;
  }
};

export const sendVerificationFailedEmail = async (
  userEmail: string,
  userName: string,
  role: string,
): Promise<boolean> => {
  try {
    const signupUrl = `${env.FRONTEND_URL || "https://gradsync.tech"}/signup`;

    if (shouldUseMailtrap()) {
      const client = getMailtrapClient();
      const fromEmail = parseEmailFrom();
      await client.send({
        from: fromEmail,
        to: [{ email: userEmail }],
        subject: "⚠️ Action Required: GradSync Verification Failed",
        html: getVerificationFailedEmailTemplate(userName, role, signupUrl),
        category: "Account Verification",
      });
      console.log(`❌ Verification failed email sent to ${userEmail}`);
      return true;
    } else {
      if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
        console.warn(
          "⚠️  Email service not configured. Skipping email notification.",
        );
        return false;
      }

      const mailOptions = {
        from: env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
        to: userEmail,
        subject: "⚠️ Action Required: GradSync Verification Failed",
        html: getVerificationFailedEmailTemplate(userName, role, signupUrl),
      };

      const trans = getTransporter();
      await trans.sendMail(mailOptions);
      console.log(`❌ Verification failed email sent to ${userEmail}`);
      return true;
    }
  } catch (error: any) {
    console.error("❌ Error sending failed verification email:", error.message);
    return false;
  }
};

export const sendApprovalEmail = async (
  userEmail: string,
  userName: string,
): Promise<boolean> => {
  try {
    const loginUrl = `${env.FRONTEND_URL || "https://gradsync.tech"}/login`;

    if (shouldUseMailtrap()) {
      const client = getMailtrapClient();
      const fromEmail = parseEmailFrom();
      await client.send({
        from: fromEmail,
        to: [{ email: userEmail }],
        subject: "🚀 Your GradSync Employer Account Has Been Approved!",
        html: getApprovalEmailTemplate(userName, loginUrl),
        category: "Account Approval",
      });
      console.log(`✅ Approval email sent to ${userEmail}`);
      return true;
    } else {
      if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) return false;
      const mailOptions = {
        from: env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
        to: userEmail,
        subject: "🚀 Your GradSync Employer Account Has Been Approved!",
        html: getApprovalEmailTemplate(userName, loginUrl),
      };
      const trans = getTransporter();
      await trans.sendMail(mailOptions);
      console.log(`✅ Approval email sent to ${userEmail}`);
      return true;
    }
  } catch (error: any) {
    console.error("❌ Error sending approval email:", error.message);
    return false;
  }
};

export const sendRejectionEmail = async (
  userEmail: string,
  userName: string,
  reason: string,
): Promise<boolean> => {
  try {
    if (shouldUseMailtrap()) {
      const client = getMailtrapClient();
      const fromEmail = parseEmailFrom();
      await client.send({
        from: fromEmail,
        to: [{ email: userEmail }],
        subject: "⚠️ Update Regarding Your GradSync Application",
        html: getRejectionEmailTemplate(userName, reason),
        category: "Account Rejection",
      });
      console.log(`❌ Rejection email sent to ${userEmail}`);
      return true;
    } else {
      if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) return false;
      const mailOptions = {
        from: env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
        to: userEmail,
        subject: "⚠️ Update Regarding Your GradSync Application",
        html: getRejectionEmailTemplate(userName, reason),
      };
      const trans = getTransporter();
      await trans.sendMail(mailOptions);
      console.log(`❌ Rejection email sent to ${userEmail}`);
      return true;
    }
  } catch (error: any) {
    console.error("❌ Error sending rejection email:", error.message);
    return false;
  }
};

export const sendInterviewResultEmail = async (
  userEmail: string,
  userName: string,
  roleName: string,
  score: number,
  summary: string,
): Promise<boolean> => {
  try {
    const resultUrl = `${env.FRONTEND_URL || "https://gradsync.tech"}/profile`;

    if (shouldUseMailtrap()) {
      const client = getMailtrapClient();
      const fromEmail = parseEmailFrom();
      await client.send({
        from: fromEmail,
        to: [{ email: userEmail }],
        subject: `🏆 Your Interview Results for ${roleName} are Ready!`,
        html: getInterviewResultEmailTemplate(
          userName,
          roleName,
          score,
          summary,
          resultUrl,
        ),
        category: "Interview Results",
      });
      console.log(`✅ Interview result email sent to ${userEmail}`);
      return true;
    } else {
      if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) return false;
      const mailOptions = {
        from: env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
        to: userEmail,
        subject: `🏆 Your Interview Results for ${roleName} are Ready!`,
        html: getInterviewResultEmailTemplate(
          userName,
          roleName,
          score,
          summary,
          resultUrl,
        ),
      };
      const trans = getTransporter();
      await trans.sendMail(mailOptions);
      console.log(`✅ Interview result email sent to ${userEmail}`);
      return true;
    }
  } catch (error: any) {
    console.error("❌ Error sending interview result email:", error.message);
    return false;
  }
};

export const sendAssessmentApprovalEmail = async (
  userEmail: string,
  userName: string,
  assessmentTitle: string,
  score: number,
  level?: string,
): Promise<boolean> => {
  try {
    const resultUrl = `${env.FRONTEND_URL || "https://gradsync.tech"}/profile`;
    const pdfBuffer = await generateAssessmentCertificatePdf({
      userName,
      assessmentTitle,
      score,
      level,
      issuedAt: new Date(),
    });
    const attachmentName = `${assessmentTitle.replace(/\s+/g, "-")}-certificate.pdf`;

    if (shouldUseMailtrap()) {
      const client = getMailtrapClient();
      const fromEmail = parseEmailFrom();
      await client.send({
        from: fromEmail,
        to: [{ email: userEmail }],
        subject: "Assessment Approved - GradSync",
        html: getAssessmentApprovalEmailTemplate(
          userName,
          assessmentTitle,
          score,
          resultUrl,
        ),
        attachments: [
          {
            filename: attachmentName,
            content: pdfBuffer.toString("base64"),
            type: "application/pdf",
            disposition: "attachment",
          },
        ],
        category: "Assessment Review",
      });
      console.log(`✅ Assessment approval email sent to ${userEmail}`);
      return true;
    }

    if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) return false;
    const mailOptions = {
      from: env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Assessment Approved - GradSync",
      html: getAssessmentApprovalEmailTemplate(
        userName,
        assessmentTitle,
        score,
        resultUrl,
      ),
      attachments: [
        {
          filename: attachmentName,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };
    const trans = getTransporter();
    await trans.sendMail(mailOptions);
    console.log(`✅ Assessment approval email sent to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error("❌ Error sending assessment approval email:", error.message);
    return false;
  }
};

export const sendAssessmentRejectionEmail = async (
  userEmail: string,
  userName: string,
  assessmentTitle: string,
  reason: string,
): Promise<boolean> => {
  try {
    const supportEmail = "support@gradsync.tech";

    if (shouldUseMailtrap()) {
      const client = getMailtrapClient();
      const fromEmail = parseEmailFrom();
      await client.send({
        from: fromEmail,
        to: [{ email: userEmail }],
        subject: "Assessment Update - GradSync",
        html: getAssessmentRejectionEmailTemplate(
          userName,
          assessmentTitle,
          reason,
          supportEmail,
        ),
        category: "Assessment Review",
      });
      console.log(`✅ Assessment rejection email sent to ${userEmail}`);
      return true;
    }

    if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) return false;
    const mailOptions = {
      from: env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Assessment Update - GradSync",
      html: getAssessmentRejectionEmailTemplate(
        userName,
        assessmentTitle,
        reason,
        supportEmail,
      ),
    };
    const trans = getTransporter();
    await trans.sendMail(mailOptions);
    console.log(`✅ Assessment rejection email sent to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error(
      "❌ Error sending assessment rejection email:",
      error.message,
    );
    return false;
  }
};

export const sendForgotPasswordEmail = async (
  userEmail: string,
  otp: string,
): Promise<boolean> => {
  try {
    if (shouldUseMailtrap()) {
      const client = getMailtrapClient();
      const fromEmail = parseEmailFrom();
      await client.send({
        from: fromEmail,
        to: [{ email: userEmail }],
        subject: "GradSync - Password Reset Request",
        html: getForgotPasswordEmailTemplate(otp),
        category: "Password Reset",
      });
      console.log(`✅ Forgot password email sent to ${userEmail}`);
      return true;
    }

    if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) return false;
    const mailOptions = {
      from: env.EMAIL_FROM || `"GradSync" <${env.EMAIL_USER}>`,
      to: userEmail,
      subject: "GradSync - Password Reset Request",
      html: getForgotPasswordEmailTemplate(otp),
    };
    const trans = getTransporter();
    await trans.sendMail(mailOptions);
    console.log(`✅ Forgot password email sent to ${userEmail}`);
    return true;
  } catch (error: any) {
    console.error("❌ Error sending forgot password email:", error.message);
    return false;
  }
};
