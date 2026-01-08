/**
 * Email Service
 * Handles sending emails (OTP, notifications, etc.)
 */

const { transporter } = require('../config/email');

class EmailService {
    /**
     * Send OTP email for registration
     * @param {string} email - Recipient email
     * @param {string} otpCode - 6-digit OTP code
     * @param {number} expiresInMinutes - OTP expiration time
     * @returns {Promise<boolean>}
     */
    async sendOtpEmail(email, otpCode, expiresInMinutes = 5) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'Board Game - Xác thực tài khoản',
            html: this.getOtpEmailTemplate(otpCode, expiresInMinutes)
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Failed to send OTP email:', error.message);
            throw new Error('Failed to send verification email');
        }
    }

    /**
     * Generate OTP email HTML template
     * @param {string} otpCode 
     * @param {number} expiresInMinutes 
     * @returns {string}
     */
    getOtpEmailTemplate(otpCode, expiresInMinutes) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                .warning { color: #dc2626; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Board Game</h1>
                </div>
                <div class="content">
                    <h2>Xác thực tài khoản của bạn</h2>
                    <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã OTP dưới đây để xác thực email của bạn:</p>
                    
                    <div class="otp-code">${otpCode}</div>
                    
                    <p class="warning">Mã này sẽ hết hạn sau ${expiresInMinutes} phút.</p>
                    <p>Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này.</p>
                </div>
                <div class="footer">
                    <p>Đây là email tự động, vui lòng không trả lời email này.</p>
                    <p>&copy; 2026 Board Game. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = new EmailService();
