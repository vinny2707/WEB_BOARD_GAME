const { body, validationResult } = require('express-validator');
const { validationError } = require('../utils/response');

/**
 * Validation middleware using express-validator
 */

// Validate registration input
const validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('full_name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Full name must not exceed 100 characters'),

    body('dob')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date of birth'),

    // Check for validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return validationError(res, errors.array());
        }
        next();
    }
];

// Validate login input
const validateLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    // Check for validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return validationError(res, errors.array());
        }
        next();
    }
];

// Validate profile update
const validateUpdateProfile = [
    body('full_name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Full name must not exceed 100 characters'),

    body('dob')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date of birth'),

    // Check for validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return validationError(res, errors.array());
        }
        next();
    }
];

module.exports = {
    validateRegister,
    validateLogin,
    validateUpdateProfile
};
