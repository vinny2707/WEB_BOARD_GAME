require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const authRoutes = require('./src/routes/auth');
const errorHandler = require('./src/middleware/errorHandler');
const { swaggerUi, swaggerSpec } = require('./src/config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);

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
    console.warn('Could not read SSL certificates, falling back to HTTP');
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
    console.log(`Server is running on port ${PORT} (${protocol})`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`CORS enabled for: ${process.env.CORS_ORIGIN}`);
    console.log(`API Documentation: ${protocol}://localhost:${PORT}/api-docs`);
});

module.exports = app;
