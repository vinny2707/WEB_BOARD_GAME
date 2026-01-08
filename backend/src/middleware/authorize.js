const { error } = require('../utils/response');

/**
 * Role-based Authorization Middleware
 * Restricts access to routes based on user roles
 * 
 * Usage:
 *   router.get('/admin', authenticateJWT, authorize('admin'), adminController.dashboard);
 *   router.get('/mod', authenticateJWT, authorize('admin', 'moderator'), modController.panel);
 * 
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure user is authenticated first
        if (!req.user) {
            return error(res, 'Authentication required', 401);
        }

        // Check if user's role is in the allowed roles list
        if (!allowedRoles.includes(req.user.role)) {
            return error(res, 'Access denied. Insufficient permissions.', 403);
        }

        next();
    };
};

/**
 * Admin-only middleware (shorthand for authorize('admin'))
 */
const adminOnly = authorize('admin');

/**
 * Moderator and Admin middleware (shorthand for authorize('admin', 'moderator'))
 */
const moderatorOrAdmin = authorize('admin', 'moderator');

module.exports = {
    authorize,
    adminOnly,
    moderatorOrAdmin
};
