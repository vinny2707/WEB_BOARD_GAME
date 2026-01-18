const db = require('../config/database');

/**
 * Achievement Model
 * Handles database operations for achievements definitions
 */

class Achievement {
    /**
     * Get all achievements with pagination, filter, sort, search
     * @param {Object} options - { category, page, limit, sortBy, sortOrder, search }
     * @returns {Promise<Object>} - { achievements, pagination }
     */
    static async findAll(options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        const sortBy = options.sortBy || 'category';
        const sortOrder = options.sortOrder || 'asc';
        const search = options.search || '';

        // Function to apply common filters
        const applyFilters = (query) => {
            if (options.category) {
                query = query.where('category', options.category);
            }
            if (search) {
                query = query.where(function() {
                    this.whereILike('name', `%${search}%`)
                        .orWhereILike('description', `%${search}%`);
                });
            }
            return query;
        };

        // Get total count
        let countQuery = applyFilters(db('achievements'));
        const countResult = await countQuery.count('id as count').first();
        const total = parseInt(countResult?.count || 0);

        // Build data query
        let query = db('achievements')
            .select('id', 'name', 'description', 'icon', 'category', 'points', 'created_at');
        
        query = applyFilters(query);

        // Apply sorting
        const validSortFields = ['category', 'points', 'name', 'created_at'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'category';
        const sortDirection = sortOrder === 'desc' ? 'desc' : 'asc';
        
        query = query.orderBy(sortField, sortDirection);
        if (sortField !== 'points') {
            query = query.orderBy('points', 'asc');
        }

        // Apply pagination
        query = query.limit(limit).offset(offset);

        const achievements = await query;
        const totalPages = Math.ceil(total / limit);

        return {
            achievements,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
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

    /**
     * Create new achievement (Admin only)
     * @param {Object} data - { name, description, icon, category, points, unlock_criteria }
     * @returns {Promise<Object>}
     */
    static async create(data) {
        const [id] = await db('achievements').insert({
            name: data.name,
            description: data.description,
            icon: data.icon || '🏆',
            category: data.category || 'beginner',
            points: data.points || 10,
            unlock_criteria: JSON.stringify(data.unlock_criteria || {}),
            created_at: db.fn.now()
        }).returning('id');

        return this.findById(typeof id === 'object' ? id.id : id);
    }

    /**
     * Update achievement (Admin only)
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Object|null>}
     */
    static async update(id, data) {
        const updateData = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.points !== undefined) updateData.points = data.points;
        if (data.unlock_criteria !== undefined) {
            updateData.unlock_criteria = JSON.stringify(data.unlock_criteria);
        }

        if (Object.keys(updateData).length === 0) {
            return this.findById(id);
        }

        await db('achievements').where({ id }).update(updateData);
        return this.findById(id);
    }

    /**
     * Delete achievement (Admin only)
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        // Also delete user achievements for this achievement
        await db('user_achievements').where({ achievement_id: id }).delete();
        const deleted = await db('achievements').where({ id }).delete();
        return deleted > 0;
    }
}

module.exports = Achievement;
