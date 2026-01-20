/**
 * Global error handling middleware
 */

const errorHandler = (err, req, res, next) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';

    // Knex/Database errors
    if (err.code === '23505') {
        // Unique constraint violation
        statusCode = 409;
        message = 'Resource already exists';
    } else if (err.code === '23503') {
        // Foreign key violation
        statusCode = 400;
        message = 'Invalid reference';
    } else if (err.code === '22P02') {
        // Invalid input syntax
        statusCode = 400;
        message = 'Invalid input format';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
