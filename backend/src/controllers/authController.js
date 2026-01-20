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

        // Check if OTP required for reactivation
        if (result.requiresOtp) {
            return success(res, result, 'Account inactive. OTP sent for reactivation.');
        }

        return success(res, result, 'Login successful');
    } catch (err) {
        if (err.statusCode) {
            return error(res, err.message, err.statusCode);
        }
        next(err);
    }
};

// Verify OTP and reactivate inactive account
const verifyReactivationOtp = async (req, res, next) => {
    try {
        const { otpSessionId, otpCode } = req.body;

        if (!otpSessionId || !otpCode) {
            return error(res, 'otpSessionId and otpCode are required', 400);
        }

        // Verify OTP and reactivate user
        const result = await authService.verifyReactivationOtp(otpSessionId, otpCode);

        return success(res, result, 'Account reactivated successfully!', 200);
    } catch (err) {
        if (err.statusCode) {
            return error(res, err.message, err.statusCode);
        }
        next(err);
    }
};

// Logout user (clear token from DB)
const logout = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Clear refresh token from DB
        await User.clearRefreshToken(userId);

        return success(res, null, 'Logout successful');
    } catch (err) {
        next(err);
    }
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
        const { full_name, dob, avatar_id } = req.body;

        // Build update object
        const updateData = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (dob !== undefined) updateData.dob = dob;
        if (avatar_id !== undefined) updateData.avatar_id = avatar_id;

        // Update user
        await User.update(userId, updateData);

        // Get updated user with avatar_url
        const updatedUser = await User.findById(userId);

        if (!updatedUser) {
            return error(res, 'User not found', 404);
        }

        return success(res, updatedUser, 'Profile updated successfully');
    } catch (err) {
        next(err);
    }
};

// Forgot password - send OTP to email
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return error(res, 'Email is required', 400);
        }

        const result = await authService.forgotPassword(email);

        return success(res, result, 'OTP sent to your email for password reset.', 200);
    } catch (err) {
        if (err.statusCode) {
            return error(res, err.message, err.statusCode);
        }
        next(err);
    }
};

// Reset password with OTP
const resetPassword = async (req, res, next) => {
    try {
        const { otpSessionId, otpCode, newPassword } = req.body;

        if (!otpSessionId || !otpCode || !newPassword) {
            return error(res, 'otpSessionId, otpCode, and newPassword are required', 400);
        }

        if (newPassword.length < 6) {
            return error(res, 'Password must be at least 6 characters', 400);
        }

        const result = await authService.resetPassword(otpSessionId, otpCode, newPassword);

        return success(res, result, 'Password reset successfully.', 200);
    } catch (err) {
        if (err.statusCode) {
            return error(res, err.message, err.statusCode);
        }
        next(err);
    }
};

module.exports = {
    register,
    verifyOtp,
    resendOtp,
    login,
    verifyReactivationOtp,
    logout,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword
};

