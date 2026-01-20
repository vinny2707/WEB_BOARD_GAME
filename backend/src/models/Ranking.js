const db = require('../config/database');

/**
 * Ranking Model
 * Handles all database operations related to game rankings
 */

class Ranking {
    /**
     * Get rankings for a specific game with scope filtering
     * @param {number} gameId 
     * @param {Object} options - { scope, userId, page, limit }
     * @returns {Promise<Object>} - { data, pagination }
     */
    static async getGameRankings(gameId, options = {}) {
        const scope = options.scope || 'global'; // global, friends, personal
        const userId = options.userId;
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        let query = db('rankings as r')
            .join('users as u', 'r.user_id', 'u.id')
            .where('r.game_id', gameId);

        let countQuery = db('rankings')
            .where('game_id', gameId);

        // Apply scope filter
        if (scope === 'friends' && userId) {
            // Get friend IDs (bidirectional)
            const friendships = await db('friends')
                .where(function () {
                    this.where('user_id', userId)
                        .orWhere('friend_id', userId);
                })
                .andWhere('status', 'accepted')
                .select('user_id', 'friend_id');

            const friendIds = friendships.map(f =>
                f.user_id === userId ? f.friend_id : f.user_id
            );

            // Include current user in friends scope
            friendIds.push(userId);

            query = query.whereIn('r.user_id', friendIds);
            countQuery = countQuery.whereIn('user_id', friendIds);
        } else if (scope === 'personal' && userId) {
            query = query.where('r.user_id', userId);
            countQuery = countQuery.where('user_id', userId);
        }

        // Get total count
        const [{ count }] = await countQuery.count('* as count');
        const total = parseInt(count);

        // Build WHERE clause for scope
        let whereClause = 'r.game_id = ?';
        let params = [gameId];

        if (scope === 'friends' && userId) {
            const friendships = await db('friends')
                .where(function () {
                    this.where('user_id', userId)
                        .orWhere('friend_id', userId);
                })
                .andWhere('status', 'accepted')
                .select('user_id', 'friend_id');

            const friendIds = friendships.map(f =>
                f.user_id === userId ? f.friend_id : f.user_id
            );
            friendIds.push(userId);

            whereClause += ' AND r.user_id = ANY(?)';
            params.push(friendIds);
        } else if (scope === 'personal' && userId) {
            whereClause += ' AND r.user_id = ?';
            params.push(userId);
        }

        const result = await db.raw(`
            SELECT 
                ROW_NUMBER() OVER (
                    ORDER BY r.total_score DESC
                ) as rank,
                r.user_id,
                r.total_games,
                r.total_wins,
                r.total_losses,
                r.total_draws,
                r.win_rate,
                r.total_score,
                r.best_score,
                r.created_at,
                r.updated_at,
                u.username,
                u.full_name,
                u.email,
                i.url as avatar_url
            FROM rankings r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN images i ON u.avatar_id = i.id
            WHERE ${whereClause}
            ORDER BY r.total_score DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        const rankings = result.rows;

        // Format data
        const data = rankings.map(r => ({
            rank: parseInt(r.rank),
            user: {
                id: r.user_id,
                username: r.username,
                full_name: r.full_name,
                email: r.email,
                avatar_url: r.avatar_url || null
            },
            stats: {
                total_games: r.total_games,
                total_wins: r.total_wins,
                total_losses: r.total_losses,
                total_draws: r.total_draws,
                win_rate: parseFloat(r.win_rate),
                total_score: r.total_score,
                best_score: r.best_score
            },
            created_at: r.created_at,
            updated_at: r.updated_at
        }));

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get user's ranking in a specific game
     * @param {number} userId 
     * @param {number} gameId 
     * @returns {Promise<Object|null>}
     */
    static async getUserGameRanking(userId, gameId) {
        // Get user's ranking data
        const ranking = await db('rankings')
            .where({ user_id: userId, game_id: gameId })
            .first();

        if (!ranking) {
            return null;
        }

        // Calculate rank (count users with higher total_score)
        // NOTE: Only based on total_score (consistent with global_rank)
        const [{ count }] = await db('rankings')
            .where('game_id', gameId)
            .andWhere('total_score', '>', ranking.total_score)
            .count('* as count');

        const rank = parseInt(count) + 1;

        // Get total players
        const [{ total }] = await db('rankings')
            .where('game_id', gameId)
            .count('* as total');

        const totalPlayers = parseInt(total);
        const percentile = totalPlayers > 0
            ? ((totalPlayers - rank + 1) / totalPlayers * 100).toFixed(1)
            : 0;

        return {
            rank,
            total_players: totalPlayers,
            percentile: parseFloat(percentile),
            stats: {
                total_games: ranking.total_games,
                total_wins: ranking.total_wins,
                total_losses: ranking.total_losses,
                total_draws: ranking.total_draws,
                win_rate: parseFloat(ranking.win_rate),
                total_score: ranking.total_score,
                best_score: ranking.best_score
            },
            created_at: ranking.created_at,
            updated_at: ranking.updated_at
        };
    }

    /**
     * Get all rankings for a user (across all games)
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async getUserRankings(userId) {
        const rankings = await db('rankings as r')
            .join('games as g', 'r.game_id', 'g.id')
            .where('r.user_id', userId)
            .select(
                'r.game_id',
                'g.name as game_name',
                'g.type as game_type',
                'g.icon as game_icon',
                'r.total_games',
                'r.total_wins',
                'r.total_losses',
                'r.total_draws',
                'r.win_rate',
                'r.total_score',
                'r.best_score',
                'r.global_rank',
                'r.created_at',
                'r.updated_at'
            )
            .orderBy('r.total_score', 'desc');

        return rankings.map(r => ({
            game: {
                id: r.game_id,
                name: r.game_name,
                type: r.game_type,
                icon: r.game_icon
            },
            stats: {
                total_games: r.total_games,
                total_wins: r.total_wins,
                total_losses: r.total_losses,
                total_draws: r.total_draws,
                win_rate: parseFloat(r.win_rate),
                total_score: r.total_score,
                best_score: r.best_score
            },
            // NOTE: global_rank is a cached value updated by GameSession.recalculateRanks()
            // It may be slightly stale if new players joined recently
            global_rank: r.global_rank,
            created_at: r.created_at,
            updated_at: r.updated_at
        }));
    }

    /**
     * Get achievement rankings (game_id = 0)
     * @param {Object} options - { scope, userId, page, limit }
     * @returns {Promise<Object>} - { data, pagination }
     */
    static async getAchievementRankings(options = {}) {
        const ACHIEVEMENT_GAME_ID = 0;
        const scope = options.scope || 'global';
        const userId = options.userId;
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        let whereClause = 'r.game_id = ?';
        let params = [ACHIEVEMENT_GAME_ID];

        // Apply scope filter
        if (scope === 'friends' && userId) {
            const friendships = await db('friends')
                .where(function () {
                    this.where('user_id', userId)
                        .orWhere('friend_id', userId);
                })
                .andWhere('status', 'accepted')
                .select('user_id', 'friend_id');

            const friendIds = friendships.map(f =>
                f.user_id === userId ? f.friend_id : f.user_id
            );
            friendIds.push(userId);

            whereClause += ' AND r.user_id = ANY(?)';
            params.push(friendIds);
        }

        // Get total count
        const countResult = await db.raw(`
            SELECT COUNT(*) as count FROM rankings r WHERE ${whereClause}
        `, params);
        const total = parseInt(countResult.rows[0].count);

        // Get rankings with rank calculation
        const result = await db.raw(`
            SELECT 
                ROW_NUMBER() OVER (ORDER BY r.total_score DESC) as rank,
                r.user_id,
                r.total_score as achievement_points,
                r.created_at,
                r.updated_at,
                u.username,
                u.full_name,
                i.url as avatar_url
            FROM rankings r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN images i ON u.avatar_id = i.id
            WHERE ${whereClause}
            ORDER BY r.total_score DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        const rankings = result.rows;

        const data = rankings.map(r => ({
            rank: parseInt(r.rank),
            user: {
                id: r.user_id,
                username: r.username,
                full_name: r.full_name,
                avatar_url: r.avatar_url || null
            },
            achievement_points: r.achievement_points || 0,
            created_at: r.created_at,
            updated_at: r.updated_at
        }));

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Update achievement points for a user (upsert)
     * @param {number} userId 
     * @param {number} pointsToAdd - points to add (can be negative to subtract)
     * @returns {Promise<Object>} - updated ranking record
     */
    static async updateAchievementPoints(userId, pointsToAdd) {
        const ACHIEVEMENT_GAME_ID = 0;

        // Check if record exists
        const existing = await db('rankings')
            .where({ user_id: userId, game_id: ACHIEVEMENT_GAME_ID })
            .first();

        if (existing) {
            // Update existing record
            const [updated] = await db('rankings')
                .where({ user_id: userId, game_id: ACHIEVEMENT_GAME_ID })
                .update({
                    total_score: db.raw('total_score + ?', [pointsToAdd]),
                    updated_at: db.fn.now()
                })
                .returning('*');
            return updated;
        } else {
            // Insert new record
            const [inserted] = await db('rankings')
                .insert({
                    user_id: userId,
                    game_id: ACHIEVEMENT_GAME_ID,
                    total_games: 0,
                    total_wins: 0,
                    total_losses: 0,
                    total_draws: 0,
                    win_rate: 0,
                    total_score: pointsToAdd,
                    best_score: pointsToAdd,
                    global_rank: 0,
                    created_at: db.fn.now(),
                    updated_at: db.fn.now()
                })
                .returning('*');
            return inserted;
        }
    }

    /**
     * Get user's achievement ranking
     * @param {number} userId 
     * @returns {Promise<Object|null>}
     */
    static async getUserAchievementRanking(userId) {
        const ACHIEVEMENT_GAME_ID = 0;

        const ranking = await db('rankings')
            .where({ user_id: userId, game_id: ACHIEVEMENT_GAME_ID })
            .first();

        if (!ranking) {
            return null;
        }

        // Calculate rank
        const [{ count }] = await db('rankings')
            .where('game_id', ACHIEVEMENT_GAME_ID)
            .andWhere('total_score', '>', ranking.total_score)
            .count('* as count');

        const rank = parseInt(count) + 1;

        // Get total players
        const [{ total }] = await db('rankings')
            .where('game_id', ACHIEVEMENT_GAME_ID)
            .count('* as total');

        const totalPlayers = parseInt(total);

        return {
            rank,
            total_players: totalPlayers,
            achievement_points: ranking.total_score,
            created_at: ranking.created_at,
            updated_at: ranking.updated_at
        };
    }
}

module.exports = Ranking;
