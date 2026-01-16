const db = require('../config/database');

/**
 * GameSession Model
 * Handles all database operations related to game sessions
 */

class GameSession {
    /**
     * Complete a game session and update rankings
     * @param {number} userId 
     * @param {Object} data - { game_id, result, score, moves_count, time_elapsed, game_state, settings }
     * @returns {Promise<Object>} - Created session
     */
    static async complete(userId, data) {
        const trx = await db.transaction();

        try {
            // 1. Insert completed session
            const [session] = await trx('game_sessions')
                .insert({
                    user_id: userId,
                    game_id: data.game_id,
                    game_state: JSON.stringify(data.game_state || {}),
                    result: data.result,
                    score: data.score || 0,
                    moves_count: data.moves_count || 0,
                    time_elapsed: data.time_elapsed || 0,
                    status: 'completed',
                    settings: data.settings ? JSON.stringify(data.settings) : null,
                    started_at: data.started_at || trx.fn.now(),
                    ended_at: trx.fn.now()
                })
                .returning('*');

            // 2. Update or create ranking record
            const existingRanking = await trx('rankings')
                .where({ user_id: userId, game_id: data.game_id })
                .first();

            if (existingRanking) {
                // Update existing ranking
                const newTotalGames = existingRanking.total_games + 1;
                const newTotalWins = existingRanking.total_wins + (data.result === 'win' ? 1 : 0);
                const newTotalLosses = existingRanking.total_losses + (data.result === 'loss' ? 1 : 0);
                const newTotalDraws = existingRanking.total_draws + (data.result === 'draw' ? 1 : 0);
                const newTotalScore = existingRanking.total_score + (data.score || 0);
                const newBestScore = Math.max(existingRanking.best_score, data.score || 0);
                const newWinRate = (newTotalWins / newTotalGames * 100).toFixed(2);

                await trx('rankings')
                    .where({ user_id: userId, game_id: data.game_id })
                    .update({
                        total_games: newTotalGames,
                        total_wins: newTotalWins,
                        total_losses: newTotalLosses,
                        total_draws: newTotalDraws,
                        total_score: newTotalScore,
                        best_score: newBestScore,
                        win_rate: newWinRate,
                        updated_at: trx.fn.now()
                    });
            } else {
                // Create new ranking
                await trx('rankings')
                    .insert({
                        user_id: userId,
                        game_id: data.game_id,
                        total_games: 1,
                        total_wins: data.result === 'win' ? 1 : 0,
                        total_losses: data.result === 'loss' ? 1 : 0,
                        total_draws: data.result === 'draw' ? 1 : 0,
                        total_score: data.score || 0,
                        best_score: data.score || 0,
                        win_rate: data.result === 'win' ? 100.00 : 0.00,
                        created_at: trx.fn.now(),
                        updated_at: trx.fn.now()
                    });
            }

            // 3. Recalculate global rank for this game
            await this.recalculateRanks(trx, data.game_id);

            await trx.commit();

            // Parse JSON fields before returning
            if (session.game_state && typeof session.game_state === 'string') {
                session.game_state = JSON.parse(session.game_state);
            }
            if (session.settings && typeof session.settings === 'string') {
                session.settings = JSON.parse(session.settings);
            }

            return session;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    /**
     * Recalculate global ranks for a specific game
     * @param {Object} trx - Knex transaction
     * @param {number} gameId 
     */
    static async recalculateRanks(trx, gameId) {
        // Get all rankings for this game ordered by total_score DESC
        const rankings = await trx('rankings')
            .where({ game_id: gameId })
            .orderBy('total_score', 'desc')
            .select('id');

        // Update ranks
        for (let i = 0; i < rankings.length; i++) {
            await trx('rankings')
                .where({ id: rankings[i].id })
                .update({ global_rank: i + 1 });
        }
    }

    /**
     * Get user's game history with pagination
     * @param {number} userId 
     * @param {Object} options - { page, limit, game_id, status }
     * @returns {Promise<Object>} - { sessions, pagination }
     */
    static async findByUser(userId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;

        let query = db('game_sessions as gs')
            .join('games as g', 'gs.game_id', 'g.id')
            .where('gs.user_id', userId)
            .select(
                'gs.id',
                'gs.game_id',
                'g.name as game_name',
                'g.type as game_type',
                'g.icon as game_icon',
                'gs.result',
                'gs.score',
                'gs.moves_count',
                'gs.time_elapsed',
                'gs.status',
                'gs.started_at',
                'gs.ended_at'
            );

        let countQuery = db('game_sessions')
            .where('user_id', userId);

        // Filter by game_id
        if (options.game_id) {
            query = query.where('gs.game_id', options.game_id);
            countQuery = countQuery.where('game_id', options.game_id);
        }

        // Filter by status
        if (options.status) {
            query = query.where('gs.status', options.status);
            countQuery = countQuery.where('status', options.status);
        }

        // Get total count
        const [{ count }] = await countQuery.count('id as count');
        const total = parseInt(count);

        // Get paginated sessions
        const sessions = await query
            .orderBy('gs.started_at', 'desc')
            .limit(limit)
            .offset(offset);

        return {
            sessions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get session by ID (with ownership check)
     * @param {string} id - Session UUID
     * @param {number} userId - For ownership validation
     * @returns {Promise<Object|null>}
     */
    static async findById(id, userId = null) {
        let query = db('game_sessions as gs')
            .join('games as g', 'gs.game_id', 'g.id')
            .where('gs.id', id)
            .select(
                'gs.*',
                'g.name as game_name',
                'g.type as game_type',
                'g.icon as game_icon'
            );

        if (userId) {
            query = query.where('gs.user_id', userId);
        }

        const session = await query.first();

        if (session) {
            // Parse JSON fields
            if (session.game_state && typeof session.game_state === 'string') {
                session.game_state = JSON.parse(session.game_state);
            }
            if (session.settings && typeof session.settings === 'string') {
                session.settings = JSON.parse(session.settings);
            }
        }

        return session;
    }

    /**
     * Save in-progress game state
     * @param {string} id - Session UUID
     * @param {number} userId - For ownership validation
     * @param {Object} data - { game_state, moves_count, time_elapsed }
     * @returns {Promise<Object|null>}
     */
    static async saveState(id, userId, data) {
        const [session] = await db('game_sessions')
            .where({ id, user_id: userId, status: 'in_progress' })
            .update({
                game_state: JSON.stringify(data.game_state),
                moves_count: data.moves_count,
                time_elapsed: data.time_elapsed,
                saved_at: db.fn.now()
            })
            .returning('*');

        if (session) {
            if (session.game_state && typeof session.game_state === 'string') {
                session.game_state = JSON.parse(session.game_state);
            }
            if (session.settings && typeof session.settings === 'string') {
                session.settings = JSON.parse(session.settings);
            }
        }

        return session;
    }

    /**
     * Create a new in-progress session (for games that need resume)
     * @param {number} userId 
     * @param {Object} data - { game_id, game_state, settings }
     * @returns {Promise<Object>}
     */
    static async create(userId, data) {
        const [session] = await db('game_sessions')
            .insert({
                user_id: userId,
                game_id: data.game_id,
                game_state: JSON.stringify(data.game_state || {}),
                settings: data.settings ? JSON.stringify(data.settings) : null,
                status: 'in_progress',
                started_at: db.fn.now()
            })
            .returning('*');

        if (session.game_state && typeof session.game_state === 'string') {
            session.game_state = JSON.parse(session.game_state);
        }
        if (session.settings && typeof session.settings === 'string') {
            session.settings = JSON.parse(session.settings);
        }

        return session;
    }

    /**
     * Delete session (with ownership check)
     * @param {string} id - Session UUID
     * @param {number} userId - For ownership validation
     * @returns {Promise<boolean>}
     */
    static async delete(id, userId) {
        const deleted = await db('game_sessions')
            .where({ id, user_id: userId })
            .del();

        return deleted > 0;
    }
}

module.exports = GameSession;
