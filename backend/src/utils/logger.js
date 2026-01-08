/**
 * Logger Utility
 * Provides colored console logging with timestamps for consistent logging across the app
 */

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    // Text colors
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m'
};

/**
 * Get formatted timestamp
 * @returns {string} Formatted timestamp [HH:MM:SS]
 */
const getTimestamp = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `[${hours}:${minutes}:${seconds}]`;
};

/**
 * Format log message with color and timestamp
 */
const formatMessage = (level, color, message, ...args) => {
    const timestamp = `${colors.gray}${getTimestamp()}${colors.reset}`;
    const levelTag = `${color}[${level}]${colors.reset}`;
    return { timestamp, levelTag, message, args };
};

const logger = {
    /**
     * Info log - General information
     * @param {string} message 
     * @param {...any} args 
     */
    info: (message, ...args) => {
        const { timestamp, levelTag } = formatMessage('INFO', colors.blue, message, ...args);
        console.log(`${timestamp} ${levelTag} ${message}`, ...args);
    },

    /**
     * Success log - Successful operations
     * @param {string} message 
     * @param {...any} args 
     */
    success: (message, ...args) => {
        const { timestamp, levelTag } = formatMessage('SUCCESS', colors.green, message, ...args);
        console.log(`${timestamp} ${levelTag} ✅ ${message}`, ...args);
    },

    /**
     * Warning log - Non-critical issues
     * @param {string} message 
     * @param {...any} args 
     */
    warn: (message, ...args) => {
        const { timestamp, levelTag } = formatMessage('WARN', colors.yellow, message, ...args);
        console.warn(`${timestamp} ${levelTag} ⚠️  ${message}`, ...args);
    },

    /**
     * Error log - Critical errors
     * @param {string} message 
     * @param {...any} args 
     */
    error: (message, ...args) => {
        const { timestamp, levelTag } = formatMessage('ERROR', colors.red, message, ...args);
        console.error(`${timestamp} ${levelTag} ❌ ${message}`, ...args);
    },

    /**
     * Debug log - Only shows in development
     * @param {string} message 
     * @param {...any} args 
     */
    debug: (message, ...args) => {
        if (process.env.NODE_ENV === 'development') {
            const { timestamp, levelTag } = formatMessage('DEBUG', colors.magenta, message, ...args);
            console.log(`${timestamp} ${levelTag} 🔍 ${message}`, ...args);
        }
    },

    /**
     * HTTP log - For request/response logging
     * @param {string} method - HTTP method
     * @param {string} url - Request URL
     * @param {number} status - Response status code
     * @param {string} time - Response time
     */
    http: (method, url, status, time) => {
        const methodColors = {
            GET: colors.green,
            POST: colors.blue,
            PUT: colors.yellow,
            PATCH: colors.yellow,
            DELETE: colors.red
        };
        const methodColor = methodColors[method] || colors.white;
        
        let statusColor = colors.green;
        if (status >= 400) statusColor = colors.yellow;
        if (status >= 500) statusColor = colors.red;

        const timestamp = `${colors.gray}${getTimestamp()}${colors.reset}`;
        const methodTag = `${methodColor}${method.padEnd(7)}${colors.reset}`;
        const statusTag = `${statusColor}${status}${colors.reset}`;
        const timeTag = `${colors.gray}${time}${colors.reset}`;
        
        console.log(`${timestamp} ${methodTag} ${url} ${statusTag} ${timeTag}`);
    },

    /**
     * Database log - For database operations  
     * @param {string} operation - DB operation type
     * @param {string} table - Table name
     * @param {string} details - Additional details
     */
    db: (operation, table, details = '') => {
        const { timestamp, levelTag } = formatMessage('DB', colors.cyan, '');
        console.log(`${timestamp} ${levelTag} 🗄️  ${operation.toUpperCase()} ${table} ${details}`);
    }
};

module.exports = logger;
