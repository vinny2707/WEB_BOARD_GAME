/**
 * OTP Service (In-Memory Storage)
 * Handles OTP generation, validation, and session management
 * 
 * NOTE: This uses in-memory storage. OTP sessions will be lost on server restart.
 * For production, consider using Redis or database storage.
 */

const emailService = require('./emailService');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for OTP sessions
const otpSessions = new Map();

class OtpService {
    constructor() {
        this.OTP_LENGTH = 6;
        this.OTP_EXPIRES_MINUTES = parseInt(process.env.OTP_EXPIRES_MINUTES) || 5;
        this.MAX_ATTEMPTS = 5;
        
        // Cleanup expired sessions every minute
        setInterval(() => this.cleanupExpired(), 60 * 1000);
    }

    /**
     * Generate a random 6-digit OTP code
     * @returns {string}
     */
    generateOtpCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Mask email for display (e.g., t***t@gmail.com)
     * @param {string} email 
     * @returns {string}
     */
    maskEmail(email) {
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) {
            return `${localPart[0]}***@${domain}`;
        }
        return `${localPart[0]}${'*'.repeat(Math.min(localPart.length - 2, 3))}${localPart[localPart.length - 1]}@${domain}`;
    }

    /**
     * Create OTP session for registration
     * @param {Object} registrationData - {username, email, password, full_name, dob}
     * @returns {Promise<Object>} - {otpSessionId, maskedEmail, otpExpiresIn}
     */
    async createRegistrationSession(registrationData) {
        const { username, email, password, full_name, dob } = registrationData;

        // Hash password before storing
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Delete any existing sessions for this email
        this.deleteByEmail(email);

        // Generate OTP and session ID
        const sessionId = uuidv4();
        const otpCode = this.generateOtpCode();
        const expiresAt = new Date(Date.now() + this.OTP_EXPIRES_MINUTES * 60 * 1000);

        // Store session in memory
        otpSessions.set(sessionId, {
            id: sessionId,
            type: 'register',
            email,
            registrationData: {
                username,
                password_hash,
                full_name: full_name || null,
                dob: dob || null
            },
            otpCode,
            expiresAt,
            verified: false,
            attempts: 0,
            maxAttempts: this.MAX_ATTEMPTS,
            createdAt: new Date()
        });

        // Send OTP email (type: register)
        await emailService.sendOtpEmail(email, otpCode, this.OTP_EXPIRES_MINUTES, 'register');

        return {
            otpSessionId: sessionId,
            maskedEmail: this.maskEmail(email),
            otpExpiresIn: this.OTP_EXPIRES_MINUTES * 60
        };
    }

    /**
     * Create OTP session for account reactivation
     * @param {Object} user - User object from database
     * @returns {Promise<Object>} - {otpSessionId, maskedEmail, otpExpiresIn}
     */
    async createReactivationSession(user) {
        // Delete any existing sessions for this email
        this.deleteByEmail(user.email);

        // Generate OTP and session ID
        const sessionId = uuidv4();
        const otpCode = this.generateOtpCode();
        const expiresAt = new Date(Date.now() + this.OTP_EXPIRES_MINUTES * 60 * 1000);

        // Store session in memory
        otpSessions.set(sessionId, {
            id: sessionId,
            type: 'reactivate',
            email: user.email,
            userId: user.id,
            otpCode,
            expiresAt,
            verified: false,
            attempts: 0,
            maxAttempts: this.MAX_ATTEMPTS,
            createdAt: new Date()
        });

        // Send OTP email (type: reactivate)
        await emailService.sendOtpEmail(user.email, otpCode, this.OTP_EXPIRES_MINUTES, 'reactivate');

        return {
            otpSessionId: sessionId,
            maskedEmail: this.maskEmail(user.email),
            otpExpiresIn: this.OTP_EXPIRES_MINUTES * 60
        };
    }

    /**
     * Verify OTP code
     * @param {string} otpSessionId 
     * @param {string} otpCode 
     * @returns {Object} - Registration data if verified
     */
    verifyOtp(otpSessionId, otpCode) {
        const session = otpSessions.get(otpSessionId);

        if (!session) {
            const error = new Error('OTP session not found or expired');
            error.statusCode = 404;
            throw error;
        }

        // Check if already verified
        if (session.verified) {
            const error = new Error('OTP already verified');
            error.statusCode = 400;
            throw error;
        }

        // Check expiration
        if (new Date(session.expiresAt) < new Date()) {
            otpSessions.delete(otpSessionId);
            const error = new Error('OTP has expired');
            error.statusCode = 400;
            throw error;
        }

        // Check max attempts
        if (session.attempts >= session.maxAttempts) {
            otpSessions.delete(otpSessionId);
            const error = new Error('Maximum verification attempts exceeded');
            error.statusCode = 429;
            throw error;
        }

        // Verify OTP code
        if (session.otpCode !== otpCode) {
            session.attempts++;
            const remainingAttempts = session.maxAttempts - session.attempts;
            const error = new Error(`Invalid OTP code. ${remainingAttempts} attempts remaining`);
            error.statusCode = 400;
            throw error;
        }

        // Mark as verified
        session.verified = true;
        session.verifiedAt = new Date();

        // Return session data (different fields based on type)
        if (session.type === 'reactivate') {
            return {
                email: session.email,
                type: session.type,
                userId: session.userId
            };
        }

        return {
            email: session.email,
            type: session.type,
            registrationData: session.registrationData
        };
    }

    /**
     * Resend OTP for existing session
     * @param {string} otpSessionId 
     * @returns {Promise<Object>} - {otpSessionId, maskedEmail, otpExpiresIn}
     */
    async resendOtp(otpSessionId) {
        const session = otpSessions.get(otpSessionId);

        if (!session) {
            const error = new Error('OTP session not found');
            error.statusCode = 404;
            throw error;
        }

        if (session.verified) {
            const error = new Error('OTP already verified');
            error.statusCode = 400;
            throw error;
        }

        // Generate new OTP
        const newOtpCode = this.generateOtpCode();
        const newExpiresAt = new Date(Date.now() + this.OTP_EXPIRES_MINUTES * 60 * 1000);

        // Update session with new OTP
        session.otpCode = newOtpCode;
        session.expiresAt = newExpiresAt;
        session.attempts = 0; // Reset attempts on resend

        // Send new OTP email
        await emailService.sendOtpEmail(session.email, newOtpCode, this.OTP_EXPIRES_MINUTES);

        return {
            otpSessionId: session.id,
            maskedEmail: this.maskEmail(session.email),
            otpExpiresIn: this.OTP_EXPIRES_MINUTES * 60
        };
    }

    /**
     * Delete session by ID
     * @param {string} sessionId 
     */
    delete(sessionId) {
        otpSessions.delete(sessionId);
    }

    /**
     * Delete all sessions for an email
     * @param {string} email 
     */
    deleteByEmail(email) {
        for (const [id, session] of otpSessions) {
            if (session.email === email) {
                otpSessions.delete(id);
            }
        }
    }

    /**
     * Cleanup expired sessions
     */
    cleanupExpired() {
        const now = new Date();
        for (const [id, session] of otpSessions) {
            if (new Date(session.expiresAt) < now) {
                otpSessions.delete(id);
            }
        }
    }

    /**
     * Get session count (for debugging)
     * @returns {number}
     */
    getSessionCount() {
        return otpSessions.size;
    }
}

module.exports = new OtpService();
