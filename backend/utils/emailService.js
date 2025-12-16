const nodemailer = require('nodemailer');
const { getApprovalEmailTemplate, getRejectionEmailTemplate } = require('./emailTemplates');

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
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    return transporter;
};

/**
 * Send approval email to employer
 * @param {string} employerEmail - Email address of the employer
 * @param {string} employerName - Name of the employer
 * @returns {Promise<boolean>} True if email sent successfully, false otherwise
 */
exports.sendApprovalEmail = async (employerEmail, employerName) => {
    try {
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('⚠️  Email service not configured. Skipping email notification.');
            return false;
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"SipaCareer" <${process.env.EMAIL_USER}>`,
            to: employerEmail,
            subject: '🎉 Your SipaCareer Account Has Been Approved!',
            html: getApprovalEmailTemplate(employerName)
        };

        const transporter = getTransporter();
        await transporter.sendMail(mailOptions);

        console.log(`✅ Approval email sent successfully to ${employerEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending approval email:', error.message);
        return false;
    }
};

/**
 * Send rejection email to employer
 * @param {string} employerEmail - Email address of the employer
 * @param {string} employerName - Name of the employer
 * @param {string} reason - Reason for rejection
 * @returns {Promise<boolean>} True if email sent successfully, false otherwise
 */
exports.sendRejectionEmail = async (employerEmail, employerName, reason) => {
    try {
        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('⚠️  Email service not configured. Skipping email notification.');
            return false;
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"SipaCareer" <${process.env.EMAIL_USER}>`,
            to: employerEmail,
            subject: 'SipaCareer Account Status Update',
            html: getRejectionEmailTemplate(employerName, reason)
        };

        const transporter = getTransporter();
        await transporter.sendMail(mailOptions);

        console.log(`✅ Rejection email sent successfully to ${employerEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending rejection email:', error.message);
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
        console.log('✅ Email service is ready');
        return true;
    } catch (error) {
        console.error('❌ Email service verification failed:', error.message);
        return false;
    }
};
