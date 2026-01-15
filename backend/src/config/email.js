/**
 * Email Configuration
 * Uses Resend API (replacing nodemailer for Railway compatibility)
 */

const { Resend } = require('resend');
const logger = require('../utils/logger');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} - Resend response
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY not configured');
        }

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'RetroBit <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            html: html
        });

        if (error) {
            logger.error('Resend API error:', error);
            throw new Error(error.message);
        }

        logger.info(`Email sent successfully to ${to}, ID: ${data.id}`);
        return data;
    } catch (error) {
        logger.error('Failed to send email:', error);
        throw error;
    }
};

/**
 * Verify email service configuration
 */
const verifyConnection = async () => {
    try {
        if (!process.env.RESEND_API_KEY) {
            logger.warn('RESEND_API_KEY not configured in environment variables');
            return false;
        }
        logger.info('Resend email service configured successfully');
        return true;
    } catch (error) {
        logger.error('Email service verification failed:', error.message);
        return false;
    }
};

module.exports = {
    sendEmail,
    verifyConnection
};
