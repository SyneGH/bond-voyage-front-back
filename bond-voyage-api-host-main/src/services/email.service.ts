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

  /**
   * Send system contact email (Contact.tsx - Landing Page)
   * Simple contact form to BondVoyage developers
   */
  public async sendSystemContactEmail(
    name: string,
    email: string,
    message: string
  ): Promise<void> {
    try {
      const apiKey = process.env.BREVO_API_KEY;

      if (!apiKey) {
        throw new Error('BREVO_API_KEY is missing in environment variables');
      }

      const recipientEmail = process.env.SYSTEM_CONTACT_EMAIL || 'bondvoyage.system@gmail.com';

      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { 
            name: `${name} via BondVoyage`, 
            email: this.fromEmail 
          },
          to: [{ 
            email: recipientEmail, 
            name: 'BondVoyage Development Team' 
          }],
          replyTo: { email, name },
          subject: `Contact Form Submission from ${name}`,
          htmlContent: this.generateSystemContactHTML(name, email, message),
          textContent: this.generateSystemContactText(name, email, message),
        },
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('✅ System contact email sent successfully:', response.data.messageId);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Failed to send system contact email:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw new Error('Failed to send contact email');
    }
  }

  /**
   * Send travel agency contact email (UserHome.tsx - User Dashboard)
   * Rich text editor with file attachments to 4B's Travel and Tours
   */
  public async sendTravelAgencyContactEmail(
    subject: string,
    message: string,
    senderName: string,
    senderEmail: string,
    attachments?: Array<{ filename: string; content: string }>
  ): Promise<void> {
    try {
      const apiKey = process.env.BREVO_API_KEY;

      if (!apiKey) {
        throw new Error('BREVO_API_KEY is missing in environment variables');
      }

      const recipientEmail = process.env.TRAVEL_AGENCY_EMAIL || '4bstravelandtours2019@gmail.com';

      const emailPayload: any = {
        sender: { 
          name: `${senderName} via BondVoyage`, 
          email: this.fromEmail 
        },
        to: [{ 
          email: recipientEmail, 
          name: "4B's Travel and Tours" 
        }],
        replyTo: { email: senderEmail, name: senderName },
        subject: `[BondVoyage] ${subject}`,
        htmlContent: this.generateTravelAgencyContactHTML(subject, message, senderName, senderEmail, attachments),
        textContent: this.generateTravelAgencyContactText(subject, message, senderName, senderEmail),
      };

      // Add attachments if provided (base64 encoded)
      if (attachments && attachments.length > 0) {
        emailPayload.attachment = attachments;
      }

      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        emailPayload,
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('✅ Travel agency contact email sent successfully:', response.data.messageId);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Failed to send travel agency contact email:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw new Error('Failed to send travel agency contact email');
    }
  }

  /**
   * Generate System Contact Email HTML
   */
  private generateSystemContactHTML(
    name: string,
    email: string,
    message: string
  ): string {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFB;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(10, 122, 255, 0.12);">
        
        <div style="background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%); padding: 40px 32px; text-align: center;">
          <h1 style="margin: 0; color: #FFFFFF; font-size: 32px; font-weight: 700;">🌴 BondVoyage</h1>
          <p style="margin: 8px 0 0 0; color: #FFFFFF; font-size: 16px;">New Contact Form Submission</p>
        </div>

        <div style="padding: 40px 32px;">
          <div style="background: linear-gradient(135deg, #0A7AFF10 0%, #14B8A610 100%); padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #E5E7EB;">
            <div style="display: grid; gap: 16px;">
              <div>
                <p style="margin: 0 0 4px 0; color: #0A7AFF; font-size: 12px; font-weight: 600; text-transform: uppercase;">From</p>
                <p style="margin: 0; color: #1A2B4F; font-size: 16px; font-weight: 600;">${name}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #0A7AFF; font-size: 12px; font-weight: 600; text-transform: uppercase;">Email</p>
                <p style="margin: 0; color: #1A2B4F; font-size: 16px;"><a href="mailto:${email}" style="color: #0A7AFF; text-decoration: none;">${email}</a></p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #0A7AFF; font-size: 12px; font-weight: 600; text-transform: uppercase;">Received</p>
                <p style="margin: 0; color: #64748B; font-size: 14px;">${new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}</p>
              </div>
            </div>
          </div>

          <div style="background-color: #F8FAFB; border-radius: 12px; padding: 24px; border-left: 4px solid #0A7AFF;">
            <p style="margin: 0 0 12px 0; color: #1A2B4F; font-size: 14px; font-weight: 600; text-transform: uppercase;">Message</p>
            <p style="margin: 0; color: #334155; font-size: 15px; line-height: 24px; white-space: pre-wrap;">${message}</p>
          </div>
        </div>

        <div style="background-color: #F8FAFB; padding: 32px; text-align: center; border-top: 1px solid #E5E7EB;">
          <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 16px;">Reply to ${name}</a>
          <p style="margin: 16px 0 0 0; color: #64748B; font-size: 13px;">This email was sent from the BondVoyage contact form.</p>
          <p style="margin: 4px 0 0 0; color: #94A3B8; font-size: 12px;">© 2025 BondVoyage. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
    `;
  }

  /**
   * Generate System Contact Email Plain Text
   */
  private generateSystemContactText(
    name: string,
    email: string,
    message: string
  ): string {
    return `
  NEW CONTACT FORM SUBMISSION

  From: ${name}
  Email: ${email}
  Received: ${new Date().toLocaleString('en-US')}

  MESSAGE:
  ${message}

  ---
  Reply to this email to respond to ${name}.
  This email was sent from the BondVoyage contact form.
  © 2025 BondVoyage. All rights reserved.
    `;
  }

  /**
   * Generate Travel Agency Contact Email HTML
   */
  private generateTravelAgencyContactHTML(
    subject: string,
    message: string,
    senderName: string,
    senderEmail: string,
    attachments?: Array<{ filename: string; content: string }>
  ): string {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Customer Inquiry</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F5F5F5;">
    <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
      <div style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(8, 145, 178, 0.15);">
        
        <div style="background: linear-gradient(135deg, #0891b2 0%, #14b8a6 50%, #2dd4bf 100%); padding: 50px 40px; text-align: center;">
          <h1 style="margin: 0 0 8px 0; color: #FFFFFF; font-size: 36px; font-weight: 700;">✈️ New Customer Inquiry</h1>
          <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">via BondVoyage Platform</p>
        </div>

        <div style="padding: 40px;">
          <div style="background: linear-gradient(135deg, #0A7AFF10 0%, #14B8A610 100%); padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #E5E7EB;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="padding: 12px; background: white; border-radius: 8px;">
                <p style="margin: 0 0 4px 0; color: #0A7AFF; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
                <p style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 600;">${senderName}</p>
              </div>
              <div style="padding: 12px; background: white; border-radius: 8px;">
                <p style="margin: 0 0 4px 0; color: #0A7AFF; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                <p style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 500;">${senderEmail}</p>
              </div>
              <div style="padding: 12px; background: white; border-radius: 8px;">
                <p style="margin: 0 0 4px 0; color: #0A7AFF; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Received</p>
                <p style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 500;">${new Date().toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}</p>
              </div>
              <div style="padding: 12px; background: white; border-radius: 8px;">
                <p style="margin: 0 0 4px 0; color: #0A7AFF; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Platform</p>
                <p style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 500;">BondVoyage</p>
              </div>
            </div>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #0A7AFF;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Subject</p>
            <p style="margin: 0; color: #1e293b; font-size: 20px; font-weight: 600;">${subject}</p>
          </div>

          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #E5E7EB; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Message</p>
            <div style="color: #334155; font-size: 15px; line-height: 28px;">${message}</div>
          </div>

          ${
            attachments && attachments.length > 0
              ? `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 12px; border: 1px solid #fbbf24; margin-bottom: 24px;">
            <p style="margin: 0 0 16px 0; color: #92400e; font-size: 14px; font-weight: 600;">📎 ${attachments.length} Attachment${attachments.length > 1 ? 's' : ''}</p>
            ${attachments
              .map(
                (file) => `
              <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; background: #fbbf24; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">📄</div>
                <div style="flex: 1;">
                  <p style="margin: 0 0 2px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${file.filename}</p>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          `
              : ''
          }
        </div>

        <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px; font-weight: 600;">Quick Actions</p>
          <a href="mailto:${senderEmail}" style="display: inline-block; background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 20px; font-size: 15px;">Reply to ${senderName}</a>
          <p style="margin: 20px 0 0 0; color: #64748B; font-size: 13px;">This inquiry was sent through the BondVoyage travel planning platform.</p>
          <p style="margin: 4px 0 0 0; color: #64748B; font-size: 13px;">To respond, simply reply to this email or click the button above.</p>
          <p style="margin: 16px 0 0 0; color: #94A3B8; font-size: 12px;">© 2025 BondVoyage. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
    `;
  }

  /**
   * Generate Travel Agency Contact Email Plain Text
   */
  private generateTravelAgencyContactText(
    subject: string,
    message: string,
    senderName: string,
    senderEmail: string
  ): string {
    // Strip HTML tags for plain text version
    const plainMessage = message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    
    return `
  NEW CUSTOMER INQUIRY VIA BONDVOYAGE

  From: ${senderName}
  Email: ${senderEmail}
  Received: ${new Date().toLocaleString('en-US')}

  SUBJECT: ${subject}

  MESSAGE:
  ${plainMessage}

  ---
  Reply to this email to respond to ${senderName}.
  This inquiry was sent through the BondVoyage travel planning platform.
  © 2025 BondVoyage. All rights reserved.
    `;
  }
}

export default new EmailService();