const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpService = require('./otpService');

/**
 * Authentication Service
 * Handles all business logic for user authentication and registration
 */

class AuthService {
    /**
     * Step 1: Initiate registration - validate data and send OTP
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} {otpSessionId, maskedEmail, otpExpiresIn}
     * @throws {Error} If username or email already exists, or email is banned
     */
    async initiateRegistration(userData) {
        const { username, email, password, full_name, dob } = userData;

        // Check if username already exists
        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            const error = new Error('Username already exists');
            error.statusCode = 409;
            throw error;
        }

        // Check if email already exists
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            // SECURITY: If email belongs to a banned user, block registration
            if (existingEmail.status === 'banned') {
                const error = new Error('This email has been banned and cannot be used for registration');
                error.statusCode = 403;
                throw error;
            }
            
            // If email belongs to an inactive user, tell them to login to reactivate
            if (existingEmail.status === 'inactive') {
                const error = new Error('This email has an inactive account. Please login to reactivate.');
                error.statusCode = 409;
                throw error;
            }
            
            // For active users, just say email exists
            const error = new Error('Email already exists');
            error.statusCode = 409;
            throw error;
        }

        // Create OTP session and send email
        const otpResult = await otpService.createRegistrationSession({
            username,
            email,
            password,
            full_name,
            dob
        });

        return otpResult;
    }

    /**
     * Step 2: Verify OTP and complete registration
     * @param {string} otpSessionId 
     * @param {string} otpCode 
     * @returns {Promise<Object>} {token, user}
     */
    async verifyRegistrationOtp(otpSessionId, otpCode) {
        // Verify OTP
        const verifiedData = await otpService.verifyOtp(otpSessionId, otpCode);

        // Double-check username availability (in case someone registered while OTP pending)
        const existingUsername = await User.findByUsername(verifiedData.registrationData.username);
        if (existingUsername) {
            otpService.delete(otpSessionId);
            const error = new Error('Username was taken while verifying. Please register again.');
            error.statusCode = 409;
            throw error;
        }

        // Create user with verified data
        const user = await User.create({
            username: verifiedData.registrationData.username,
            email: verifiedData.email,
            password_hash: verifiedData.registrationData.password_hash,
            full_name: verifiedData.registrationData.full_name,
            dob: verifiedData.registrationData.dob,
            role: 'user',
            status: 'active'
        });

        // Clean up OTP session
        otpService.delete(otpSessionId);

        // Generate token and return
        const token = this.generateToken(user);

        return {
            token,
            user
        };
    }

    /**
     * Resend OTP for registration
     * @param {string} otpSessionId 
     * @returns {Promise<Object>} {otpSessionId, maskedEmail, otpExpiresIn}
     */
    async resendRegistrationOtp(otpSessionId) {
        return await otpService.resendOtp(otpSessionId);
    }

    /**
     * Authenticate user and generate token
     * @param {string} username - User username
     * @param {string} password - User password
     * @returns {Promise<Object>} Object containing token and user info, or OTP session for reactivation
     * @throws {Error} If credentials are invalid or account is banned
     */
    async login(username, password) {
        // Find user by username
        const user = await User.findByUsername(username);
        if (!user) {
            const error = new Error('Invalid username or password');
            error.statusCode = 401;
            throw error;
        }

        // Check if user is banned
        if (user.status === 'banned') {
            const error = new Error('Your account has been banned');
            error.statusCode = 403;
            throw error;
        }

        // Verify password first
        const isPasswordValid = await this.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            const error = new Error('Invalid username or password');
            error.statusCode = 401;
            throw error;
        }

        // Check if user is inactive
        // Only check 14-day inactivity if last_login exists (not first login)
        const INACTIVE_DAYS = parseInt(process.env.INACTIVE_DAYS) || 14;
        let needsReactivation = user.status === 'inactive';

        // If user has logged in before, check if inactive for 14+ days
        if (!needsReactivation && user.last_login) {
            const daysSinceLastLogin = Math.floor(
                (Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceLastLogin >= INACTIVE_DAYS) {
                needsReactivation = true;
                // Update status to inactive
                await User.update(user.id, { status: 'inactive' });
            }
        }

        if (needsReactivation) {
            // Create reactivation OTP session
            const otpResult = await otpService.createReactivationSession(user);

            return {
                requiresOtp: true,
                otpSessionId: otpResult.otpSessionId,
                maskedEmail: otpResult.maskedEmail,
                otpExpiresIn: otpResult.otpExpiresIn
            };
        }

        // Generate JWT token for active user
        const token = this.generateToken(user);

        // Update last_login
        await User.updateLastLogin(user.id);

        // Return token and user info (without password)
        const { password_hash, ...userWithoutPassword } = user;

        return {
            token,
            user: userWithoutPassword
        };
    }

    /**
     * Verify OTP and reactivate user account
     * @param {string} otpSessionId 
     * @param {string} otpCode 
     * @returns {Promise<Object>} {token, user}
     */
    async verifyReactivationOtp(otpSessionId, otpCode) {
        // Verify OTP
        const verifiedData = await otpService.verifyOtp(otpSessionId, otpCode);

        if (verifiedData.type !== 'reactivate') {
            const error = new Error('Invalid OTP session type');
            error.statusCode = 400;
            throw error;
        }

        // Reactivate user
        const user = await User.update(verifiedData.userId, { status: 'active' });
        await User.updateLastLogin(verifiedData.userId);

        // Clean up OTP session
        otpService.delete(otpSessionId);

        // Generate token
        const token = this.generateToken(user);

        return {
            token,
            user
        };
    }

    /**
     * Hash password using bcrypt
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hashed password
     */
    async hashPassword(password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Verify password against hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} True if password matches
     */
    async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Generate JWT token for user
     * @param {Object} user - User object
     * @returns {string} JWT token
     */
    generateToken(user) {
        return jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }

    /**
     * Initiate forgot password - send OTP to email
     * @param {string} email - User email
     * @returns {Promise<Object>} {otpSessionId, maskedEmail, otpExpiresIn}
     */
    async forgotPassword(email) {
        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            const error = new Error('Email not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if user is banned
        if (user.status === 'banned') {
            const error = new Error('This account has been banned');
            error.statusCode = 403;
            throw error;
        }

        // Create password reset OTP session
        const otpResult = await otpService.createPasswordResetSession(user);

        return otpResult;
    }

    /**
     * Reset password with OTP verification
     * @param {string} otpSessionId 
     * @param {string} otpCode 
     * @param {string} newPassword 
     * @returns {Promise<Object>} {message}
     */
    async resetPassword(otpSessionId, otpCode, newPassword) {
        // Verify OTP
        const verifiedData = otpService.verifyOtp(otpSessionId, otpCode);

        if (verifiedData.type !== 'resetPassword') {
            const error = new Error('Invalid OTP session type');
            error.statusCode = 400;
            throw error;
        }

        // Hash new password
        const password_hash = await this.hashPassword(newPassword);

        // Update user password
        await User.update(verifiedData.userId, { password_hash });

        // If user was inactive, reactivate them
        const user = await User.findById(verifiedData.userId);
        if (user.status === 'inactive') {
            await User.update(verifiedData.userId, { status: 'active' });
        }

        // Clean up OTP session
        otpService.delete(otpSessionId);

        return null;
    }
}

module.exports = new AuthService();

