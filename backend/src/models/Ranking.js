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

        // Get rankings with dynamic rank calculation
        const rankings = await query
            .select(
                'r.user_id',
                'u.username',
                'u.full_name',
                'u.email',
                'r.total_games',
                'r.total_wins',
                'r.total_losses',
                'r.total_draws',
                'r.win_rate',
                'r.total_score',
                'r.best_score',
                'r.created_at',
                'r.updated_at'
            )
            .orderBy('r.total_score', 'desc')
            .orderBy('r.best_score', 'desc')
            .orderBy('r.total_wins', 'desc')
            .limit(limit)
            .offset(offset);

        // Calculate ranks based on current page
        const data = rankings.map((r, index) => ({
            rank: offset + index + 1,
            user: {
                id: r.user_id,
                username: r.username,
                full_name: r.full_name,
                email: r.email
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

        // Calculate rank (count users with higher scores)
        const [{ count }] = await db('rankings')
            .where('game_id', gameId)
            .andWhere(function () {
                this.where('total_score', '>', ranking.total_score)
                    .orWhere(function () {
                        this.where('total_score', ranking.total_score)
                            .andWhere('best_score', '>', ranking.best_score);
                    })
                    .orWhere(function () {
                        this.where('total_score', ranking.total_score)
                            .andWhere('best_score', ranking.best_score)
                            .andWhere('total_wins', '>', ranking.total_wins);
                    });
            })
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
            global_rank: r.global_rank,
            created_at: r.created_at,
            updated_at: r.updated_at
        }));
    }
}

module.exports = Ranking;
