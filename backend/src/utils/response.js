/**
 * Standardized API response helpers
 */

const success = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const error = (res, message = 'An error occurred', statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null
    });
};

const validationError = (res, errors) => {
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
    });
};

module.exports = {
    success,
    error,
    validationError
};
