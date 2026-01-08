const { error } = require('../utils/response');

/**
 * Role-based Authorization Middleware
 * Restricts access to routes based on user roles
 * 
 * Available roles: 'admin', 'user'
 * 
 * Usage:
 *   router.get('/admin', authenticateJWT, authorize('admin'), adminController.dashboard);
 *   router.get('/all', authenticateJWT, authorize('admin', 'user'), handler);
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

module.exports = {
    authorize,
    adminOnly
};
