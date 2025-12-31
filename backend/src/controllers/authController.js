const authService = require('../services/authService');
const User = require('../models/User');
const { success, error } = require('../utils/response');

/**
 * Authentication Controller
 * Handles HTTP requests for user authentication and profile management
 * Business logic is delegated to authService
 */

// Register new user
const register = async (req, res, next) => {
    try {
        const userData = req.body;

        // Delegate business logic to service
        const user = await authService.register(userData);

        return success(res, user, 'User registered successfully', 201);
    } catch (err) {
        // Handle specific error status codes from service
        if (err.statusCode) {
            return error(res, err.message, err.statusCode);
        }
        next(err);
    }
};

// Login user
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Delegate authentication logic to service
        const result = await authService.login(username, password);

        return success(res, result, 'Login successful');
    } catch (err) {
        // Handle specific error status codes from service
        if (err.statusCode) {
            return error(res, err.message, err.statusCode);
        }
        next(err);
    }
};

// Logout user (client-side token removal)
const logout = async (req, res) => {
    return success(res, null, 'Logout successful');
};

// Get current user profile
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return error(res, 'User not found', 404);
        }

        return success(res, user, 'Profile retrieved successfully');
    } catch (err) {
        next(err);
    }
};

// Update user profile
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { full_name, dob } = req.body;

        // Build update object
        const updateData = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (dob !== undefined) updateData.dob = dob;

        // Update user
        const updatedUser = await User.update(userId, updateData);

        if (!updatedUser) {
            return error(res, 'User not found', 404);
        }

        return success(res, updatedUser, 'Profile updated successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    updateProfile
};
