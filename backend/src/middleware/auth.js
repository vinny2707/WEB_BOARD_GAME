const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 * Verifies JWT token, checks user status from DB, and attaches user info to request
 * 
 * SECURITY: This middleware performs realtime status check to prevent
 * banned/inactive users from using old valid tokens
 */

const authenticateJWT = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return error(res, 'No token provided', 401);
        }

        // Extract token (format: "Bearer <token>")
        const token = authHeader.split(' ')[1];

        if (!token) {
            return error(res, 'Invalid token format', 401);
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // SECURITY: Check user status from database (realtime check)
        // This prevents banned/inactive users from using old valid tokens
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return error(res, 'User not found', 401);
        }

        if (user.status !== 'active') {
            // Provide specific error messages for different statuses
            if (user.status === 'banned') {
                return error(res, 'Your account has been banned', 403);
            }
            if (user.status === 'inactive') {
                return error(res, 'Your account is inactive', 403);
            }
            return error(res, 'Account access denied', 403);
        }

        // Attach user info to request (from DB for most up-to-date info)
        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status
        };

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return error(res, 'Token expired', 401);
        }
        if (err.name === 'JsonWebTokenError') {
            return error(res, 'Invalid token', 401);
        }
        return error(res, 'Authentication failed', 401);
    }
};

module.exports = authenticateJWT;
