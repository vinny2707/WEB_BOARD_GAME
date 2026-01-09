const db = require('../config/database');

/**
 * Game Model
 * Handles all database operations related to games
 */

class Game {
    /**
     * Get all games with summary info only
     * Returns all games (including disabled) for admin/FE display
     * @param {Object} options - { page, limit, search, enabled }
     * @returns {Promise<Object>} - { games, pagination }
     */
    static async findAll(options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        let query = db('games')
            .select('id', 'name', 'type', 'description', 'enabled', 'icon');

        let countQuery = db('games');

        // Filter by enabled status if specified
        if (options.enabled !== undefined) {
            const enabledValue = options.enabled === 'true' || options.enabled === true;
            query = query.where('enabled', enabledValue);
            countQuery = countQuery.where('enabled', enabledValue);
        }

        // Search by name or type
        if (options.search) {
            query = query.where(function() {
                this.where('name', 'ilike', `%${options.search}%`)
                    .orWhere('type', 'ilike', `%${options.search}%`);
            });
            countQuery = countQuery.where(function() {
                this.where('name', 'ilike', `%${options.search}%`)
                    .orWhere('type', 'ilike', `%${options.search}%`);
            });
        }

        // Get total count
        const [{ count }] = await countQuery.count('id as count');
        const total = parseInt(count);

        // Get paginated games
        const games = await query
            .orderBy('id', 'asc')
            .limit(limit)
            .offset(offset);

        return {
            games,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get game by ID with full details
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const game = await db('games')
            .where({ id })
            .first();
        
        if (game && game.settings) {
            // Parse settings JSON if it's a string
            if (typeof game.settings === 'string') {
                game.settings = JSON.parse(game.settings);
            }
        }
        
        return game;
    }

    /**
     * Create new game (Admin only)
     * @param {Object} gameData 
     * @returns {Promise<Object>}
     */
    static async create(gameData) {
        // Stringify settings if it's an object
        if (gameData.settings && typeof gameData.settings === 'object') {
            gameData.settings = JSON.stringify(gameData.settings);
        }

        const [game] = await db('games')
            .insert(gameData)
            .returning('*');

        if (game.settings && typeof game.settings === 'string') {
            game.settings = JSON.parse(game.settings);
        }

        return game;
    }

    /**
     * Update game by ID (Admin only)
     * @param {number} id 
     * @param {Object} updateData 
     * @returns {Promise<Object|null>}
     */
    static async update(id, updateData) {
        // Stringify settings if it's an object
        if (updateData.settings && typeof updateData.settings === 'object') {
            updateData.settings = JSON.stringify(updateData.settings);
        }

        const [game] = await db('games')
            .where({ id })
            .update({
                ...updateData,
                updated_at: db.fn.now()
            })
            .returning('*');

        if (game && game.settings && typeof game.settings === 'string') {
            game.settings = JSON.parse(game.settings);
        }

        return game;
    }

    /**
     * Toggle game enabled status (Admin only)
     * @param {number} id 
     * @param {boolean} enabled 
     * @returns {Promise<Object|null>}
     */
    static async toggleEnabled(id, enabled) {
        const [game] = await db('games')
            .where({ id })
            .update({
                enabled,
                updated_at: db.fn.now()
            })
            .returning(['id', 'name', 'type', 'enabled', 'updated_at']);

        return game;
    }

    /**
     * Delete game by ID (Admin only)
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const deleted = await db('games')
            .where({ id })
            .del();
        
        return deleted > 0;
    }
}

module.exports = Game;
