const logger = require('../utils/logger');

/**
 * Session-based Authentication Middleware for API Documentation
 * Protects routes with session check - users must login via /api-docs-login
 */

const requireDocsAuth = (req, res, next) => {
    // Check if user is authenticated via session
    if (req.session && req.session.docsAuthenticated) {
        logger.info(`API docs accessed by authenticated session: ${req.sessionID}`);
        return next();
    }

    // Not authenticated - redirect to login page
    logger.warn(`Unauthenticated access attempt to API docs from IP: ${req.ip}`);
    return res.redirect('/api-docs-login');
};

module.exports = { requireDocsAuth };
