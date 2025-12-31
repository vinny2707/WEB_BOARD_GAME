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
        servers: [
            {
                url: 'https://localhost:3000',
                description: 'Development Server (HTTPS)'
            },
            {
                url: 'http://localhost:3000',
                description: 'Development Server (HTTP)'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token'
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
                }
            }
        }
    },
    apis: ['./src/routes/*.js'] // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
