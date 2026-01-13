/**
 * Standardized API response helpers
 */

/**
 * Convert all Date objects and ISO date strings to UTC+7 (Asia/Ho_Chi_Minh)
 * @param {any} data - Data to process
 * @returns {any} - Data with converted dates
 */
const convertDatesToUTC7 = (data) => {
    if (data === null || data === undefined) {
        return data;
    }

    // Handle Date objects
    if (data instanceof Date) {
        return formatToUTC7(data);
    }

    // Handle ISO date strings (e.g., "2026-01-10T08:00:00.000Z")
    if (typeof data === 'string' && isISODateString(data)) {
        return formatToUTC7(new Date(data));
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => convertDatesToUTC7(item));
    }

    // Handle objects
    if (typeof data === 'object') {
        const converted = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                converted[key] = convertDatesToUTC7(data[key]);
            }
        }
        return converted;
    }

    return data;
};

/**
 * Check if string is an ISO date string
 * @param {string} str 
 * @returns {boolean}
 */
const isISODateString = (str) => {
    // Match ISO 8601 date formats
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?$/;
    return isoDateRegex.test(str);
};

/**
 * Format Date to UTC+7 string (Asia/Ho_Chi_Minh timezone)
 * @param {Date} date 
 * @returns {string}
 */
const formatToUTC7 = (date) => {
    // Get UTC+7 offset in milliseconds (7 hours)
    const utc7Offset = 7 * 60 * 60 * 1000;
    const utc7Date = new Date(date.getTime() + utc7Offset);
    
    // Format: "2026-01-10T15:00:00.000+07:00"
    const isoString = utc7Date.toISOString().replace('Z', '+07:00');
    return isoString;
};

const success = (res, data = null, message = 'Success', statusCode = 200) => {
    // Convert all dates in data to UTC+7
    const convertedData = convertDatesToUTC7(data);
    
    return res.status(statusCode).json({
        success: true,
        message,
        data: convertedData
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
    validationError,
    convertDatesToUTC7
};
