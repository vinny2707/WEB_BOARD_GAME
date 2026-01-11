require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const errorHandler = require('./src/middleware/errorHandler');
const { swaggerUi, swaggerSpec } = require('./src/config/swagger');
const logger = require('./src/utils/logger');

// ============================================
// SECURITY: Critical Environment Validation
// ============================================
if (!process.env.JWT_SECRET) {
    logger.error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
    logger.error('Please set JWT_SECRET in your .env file');
    process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
    logger.warn('JWT_SECRET should be at least 32 characters for security');
}

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging (morgan with custom format)
morgan.token('colored-status', (req, res) => {
    const status = res.statusCode;
    const colors = {
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        red: '\x1b[31m',
        reset: '\x1b[0m'
    };
    let color = colors.green;
    if (status >= 400) color = colors.yellow;
    if (status >= 500) color = colors.red;
    return `${color}${status}${colors.reset}`;
});

morgan.token('colored-method', (req) => {
    const method = req.method;
    const colors = {
        GET: '\x1b[32m',
        POST: '\x1b[34m',
        PUT: '\x1b[33m',
        PATCH: '\x1b[33m',
        DELETE: '\x1b[31m',
        reset: '\x1b[0m'
    };
    const color = colors[method] || '\x1b[37m';
    return `${color}${method.padEnd(7)}${colors.reset}`;
});

app.use(morgan(':colored-method :url :colored-status :response-time ms', {
    skip: (req) => req.url === '/health' // Skip logging health checks
}));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const gameRoutes = require('./src/routes/games');
const sessionRoutes = require('./src/routes/sessions');
const achievementRoutes = require('./src/routes/achievements');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/achievements', achievementRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler (must be last)
app.use(errorHandler);

// SSL Configuration
const sslOptions = {};
const sslPath = path.join(__dirname, 'ssl');

try {
    if (fs.existsSync(path.join(sslPath, 'key.pem')) && fs.existsSync(path.join(sslPath, 'cert.pem'))) {
        sslOptions.key = fs.readFileSync(path.join(sslPath, 'key.pem'));
        sslOptions.cert = fs.readFileSync(path.join(sslPath, 'cert.pem'));
    }
} catch (err) {
    logger.warn('Could not read SSL certificates, falling back to HTTP');
}

let server;
const isHttps = Object.keys(sslOptions).length > 0;

if (isHttps) {
    server = https.createServer(sslOptions, app);
} else {
    server = http.createServer(app);
}

// Start server
server.listen(PORT, () => {
    const protocol = isHttps ? 'https' : 'http';
    logger.success(`Server is running on port ${PORT} (${protocol})`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    logger.info(`API Documentation: ${protocol}://localhost:${PORT}/api-docs`);
});

module.exports = app;
