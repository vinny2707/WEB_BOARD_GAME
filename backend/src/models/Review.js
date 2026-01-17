const db = require('../config/database');

/**
 * Review Model
 * Handles all database operations related to game reviews
 */

class Review {
    /**
     * Get reviews by game ID (Paginated with filters and sorting)
     * @param {number} gameId 
     * @param {Object} options - { page, limit, sort, rating, minRating }
     * @returns {Promise<Array>}
     */
    static async findByGameId(gameId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        const sort = options.sort || 'newest';
        const rating = options.rating ? parseInt(options.rating) : null;
        const minRating = options.minRating ? parseInt(options.minRating) : null;

        // Build query
        let query = db('reviews')
            .join('users', 'reviews.user_id', 'users.id')
            .leftJoin('images', 'users.avatar_id', 'images.id')
            .select(
                'reviews.id',
                'reviews.rating',
                'reviews.comment',
                'reviews.created_at',
                'reviews.updated_at',
                'users.id as user_id',
                'users.username',
                'users.full_name',
                'images.url as avatar_url'
            )
            .where('reviews.game_id', gameId);

        // Apply filters
        if (rating) {
            query = query.where('reviews.rating', rating);
        }
        if (minRating) {
            query = query.where('reviews.rating', '>=', minRating);
        }

        // Apply sorting
        switch (sort) {
            case 'oldest':
                query = query.orderBy('reviews.created_at', 'asc');
                break;
            case 'highest':
                query = query.orderBy('reviews.rating', 'desc').orderBy('reviews.created_at', 'desc');
                break;
            case 'lowest':
                query = query.orderBy('reviews.rating', 'asc').orderBy('reviews.created_at', 'desc');
                break;
            case 'newest':
            default:
                query = query.orderBy('reviews.created_at', 'desc');
                break;
        }

        // Fetch reviews
        const reviews = await query
            .limit(limit)
            .offset(offset);

        return reviews;
    }

    /**
     * Check if user has already reviewed a game
     * @param {number} userId 
     * @param {number} gameId 
     * @returns {Promise<Object|null>}
     */
    static async findByUserAndGame(userId, gameId) {
        return db('reviews')
            .where({ user_id: userId, game_id: gameId })
            .first();
    }

    /**
     * Create a new review
     * @param {Object} data - { user_id, game_id, rating, comment }
     * @returns {Promise<Object>}
     */
    static async create(data) {
        const [review] = await db('reviews')
            .insert(data)
            .returning('*');
        return review;
    }

    /**
     * Find review by ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        return db('reviews')
            .where({ id })
            .first();
    }

    /**
     * Update review
     * @param {number} id 
     * @param {Object} data - { rating, comment }
     * @returns {Promise<Object>}
     */
    static async update(id, data) {
        const [review] = await db('reviews')
            .where({ id })
            .update({
                ...data,
                updated_at: db.fn.now()
            })
            .returning('*');
        return review;
    }

    /**
     * Delete review
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const deleted = await db('reviews')
            .where({ id })
            .del();
        return deleted > 0;
    }

    /**
     * Get review stats for a game
     * @param {number} gameId 
     * @returns {Promise<Object>} - { average_rating, total_reviews }
     */
    static async getStats(gameId) {
        const result = await db('reviews')
            .where({ game_id: gameId })
            .select(
                db.raw('count(*)::int as total_reviews'),
                db.raw('avg(rating)::float as average_rating')
            )
            .first();

        return {
            average_rating: parseFloat(result?.average_rating || 0).toFixed(1),
            total_reviews: parseInt(result?.total_reviews || 0)
        };
    }

    /**
     * Get overall system statistics (Admin)
     * @returns {Promise<Object>} - { total_reviews, average_rating, total_games_reviewed, total_users_reviewed }
     */
    static async getOverallStats() {
        const [stats] = await db('reviews')
            .select(
                db.raw('count(*)::int as total_reviews'),
                db.raw('avg(rating)::float as average_rating'),
                db.raw('count(distinct game_id)::int as total_games_reviewed'),
                db.raw('count(distinct user_id)::int as total_users_reviewed')
            );

        return {
            total_reviews: parseInt(stats?.total_reviews || 0),
            average_rating: parseFloat(stats?.average_rating || 0).toFixed(1),
            total_games_reviewed: parseInt(stats?.total_games_reviewed || 0),
            total_users_reviewed: parseInt(stats?.total_users_reviewed || 0)
        };
    }
}

module.exports = Review;
