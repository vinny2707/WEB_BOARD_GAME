/**
 * Email Configuration
 * Uses nodemailer with Gmail SMTP
 */

const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 465, // Changed from 587 to 465 for Railway
    secure: true, // true for 465 (SSL), false for 587 (TLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    // Add timeouts to prevent hanging on Railway
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
    tls: {
        // Don't fail on invalid certs (for some hosting providers)
        rejectUnauthorized: false
    }
});

// Verify connection on startup
const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log('Email service connected successfully');
        return true;
    } catch (error) {
        console.warn('Email service connection failed:', error.message);
        return false;
    }
};

module.exports = {
    transporter,
    verifyConnection
};
