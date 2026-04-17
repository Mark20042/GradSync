const nodemailer = require("nodemailer");
const {
  getVerificationSuccessEmailTemplate,
  getVerificationFailedEmailTemplate,
} = require("./emailTemplates");

/**
 * Email Service for SipaCareer
 * Handles sending emails using nodemailer
 */

// Create reusable transporter
let transporter = null;

/**
 * Initialize email transporter
 * @returns {Object} Nodemailer transporter
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};

/**
 * Send verification success email to user
 * @param {string} userEmail - Email address of the user
 * @param {string} userName - Name of the user
 * @param {string} role - Role of the user ('graduate' or 'employer')
 * @returns {Promise<boolean>} True if email sent successfully, false otherwise
 */
exports.sendVerificationSuccessEmail = async (userEmail, userName, role) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn(
        "⚠️  Email service not configured. Skipping email notification.",
      );
      return false;
    }

    const mailOptions = {
      from:
        process.env.EMAIL_FROM || `"SipaCareer" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "✅ Your SipaCareer Account Has Been Verified!",
      html: getVerificationSuccessEmailTemplate(userName, role),
    };

    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);

    console.log(`✅ Verification success email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending verification email:", error.message);
    return false;
  }
};

/**
 * Send verification failed email to user
 * @param {string} userEmail - Email address of the user
 * @param {string} userName - Name of the user
 * @param {string} role - Role of the user ('graduate' or 'employer')
 * @returns {Promise<boolean>} True if email sent successfully, false otherwise
 */
exports.sendVerificationFailedEmail = async (userEmail, userName, role) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn(
        "⚠️  Email service not configured. Skipping email notification.",
      );
      return false;
    }

    const mailOptions = {
      from:
        process.env.EMAIL_FROM || `"SipaCareer" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "⚠️ Action Required: SipaCareer Verification Failed",
      html: getVerificationFailedEmailTemplate(userName, role),
    };

    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);

    console.log(`❌ Verification failed email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending failed verification email:", error.message);
    return false;
  }
};

/**
 * Verify email service configuration
 * @returns {Promise<boolean>} True if email service is properly configured
 */
exports.verifyEmailService = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return false;
    }

    const transporter = getTransporter();
    await transporter.verify();
    console.log("✅ Email service is ready");
    return true;
  } catch (error) {
    console.error("❌ Email service verification failed:", error.message);
    return false;
  }
};
