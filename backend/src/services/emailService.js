/**
 * Email Service
 * Handles sending emails (OTP, notifications, etc.)
 */

const { transporter } = require('../config/email');

// Email types configuration
const EMAIL_TYPES = {
    register: {
        subject: 'Board Game - Xác thực tài khoản',
        headerColor: '#4F46E5',
        title: 'Xác thực tài khoản của bạn',
        message: 'Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã OTP dưới đây để xác thực email của bạn:',
        footer: 'Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này.'
    },
    reactivate: {
        subject: 'Board Game - Kích hoạt lại tài khoản',
        headerColor: '#059669',
        title: 'Kích hoạt lại tài khoản',
        message: 'Tài khoản của bạn đã không hoạt động trong một thời gian. Vui lòng sử dụng mã OTP dưới đây để kích hoạt lại:',
        footer: 'Nếu bạn không yêu cầu kích hoạt lại, vui lòng bỏ qua email này.'
    },
    resetPassword: {
        subject: 'Board Game - Đặt lại mật khẩu',
        headerColor: '#DC2626',
        title: 'Đặt lại mật khẩu',
        message: 'Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP dưới đây:',
        footer: 'Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.'
    }
};

class EmailService {
    /**
     * Send OTP email (generic - works for all types)
     * @param {string} email - Recipient email
     * @param {string} otpCode - 6-digit OTP code
     * @param {number} expiresInMinutes - OTP expiration time
     * @param {string} type - Email type: 'register', 'reactivate', 'resetPassword'
     * @returns {Promise<boolean>}
     */
    async sendOtpEmail(email, otpCode, expiresInMinutes = 5, type = 'register') {
        const config = EMAIL_TYPES[type] || EMAIL_TYPES.register;

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: email,
            subject: config.subject,
            html: this.getOtpEmailTemplate(otpCode, expiresInMinutes, config)
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error(`Failed to send ${type} email:`, error.message);
            throw new Error(`Failed to send ${type} email`);
        }
    }

    /**
     * Generate OTP email HTML template
     * @param {string} otpCode 
     * @param {number} expiresInMinutes 
     * @param {Object} config - Email type configuration
     * @returns {string}
     */
    getOtpEmailTemplate(otpCode, expiresInMinutes, config) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: ${config.headerColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .otp-code { font-size: 32px; font-weight: bold; color: ${config.headerColor}; letter-spacing: 8px; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                .warning { color: #dc2626; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎮 Board Game</h1>
                </div>
                <div class="content">
                    <h2>${config.title}</h2>
                    <p>${config.message}</p>
                    
                    <div class="otp-code">${otpCode}</div>
                    
                    <p class="warning">Mã này sẽ hết hạn sau ${expiresInMinutes} phút.</p>
                    <p>${config.footer}</p>
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
