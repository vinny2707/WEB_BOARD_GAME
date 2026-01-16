const db = require('../config/database');

/**
 * User Model
 * Handles all database operations related to users
 */

class User {
    /**
     * Find user by email (with avatar)
     * @param {string} email 
     * @returns {Promise<Object|null>}
     */
    static async findByEmail(email) {
        return db('users as u')
            .leftJoin('images as i', 'u.avatar_id', 'i.id')
            .where('u.email', email)
            .select('u.*', 'i.url as avatar_url')
            .first();
    }

    /**
     * Find user by username (with avatar)
     * @param {string} username 
     * @returns {Promise<Object|null>}
     */
    static async findByUsername(username) {
        return db('users as u')
            .leftJoin('images as i', 'u.avatar_id', 'i.id')
            .where('u.username', username)
            .select('u.*', 'i.url as avatar_url')
            .first();
    }

    /**
     * Find user by ID (with avatar)
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const user = await db('users as u')
            .leftJoin('images as i', 'u.avatar_id', 'i.id')
            .where('u.id', id)
            .select(
                'u.id', 'u.username', 'u.email', 'u.full_name', 'u.dob', 
                'u.role', 'u.status', 'u.avatar_id', 'u.created_at', 'u.last_login',
                'i.url as avatar_url'
            )
            .first();
        return user;
    }

    /**
     * Create new user
     * @param {Object} userData 
     * @returns {Promise<Object>}
     */
    static async create(userData) {
        const [user] = await db('users')
            .insert(userData)
            .returning(['id', 'username', 'email', 'full_name', 'dob', 'role', 'status', 'avatar_id', 'created_at']);

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
            .returning(['id', 'username', 'email', 'full_name', 'dob', 'role', 'status', 'avatar_id', 'updated_at']);

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
     * Get all users with avatar (admin only)
     * @param {Object} filters 
     * @returns {Promise<Array>}
     */
    static async findAll(filters = {}) {
        let query = db('users as u')
            .leftJoin('images as i', 'u.avatar_id', 'i.id')
            .select(
                'u.id', 'u.username', 'u.email', 'u.full_name', 
                'u.role', 'u.status', 'u.avatar_id', 'u.created_at', 'u.last_login',
                'i.url as avatar_url'
            );

        if (filters.status) {
            query = query.where('u.status', filters.status);
        }

        if (filters.role) {
            query = query.where('u.role', filters.role);
        }

        return query;
    }
}

module.exports = User;
