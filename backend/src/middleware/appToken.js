const { error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * App API Key Authentication Middleware
 * Validates that requests come from authorized applications (e.g., official frontend)
 * 
 * SECURITY: This prevents unauthorized third-party applications or direct API calls
 * from Postman/curl unless they have the valid app API key.
 * 
 * Used in combination with JWT authentication:
 * - App API Key (X-API-Key): Validates the APPLICATION making the request
 * - JWT Token (Authorization): Validates the USER making the request
 * 
 * Usage: Applied to all /api/* routes
 */

const validateAppToken = (req, res, next) => {
    try {
        // Get app API key from header (case-insensitive)
        const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];

        // Check if API key is provided
        if (!apiKey) {
            logger.warn(`API request without API key from IP: ${req.ip} to ${req.path}`);
            return error(res, 'API key is required. Please provide X-API-Key header.', 401);
        }

        // Validate against environment variable
        const validApiKey = process.env.APP_API_KEY;

        if (!validApiKey) {
            logger.error('FATAL: APP_API_KEY is not configured in environment variables');
            return error(res, 'Server configuration error', 500);
        }

        // Check if API key matches
        if (apiKey !== validApiKey) {
            logger.warn(`Invalid API key attempt from IP: ${req.ip} to ${req.path}`);
            return error(res, 'Invalid API key', 401);
        }

        // API key is valid, proceed to next middleware
        next();
    } catch (err) {
        logger.error('App API key validation error:', err);
        return error(res, 'API key validation failed', 401);
    }
};

/**
 * Optional App API Key Middleware
 * Allows requests with or without API key, but validates if present
 * Useful for public endpoints that benefit from tracking but don't require it
 */
const optionalAppToken = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];

    // If no API key provided, just continue
    if (!apiKey) {
        return next();
    }

    // If provided, validate it
    const validApiKey = process.env.APP_API_KEY;
    if (apiKey !== validApiKey) {
        logger.warn(`Invalid optional API key from IP: ${req.ip}`);
        return error(res, 'Invalid API key', 401);
    }

    next();
};

module.exports = { validateAppToken, optionalAppToken };
