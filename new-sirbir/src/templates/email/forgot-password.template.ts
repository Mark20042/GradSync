export const getForgotPasswordEmailTemplate = (otp: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p style="color: #555; font-size: 16px;">Hello,</p>
      <p style="color: #555; font-size: 16px;">We received a request to reset your password. Use the OTP below to proceed with the password reset process.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; padding: 15px 25px; font-size: 24px; font-weight: bold; color: #fff; background-color: #2563eb; border-radius: 8px; letter-spacing: 4px;">
          ${otp}
        </span>
      </div>

      <p style="color: #555; font-size: 16px;">This OTP is valid for <strong>5 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
      
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
      <p style="color: #888; font-size: 14px; text-align: center;">Best regards,<br/>The GradSync Team</p>
    </div>
  `;
};
