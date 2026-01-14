const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /api-docs-login
 * Display login form for API documentation access
 */
router.get('/api-docs-login', (req, res) => {
    // If already authenticated, redirect to docs
    if (req.session && req.session.docsAuthenticated) {
        return res.redirect('/api-docs');
    }

    // Display login form
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation - Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            width: 100%;
            max-width: 400px;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 8px;
        }
        .logo p {
            color: #666;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #333;
            font-weight: 500;
            margin-bottom: 8px;
            font-size: 14px;
        }
        input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        .error-message {
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            display: ${req.query.error ? 'block' : 'none'};
        }
        button {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        button:active {
            transform: translateY(0);
        }
        .footer {
            margin-top: 24px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>Board Game API</h1>
            <p>Documentation Access</p>
        </div>
        
        <div class="error-message">
            Invalid username or password
        </div>
        
        <form method="POST" action="/api-docs-login">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required autofocus>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit">Login</button>
        </form>
        
        <div class="footer">
            Contact your administrator for credentials
        </div>
    </div>
</body>
</html>
    `;
    
    res.send(html);
});

/**
 * POST /api-docs-login
 * Process login form submission
 */
router.post('/api-docs-login', (req, res) => {
    const { username, password } = req.body;

    // Get valid credentials from environment
    const validUsername = process.env.DOCS_USERNAME;
    const validPassword = process.env.DOCS_PASSWORD;

    if (!validUsername || !validPassword) {
        logger.error('FATAL: DOCS_USERNAME or DOCS_PASSWORD not configured');
        return res.status(500).send('Server configuration error');
    }

    // Validate credentials
    if (username === validUsername && password === validPassword) {
        // Set session
        req.session.docsAuthenticated = true;
        logger.info(`Successful docs login: ${username} from IP: ${req.ip}`);
        return res.redirect('/api-docs');
    }

    // Invalid credentials
    logger.warn(`Failed docs login attempt: ${username} from IP: ${req.ip}`);
    return res.redirect('/api-docs-login?error=1');
});

/**
 * GET /api-docs-logout
 * Logout and destroy session
 */
router.get('/api-docs-logout', (req, res) => {
    if (req.session) {
        logger.info(`Docs logout: session ${req.sessionID}`);
        req.session.destroy((err) => {
            if (err) {
                logger.error('Error destroying session:', err);
            }
            res.redirect('/api-docs-login');
        });
    } else {
        res.redirect('/api-docs-login');
    }
});

module.exports = router;
