const db = require('../config/database');
const eloService = require('../services/eloService');

/**
 * GameSession Model
 * Handles all database operations related to game sessions
 */

class GameSession {
    /**
     * Complete a game session and update rankings with Elo
     * @param {number} userId 
     * @param {Object} data - { session_id, game_id, result, score, moves_count, time_elapsed, game_state, settings }
     *   - session_id: UUID of existing session (optional - if provided, updates existing session)
     *   - game_id: required if no session_id
     *   - settings.difficulty: 'EASY' | 'NORMAL' | 'HARD' (for Elo calculation)
     *   - For memory_cards: score = wrong_flips count
     * @returns {Promise<Object>} - Created/updated session with elo_change stored
     */
    static async complete(userId, data) {
        const trx = await db.transaction();

        try {
            let gameId = data.game_id;
            let existingSession = null;

            // If session_id provided, get the existing session
            if (data.session_id) {
                existingSession = await trx('game_sessions')
                    .where({ id: data.session_id, user_id: userId, status: 'in_progress' })
                    .first();
                
                if (!existingSession) {
                    throw { code: 'SESSION_NOT_FOUND', message: 'Session not found or already completed' };
                }
                
                gameId = existingSession.game_id;
            }

            if (!gameId) {
                throw { code: 'VALIDATION_ERROR', message: 'game_id is required' };
            }

            // 1. Get game type for Elo calculation
            const game = await trx('games')
                .where({ id: gameId })
                .select('type')
                .first();
            
            const gameType = game?.type;
            const difficulty = data.settings?.difficulty || 'NORMAL';

            // 2. Get or create ranking record
            let existingRanking = await trx('rankings')
                .where({ user_id: userId, game_id: gameId })
                .first();

            // Current Elo (total_score is used as Elo, default 1000)
            const currentElo = existingRanking?.total_score || 1000;

            // 3. Calculate Elo change
            const eloResult = eloService.calculateGameElo({
                playerElo: currentElo,
                gameType: gameType,
                difficulty: difficulty,
                result: data.result,
                score: data.score || 0,
                wrongFlips: data.score || 0  // For memory_cards, score = wrong_flips
            });

            // Elo change value to store in score field
            const eloChangeValue = eloResult ? eloResult.change : 0;
            let eloChange = null;
            let session;

            // 4. Insert new session or update existing session
            if (existingSession) {
                // Update existing in-progress session to completed
                const [updatedSession] = await trx('game_sessions')
                    .where({ id: data.session_id })
                    .update({
                        game_state: JSON.stringify(data.game_state || existingSession.game_state),
                        result: data.result,
                        score: eloChangeValue,  // score = elo change (+/-)
                        moves_count: data.moves_count || 0,
                        time_elapsed: data.time_elapsed || 0,
                        status: 'completed',
                        settings: data.settings ? JSON.stringify(data.settings) : existingSession.settings,
                        ended_at: trx.fn.now()
                    })
                    .returning('*');
                session = updatedSession;
            } else {
                // Insert new completed session
                const [newSession] = await trx('game_sessions')
                    .insert({
                        user_id: userId,
                        game_id: gameId,
                        game_state: JSON.stringify(data.game_state || {}),
                        result: data.result,
                        score: eloChangeValue,  // score = elo change (+/-)
                        moves_count: data.moves_count || 0,
                        time_elapsed: data.time_elapsed || 0,
                        status: 'completed',
                        settings: data.settings ? JSON.stringify(data.settings) : null,
                        started_at: data.started_at || trx.fn.now(),
                        ended_at: trx.fn.now()
                    })
                    .returning('*');
                session = newSession;
            }

            // 5. Update or create ranking record
            if (existingRanking) {
                // Update existing ranking
                const newTotalGames = existingRanking.total_games + 1;
                const newTotalWins = existingRanking.total_wins + (data.result === 'win' ? 1 : 0);
                const newTotalLosses = existingRanking.total_losses + (data.result === 'loss' ? 1 : 0);
                const newTotalDraws = existingRanking.total_draws + (data.result === 'draw' ? 1 : 0);
                const newWinRate = (newTotalWins / newTotalGames * 100).toFixed(2);
                
                // Use Elo-based scoring if available, otherwise keep old score
                let newTotalScore = existingRanking.total_score;
                let newBestScore = existingRanking.best_score;
                
                if (eloResult) {
                    // Elo-based: total_score = new Elo rating
                    newTotalScore = eloResult.newElo;
                    newBestScore = Math.max(existingRanking.best_score, eloResult.newElo);
                    eloChange = {
                        previous: currentElo,
                        change: eloResult.change,
                        current: eloResult.newElo
                    };
                } else {
                    // Non-Elo game: add score directly (e.g., drawing_board)
                    newTotalScore = existingRanking.total_score + (data.score || 0);
                    newBestScore = Math.max(existingRanking.best_score, data.score || 0);
                }

                await trx('rankings')
                    .where({ user_id: userId, game_id: gameId })
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
                // Create new ranking with starting Elo
                let initialScore = 1000;  // Starting Elo
                
                if (eloResult) {
                    initialScore = eloResult.newElo;
                    eloChange = {
                        previous: 1000,
                        change: eloResult.change,
                        current: eloResult.newElo
                    };
                } else {
                    initialScore = data.score || 0;
                }

                await trx('rankings')
                    .insert({
                        user_id: userId,
                        game_id: gameId,
                        total_games: 1,
                        total_wins: data.result === 'win' ? 1 : 0,
                        total_losses: data.result === 'loss' ? 1 : 0,
                        total_draws: data.result === 'draw' ? 1 : 0,
                        total_score: initialScore,
                        best_score: initialScore,
                        win_rate: data.result === 'win' ? 100.00 : 0.00,
                        created_at: trx.fn.now(),
                        updated_at: trx.fn.now()
                    });
            }

            // 6. Recalculate global rank for this game
            await this.recalculateRanks(trx, gameId);

            await trx.commit();

            // Parse JSON fields before returning
            if (session.game_state && typeof session.game_state === 'string') {
                session.game_state = JSON.parse(session.game_state);
            }
            if (session.settings && typeof session.settings === 'string') {
                session.settings = JSON.parse(session.settings);
            }

            // Add elo_change details to response (for frontend display)
            session.elo_change_details = eloChange;

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
                'gs.ended_at',
                'gs.saved_at'
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
