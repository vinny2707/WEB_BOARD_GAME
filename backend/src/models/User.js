const db = require('../config/database');

/**
 * User Model
 * Handles all database operations related to users
 */

class User {
    /**
     * Find user by email
     * @param {string} email 
     * @returns {Promise<Object|null>}
     */
    static async findByEmail(email) {
        return db('users')
            .where({ email })
            .first();
    }

    /**
     * Find user by username
     * @param {string} username 
     * @returns {Promise<Object|null>}
     */
    static async findByUsername(username) {
        return db('users')
            .where({ username })
            .first();
    }

    /**
     * Find user by ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        return db('users')
            .where({ id })
            .select('id', 'username', 'email', 'full_name', 'dob', 'role', 'status', 'created_at', 'last_login')
            .first();
    }

    /**
     * Create new user
     * @param {Object} userData 
     * @returns {Promise<Object>}
     */
    static async create(userData) {
        const [user] = await db('users')
            .insert(userData)
            .returning(['id', 'username', 'email', 'full_name', 'dob', 'role', 'status', 'created_at']);

        return user;
    }

    /**
     * Update user by ID
     * @param {number} id 
     * @param {Object} updateData 
     * @returns {Promise<Object>}
     */
    static async update(id, updateData) {
        const [user] = await db('users')
            .where({ id })
            .update({
                ...updateData,
                updated_at: db.fn.now()
            })
            .returning(['id', 'username', 'email', 'full_name', 'dob', 'role', 'status', 'updated_at']);

        return user;
    }

    /**
     * Update last login timestamp
     * @param {number} id 
     * @returns {Promise<void>}
     */
    static async updateLastLogin(id) {
        await db('users')
            .where({ id })
            .update({ last_login: db.fn.now() });
    }

    /**
     * Delete user by ID (soft delete by setting status)
     * @param {number} id 
     * @returns {Promise<void>}
     */
    static async delete(id) {
        await db('users')
            .where({ id })
            .update({ status: 'inactive' });
    }

    /**
     * Permanently delete user by ID (hard delete)
     * @param {number} id 
     * @returns {Promise<void>}
     */
    static async hardDelete(id) {
        await db('users')
            .where({ id })
            .del();
    }

    /**
     * Get all users (admin only)
     * @param {Object} filters 
     * @returns {Promise<Array>}
     */
    static async findAll(filters = {}) {
        let query = db('users')
            .select('id', 'username', 'email', 'full_name', 'role', 'status', 'created_at', 'last_login');

        if (filters.status) {
            query = query.where({ status: filters.status });
        }

        if (filters.role) {
            query = query.where({ role: filters.role });
        }

        return query;
    }
}

module.exports = User;
