const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */

const authenticateJWT = (req, res, next) => {
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

        // Attach user info to request
        req.user = {
            id: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role
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
