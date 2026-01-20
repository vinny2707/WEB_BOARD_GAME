const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Board Game API',
            version: '1.0.0',
            description: 'API documentation for Board Game website',
            contact: {
                name: 'API Support',
                email: 'support@boardgame.com'
            }
        },
        servers: (() => {
            const servers = [];
            
            // 1. Custom Domain (highest priority) - set API_BASE_URL in Railway
            if (process.env.API_BASE_URL) {
                servers.push({
                    url: process.env.API_BASE_URL,
                    description: 'Production Server (Custom Domain)'
                });
            }
            
            // 2. Railway Public Domain (auto-set by Railway)
            if (process.env.RAILWAY_PUBLIC_DOMAIN) {
                servers.push({
                    url: `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`,
                    description: 'Production Server (Railway)'
                });
            }
            
            // 3. Local Development (fallback if no production env)
            if (servers.length === 0) {
                servers.push(
                    {
                        url: 'https://localhost:3000',
                        description: 'Development Server (HTTPS)'
                    },
                    {
                        url: 'http://localhost:3000',
                        description: 'Development Server (HTTP)'
                    }
                );
            }
            
            return servers;
        })(),
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token'
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                    description: 'Enter API key'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        username: { type: 'string', example: 'testuser' },
                        email: { type: 'string', example: 'test@example.com' },
                        full_name: { type: 'string', example: 'Test User' },
                        dob: { type: 'string', format: 'date', example: '1990-01-01' },
                        role: { type: 'string', enum: ['admin', 'moderator', 'user'], example: 'user' },
                        status: { type: 'string', enum: ['active', 'inactive', 'banned'], example: 'active' },
                        created_at: { type: 'string', format: 'date-time' },
                        last_login: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' },
                        data: { type: 'null' }
                    }
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Validation failed' },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    msg: { type: 'string' },
                                    param: { type: 'string' },
                                    location: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                Game: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Tic Tac Toe' },
                        type: { type: 'string', example: 'tic_tac_toe' },
                        description: { type: 'string', example: 'Classic 3x3 grid game' },
                        rows: { type: 'integer', example: 3 },
                        cols: { type: 'integer', example: 3 },
                        enabled: { type: 'boolean', example: true },
                        icon: { type: 'string', example: '🎮' },
                        rules: { type: 'string', example: 'Connect 3 in a row to win' },
                        settings: { 
                            type: 'object',
                            example: { winCondition: 3, playerSymbols: ['X', 'O'] }
                        },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                GameSession: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        game_id: { type: 'integer', example: 1 },
                        user_id: { type: 'integer', example: 1 },
                        status: { type: 'string', enum: ['in_progress', 'completed', 'abandoned'], example: 'in_progress' },
                        winner_id: { type: 'integer', nullable: true },
                        board_state: { 
                            type: 'object',
                            example: { grid: [['X', 'O', null], [null, 'X', null], [null, null, 'O']] }
                        },
                        duration_seconds: { type: 'integer', example: 120 },
                        created_at: { type: 'string', format: 'date-time' },
                        completed_at: { type: 'string', format: 'date-time', nullable: true }
                    }
                }
            }
        },
        security: [
            {
                apiKeyAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.js'] // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
