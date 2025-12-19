import axios ,{ isAxiosError } from 'axios';

class EmailService {
  private fromEmail = process.env.EMAIL_FROM || 'bondvoyage.system@gmail.com'; 
  private fromName = 'BondVoyage Support';

/**
   * Send OTP verification email via Brevo API
   */
  public async sendOTPEmail(
    recipientEmail: string,
    recipientName: string,
    otpCode: string
  ): Promise<void> {
    try {
      const apiKey = process.env.BREVO_API_KEY; 

      if (!apiKey) {
        throw new Error('BREVO_API_KEY is missing in environment variables');
      }

      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: this.fromName, email: this.fromEmail },
          to: [{ email: recipientEmail, name: recipientName }],
          subject: 'Verify Your BondVoyage Account',
          htmlContent: this.generateOTPEmailHTML(recipientName, otpCode, recipientEmail),
          textContent: this.generateOTPEmailText(recipientName, otpCode),
        },
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('✅ OTP Email sent successfully:', response.data.messageId);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Failed to send OTP email:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email via Brevo API
   */
  public async sendPasswordResetEmail(
    recipientEmail: string,
    resetToken: string
  ): Promise<void> {
    try {
      const apiKey = process.env.BREVO_API_KEY; 

      if (!apiKey) {
        throw new Error('BREVO_API_KEY is missing in environment variables');
      }

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: this.fromName, email: this.fromEmail },
          to: [{ email: recipientEmail }],
          subject: 'Reset Your BondVoyage Password',
          htmlContent: this.generatePasswordResetHTML(recipientEmail, resetLink),
          textContent: this.generatePasswordResetText(resetLink),
        },
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('✅ Password reset email sent successfully:', response.data.messageId);
    } catch (error) {
    if (isAxiosError(error)) {
        console.error('Failed to send password reset email:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }

  /**
   * Generate OTP Email HTML
   */
  private generateOTPEmailHTML(
    recipientName: string,
    otpCode: string,
    recipientEmail: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your BondVoyage Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFB;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(10, 122, 255, 0.12);">
      
      <div style="background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%); padding: 40px 32px; text-align: center;">
        <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">BondVoyage</h1>
        <p style="margin: 8px 0 0 0; color: #FFFFFF; font-size: 16px;">Your Travel Planning Companion</p>
      </div>

      <div style="padding: 40px 32px;">
        <h2 style="margin: 0 0 16px 0; color: #1A2B4F; font-size: 24px;">Hi ${recipientName}! 👋</h2>
        <p style="margin: 0 0 24px 0; color: #64748B; font-size: 15px; line-height: 24px;">
          Thank you for signing up with BondVoyage! To complete your account creation, please verify your email address using the code below.
        </p>

        <div style="background-color: #F0F9FF; border: 2px solid #0A7AFF; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
          <p style="margin: 0 0 12px 0; color: #64748B; font-size: 14px; font-weight: 600; text-transform: uppercase;">Your Verification Code</p>
          <div style="font-size: 40px; font-weight: 700; color: #0A7AFF; letter-spacing: 8px; font-family: monospace;">${otpCode}</div>
          <p style="margin: 12px 0 0 0; color: #64748B; font-size: 13px;">This code will expire in <strong>10 minutes</strong></p>
        </div>

        <div style="background-color: #F8FAFB; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
          <h3 style="margin: 0 0 12px 0; color: #1A2B4F; font-size: 16px;">How to verify:</h3>
          <ol style="margin: 0; padding-left: 20px; color: #64748B; font-size: 14px; line-height: 24px;">
            <li>Return to the BondVoyage sign-up page</li>
            <li>Enter the 6-digit code shown above</li>
            <li>Click "Verify & Create Account"</li>
          </ol>
        </div>

        <div style="padding: 16px; background-color: #FFF7ED; border: 1px solid #FDBA74; border-radius: 8px;">
          <p style="margin: 0 0 4px 0; color: #1A2B4F; font-size: 14px; font-weight: 600;">🔒 Security Notice</p>
          <p style="margin: 0; color: #64748B; font-size: 13px;">Never share this code with anyone. BondVoyage will never ask for your code via phone or social media.</p>
        </div>
      </div>

      <div style="background-color: #F8FAFB; padding: 32px; text-align: center; border-top: 1px solid #E5E7EB;">
        <p style="margin: 0; color: #64748B; font-size: 13px;">Need help? Contact us at <a href="mailto:support@bondvoyage.com" style="color: #0A7AFF;">support@bondvoyage.com</a></p>
        <p style="margin: 16px 0 0 0; color: #94A3B8; font-size: 12px;">© 2025 BondVoyage. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate OTP Email Plain Text
   */
  private generateOTPEmailText(recipientName: string, otpCode: string): string {
    return `
Hi ${recipientName}!

Thank you for signing up with BondVoyage! To complete your account creation, please verify your email address.

YOUR VERIFICATION CODE
${otpCode}

This code will expire in 10 minutes.

HOW TO VERIFY:
1. Return to the BondVoyage sign-up page
2. Enter the 6-digit code shown above
3. Click "Verify & Create Account"

Need help? Contact us at support@bondvoyage.com

© 2025 BondVoyage. All rights reserved.
    `.trim();
  }

  /**
   * Generate Password Reset HTML
   */
  private generatePasswordResetHTML(email: string, resetLink: string): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">BondVoyage</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Click the button below to create a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background: #0A7AFF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
    </div>
    <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes. If you didn't request this, please ignore this email.</p>
    <p style="color: #666; font-size: 14px;">Link: ${resetLink}</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate Password Reset Plain Text
   */
  private generatePasswordResetText(resetLink: string): string {
    return `
Password Reset Request

You requested to reset your password. Visit this link to create a new password:
${resetLink}

This link will expire in 15 minutes.

© 2025 BondVoyage
    `.trim();
  }
}

export default new EmailService();