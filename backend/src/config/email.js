/**
 * Email Configuration
 * Uses nodemailer with Gmail SMTP
 */

const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    family: 4
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
