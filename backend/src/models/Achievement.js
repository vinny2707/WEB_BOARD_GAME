const db = require('../config/database');

/**
 * Achievement Model
 * Handles database operations for achievements definitions
 */

class Achievement {
    /**
     * Get all achievements (summary only - no unlock_criteria)
     * @param {Object} options - { category }
     * @returns {Promise<Array>}
     */
    static async findAll(options = {}) {
        let query = db('achievements')
            .select('id', 'name', 'description', 'icon', 'category', 'points', 'created_at')
            .orderBy('category', 'asc')
            .orderBy('points', 'asc');

        if (options.category) {
            query = query.where('category', options.category);
        }

        return query;
    }

    /**
     * Get achievement by ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const achievement = await db('achievements')
            .where({ id })
            .first();

        if (achievement && typeof achievement.unlock_criteria === 'string') {
            achievement.unlock_criteria = JSON.parse(achievement.unlock_criteria);
        }

        return achievement;
    }

    /**
     * Get all achievements WITH unlock_criteria (for internal service use)
     * @returns {Promise<Array>}
     */
    static async findAllWithCriteria() {
        const achievements = await db('achievements')
            .select('*')
            .orderBy('category', 'asc')
            .orderBy('points', 'asc');

        // Parse JSON fields
        return achievements.map(a => ({
            ...a,
            unlock_criteria: typeof a.unlock_criteria === 'string' 
                ? JSON.parse(a.unlock_criteria) 
                : a.unlock_criteria
        }));
    }

    /**
     * Get achievements by category
     * @param {string} category 
     * @returns {Promise<Array>}
     */
    static async findByCategory(category) {
        return this.findAll({ category });
    }
}

module.exports = Achievement;
