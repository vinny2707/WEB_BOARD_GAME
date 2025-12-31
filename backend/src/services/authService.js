const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Service
 * Handles all business logic for user authentication and registration
 */

class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Created user object
     * @throws {Error} If username or email already exists
     */
    async register(userData) {
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
            const error = new Error('Email already exists');
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const password_hash = await this.hashPassword(password);

        // Create user
        const user = await User.create({
            username,
            email,
            password_hash,
            full_name: full_name || null,
            dob: dob || null,
            role: 'user',
            status: 'active'
        });

        return user;
    }

    /**
     * Authenticate user and generate token
     * @param {string} username - User username
     * @param {string} password - User password
     * @returns {Promise<Object>} Object containing token and user info
     * @throws {Error} If credentials are invalid or account is inactive
     */
    async login(username, password) {
        // Find user by username
        const user = await User.findByUsername(username);
        if (!user) {
            const error = new Error('Invalid username or password');
            error.statusCode = 401;
            throw error;
        }

        // Check if user is active
        if (user.status !== 'active') {
            const error = new Error('Account is inactive or banned');
            error.statusCode = 403;
            throw error;
        }

        // Verify password
        const isPasswordValid = await this.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            const error = new Error('Invalid username or password');
            error.statusCode = 401;
            throw error;
        }

        // Generate JWT token
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
}

module.exports = new AuthService();
