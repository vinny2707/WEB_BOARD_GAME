const knex = require('knex');
const knexConfig = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

const testConnection = async () => {
    try {
        await db.raw('SELECT NOW() as time');
        console.log('Database connection established successfully');
        console.log('Connected to Supabase PostgreSQL');
    } catch (error) {
        console.error('Unable to connect to database:', error.message);
        throw error;
    }
};

const closeConnection = async () => {
    try {
        await db.destroy();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
};

module.exports = { db, testConnection, closeConnection };
