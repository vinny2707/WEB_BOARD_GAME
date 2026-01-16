const User = require('../models/User');
const { success, error } = require('../utils/response');

/**
 * User Controller - Admin only operations
 */

/**
 * Public: Search users for friend functionality
 * GET /api/users
 * Returns only public fields, only active users
 */
const searchUsers = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        // Only get active users
        let users = await User.findAll({ status: 'active' });

        // Search by username, email, or full_name
        if (search) {
            const searchLower = search.toLowerCase();
            users = users.filter(u => 
                u.username.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower) ||
                (u.full_name && u.full_name.toLowerCase().includes(searchLower))
            );
        }

        // Return only public fields
        users = users.map(user => ({
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            email: user.email
        }));

        // Pagination
        const total = users.length;
        const offset = (page - 1) * limit;
        const paginatedUsers = users.slice(offset, offset + parseInt(limit));

        return success(res, {
            users: paginatedUsers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, 'Users retrieved successfully');
    } catch (err) {
        next(err);
    }
};

/**
 * Admin: Get all users with full details
 * GET /api/admin/users
 * Returns ALL fields including role, status, created_at, last_login
 */
const getAllUsersAdmin = async (req, res, next) => {
    try {
        const { status, role, search, page = 1, limit = 10 } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (role) filters.role = role;

        let users = await User.findAll(filters);

        // Search by username or email
        if (search) {
            const searchLower = search.toLowerCase();
            users = users.filter(u => 
                u.username.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower) ||
                (u.full_name && u.full_name.toLowerCase().includes(searchLower))
            );
        }

        // Admin gets ALL fields - no filtering

        // Pagination
        const total = users.length;
        const offset = (page - 1) * limit;
        const paginatedUsers = users.slice(offset, offset + parseInt(limit));

        return success(res, {
            users: paginatedUsers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, 'Users retrieved successfully');
    } catch (err) {
        next(err);
    }
};

// Get user by ID
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return error(res, 'User not found', 404);
        }

        return success(res, user, 'User retrieved successfully');
    } catch (err) {
        next(err);
    }
};

// Change user role
const changeRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['admin', 'user'].includes(role)) {
            return error(res, 'Invalid role. Must be admin or user', 400);
        }

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return error(res, 'User not found', 404);
        }

        // Prevent admin from changing their own role
        if (req.user.id === parseInt(id)) {
            return error(res, 'Cannot change your own role', 403);
        }

        const updatedUser = await User.update(id, { role });

        return success(res, updatedUser, `User role changed to ${role}`);
    } catch (err) {
        next(err);
    }
};

// Change user status (ban/unban/activate)
const changeStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive', 'banned'].includes(status)) {
            return error(res, 'Invalid status. Must be active, inactive, or banned', 400);
        }

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return error(res, 'User not found', 404);
        }

        // Prevent admin from banning themselves
        if (req.user.id === parseInt(id) && status === 'banned') {
            return error(res, 'Cannot ban yourself', 403);
        }

        const updatedUser = await User.update(id, { status });

        const messages = {
            active: 'User activated successfully',
            inactive: 'User deactivated successfully',
            banned: 'User banned successfully'
        };

        return success(res, updatedUser, messages[status]);
    } catch (err) {
        next(err);
    }
};

// Delete user (hard delete - permanent)
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return error(res, 'User not found', 404);
        }

        // Prevent admin from deleting themselves
        if (req.user.id === parseInt(id)) {
            return error(res, 'Cannot delete yourself', 403);
        }

        await User.hardDelete(id);

        return success(res, null, 'User permanently deleted');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    searchUsers,
    getAllUsersAdmin,
    getUserById,
    changeRole,
    changeStatus,
    deleteUser
};
