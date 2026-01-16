const db = require('../config/database');

/**
 * Image Model
 * Handles database operations for image URLs
 */

class Image {
    /**
     * Create a new image record
     * @param {Object} data - { url, uploaded_by }
     * @returns {Promise<Object>}
     */
    static async create(data) {
        const [id] = await db('images')
            .insert({
                url: data.url,
                uploaded_by: data.uploadedBy || null
            })
            .returning('id');

        return this.findById(typeof id === 'object' ? id.id : id);
    }

    /**
     * Find image by ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        return db('images')
            .where({ id })
            .first();
    }

    /**
     * Find all images uploaded by a user
     * @param {number} userId 
     * @param {Object} options - { page, limit }
     * @returns {Promise<Object>}
     */
    static async findByUser(userId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 20;
        const offset = (page - 1) * limit;

        const [{ count: total }] = await db('images')
            .where('uploaded_by', userId)
            .count('id as count');

        const images = await db('images')
            .where('uploaded_by', userId)
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);

        return {
            images,
            pagination: {
                page,
                limit,
                total: parseInt(total),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Delete an image
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const deleted = await db('images')
            .where({ id })
            .del();
        return deleted > 0;
    }
}

module.exports = Image;
