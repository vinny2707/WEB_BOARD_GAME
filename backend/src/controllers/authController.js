const authService = require('../services/authService');
const User = require('../models/User');
const { success, error } = require('../utils/response');

/**
 * Authentication Controller
 * Handles HTTP requests for user authentication and profile management
 * Business logic is delegated to authService
 */

// Step 1: Initiate registration - send OTP
const register = async (req, res, next) => {
    try {
        const userData = req.body;

        // Initiate registration and send OTP
        const result = await authService.initiateRegistration(userData);

        return success(res, result, 'OTP sent to your email. Please verify to complete registration.', 200);
    } catch (err) {
        if (err.statusCode) {
            return error(res, err.message, err.statusCode);
        }
        next(err);
    }
};

// Step 2: Verify OTP and complete registration
const verifyOtp = async (req, res, next) => {
    try {
        const { otpSessionId, otpCode } = req.body;

        if (!otpSessionId || !otpCode) {
            return error(res, 'otpSessionId and otpCode are required', 400);
        }

        // Verify OTP and create user
        const result = await authService.verifyRegistrationOtp(otpSessionId, otpCode);

        return success(res, result, 'Email verified successfully. Registration complete!', 201);
    } catch (err) {
        if (err.statusCode) {
            return error(res, err.message, err.statusCode);
        }
        next(err);
    }
};

// Resend OTP
const resendOtp = async (req, res, next) => {
    try {
        const { otpSessionId } = req.body;

        if (!otpSessionId) {
            return error(res, 'otpSessionId is required', 400);
        }

        const result = await authService.resendRegistrationOtp(otpSessionId);

        return success(res, result, 'New OTP sent to your email.', 200);
    } catch (err) {
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
    verifyOtp,
    resendOtp,
    login,
    logout,
    getProfile,
    updateProfile
};

